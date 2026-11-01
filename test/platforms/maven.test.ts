import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { maven } from "../../src/platforms";

const mockFetch = vi.fn();
beforeEach(() => vi.stubGlobal("fetch", mockFetch));
afterEach(() => vi.restoreAllMocks());

// Shape of https://repo1.maven.org/maven2/<group path>/<artifact>/maven-metadata.xml
function metadata(versions: string[], release?: string, status = 200) {
  const rel = release ? `<release>${release}</release>` : "";
  const list = versions.map((v) => `<version>${v}</version>`).join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><metadata><versioning>${rel}<versions>${list}</versions></versioning></metadata>`,
    { status },
  );
}

describe("maven", () => {
  it("reads maven-metadata.xml from Maven Central", async () => {
    mockFetch.mockResolvedValueOnce(metadata(["4.2.0", "4.3.0", "4.4.0"], "4.4.0"));

    const res = await maven("org.apache.kafka", "kafka-clients");
    expect(mockFetch.mock.calls[0][0]).toBe(
      "https://repo1.maven.org/maven2/org/apache/kafka/kafka-clients/maven-metadata.xml",
    );
    expect(res).toEqual({
      name: "org.apache.kafka:kafka-clients",
      version: "4.4.0",
      major: "4",
      minor: "4",
      patch: "0",
      date: null,
      platform: "maven",
    });
  });

  it("skips milestones and release candidates, also when <release> is one", async () => {
    mockFetch.mockResolvedValueOnce(
      metadata(["7.0.9", "7.0.10", "7.1.0-M1", "7.1.0-M2", "7.1.0-RC1"], "7.1.0-RC1"),
    );

    const res = await maven("org.springframework", "spring-core");
    expect(res.version).toBe("7.0.10");
  });

  it("skips alpha versions", async () => {
    mockFetch.mockResolvedValueOnce(
      metadata(["2.0.19", "2.0.20", "2.1.0-alpha0", "2.1.0-alpha1"], "2.1.0-alpha1"),
    );

    const res = await maven("org.slf4j", "slf4j-api");
    expect(res.version).toBe("2.0.20");
  });

  it.each(["1.0.0-SNAPSHOT", "1.0.0-beta.2", "1.0.0.CR1", "1.0.0-M3", "1.0.0-rc-1", "1.0.0-preview"])(
    "treats %s as a prerelease",
    async (pre) => {
      mockFetch.mockResolvedValueOnce(metadata(["0.9.0", pre]));
      const res = await maven("g", "a");
      expect(res.version).toBe("0.9.0");
    },
  );

  it("keeps stable qualifiers like -jre and prefers <release> on a tie", async () => {
    mockFetch.mockResolvedValueOnce(
      metadata(
        ["33.7.1-android", "33.7.1-jre", "33.7.2-jre", "33.7.2-android"],
        "33.7.2-jre",
      ),
    );

    const res = await maven("com.google.guava", "guava");
    expect(res.version).toBe("33.7.2-jre");
  });

  it("takes the numeric maximum, not the last listed version", async () => {
    // A backport published after the newer line.
    mockFetch.mockResolvedValueOnce(metadata(["2.9.0", "2.10.1", "2.9.1"], "2.9.1"));

    const res = await maven("g", "a");
    expect(res.version).toBe("2.10.1");
  });

  it("throws when there is no stable version", async () => {
    mockFetch.mockResolvedValueOnce(metadata(["1.0.0-alpha1"]));

    await expect(maven("com.nope", "nope")).rejects.toThrow(
      "No stable versions for 'com.nope:nope'",
    );
  });

  it("throws on 404", async () => {
    mockFetch.mockResolvedValueOnce(new Response("Not Found", { status: 404 }));

    await expect(maven("bad", "bad")).rejects.toThrow("Artifact 'bad:bad' not found");
  });
});
