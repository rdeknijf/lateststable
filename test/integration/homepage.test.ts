import { afterEach, describe, expect, it, vi } from "vitest";
import handler from "../../src/index";
import * as platforms_ from "../../src/platforms";
import type { VersionResult } from "../../src/platforms";
import { COPY } from "../../src/homepage-copy";
import { BAND, FRINGE, HOMEPAGE, REGISTRIES } from "../../src/homepage";

const ALL_TAGS = ["alpha", "beta", "rc", "cr", "m", "milestone", "snapshot", "preview", "ea", "dev", "pre"];
const REMOVES: Record<string, string[]> = {
  maven: ALL_TAGS,
  docker: ALL_TAGS,
  nuget: ALL_TAGS,
  packagist: ["dev", "alpha", "beta", "rc"],
};

async function platforms(): Promise<string[]> {
  const res = await handler.fetch(new Request("https://lateststable.org/v1"), {});
  return ((await res.json()) as { platforms: string[] }).platforms;
}

describe("homepage", () => {
  it("lists exactly the platforms the API serves", async () => {
    expect(REGISTRIES.map((r) => r.id).sort()).toEqual((await platforms()).sort());
  });

  it("has a rule sentence and a tile for every platform", () => {
    for (const reg of REGISTRIES) {
      expect(COPY.rules.items[reg.id].length).toBeGreaterThan(0);
      expect(HOMEPAGE).toContain(`data-reg="${reg.id}"`);
      expect(HOMEPAGE).toContain(`href="/v1/${reg.id}/${reg.example}"`);
    }
  });

  it("marks own-rule registries only where src/platforms.ts applies a rule", () => {
    expect(REGISTRIES.filter((r) => r.ownRule).map((r) => r.id).sort()).toEqual(
      ["docker", "maven", "nuget", "packagist"],
    );
  });

  it("puts a colored tag only beside a registry whose rule removes it", () => {
    const touching = (c: number, r: number) =>
      BAND.flatMap(([bc, br], i) => (Math.abs(bc - c) + Math.abs(br - r) === 1 ? [REGISTRIES[i]] : []));
    for (const [c, r, tag] of FRINGE) {
      for (const reg of touching(c, r)) {
        expect(REMOVES[reg.id] ?? [], `${tag} beside ${reg.id}`).toContain(tag);
      }
    }
  });

  describe("the fetchers remove the tags the chart shows", () => {
    const answer = (body: unknown, text = false) =>
      vi.stubGlobal("fetch", async () => new Response(text ? String(body) : JSON.stringify(body)));
    afterEach(() => vi.unstubAllGlobals());

    const cases: Record<string, (tag: string) => Promise<VersionResult>> = {
      maven: (tag) => {
        answer(`<versions><version>1.0.0</version><version>2.0.0-${tag}</version></versions>`, true);
        return platforms_.maven("g", "a");
      },
      docker: (tag) => {
        answer({ results: [{ name: "1.0.0" }, { name: `2.0.0-${tag}` }] });
        return platforms_.docker("u", "i");
      },
      nuget: (tag) => {
        answer({ versions: ["1.0.0", `2.0.0-${tag}`] });
        return platforms_.nuget("p");
      },
      packagist: (tag) => {
        answer({ packages: { "v/p": [{ version: `2.0.0-${tag}` }, { version: "1.0.0" }] } });
        return platforms_.packagist("v", "p");
      },
    };

    for (const [id, run] of Object.entries(cases)) {
      for (const tag of REMOVES[id]) {
        it(`${id} removes ${tag}`, async () => {
          expect((await run(tag)).version).toBe("1.0.0");
        });
      }
    }
  });

  it("has no em or en dash in its text", () => {
    expect(JSON.stringify(COPY)).not.toMatch(/[–—]/);
    expect(HOMEPAGE).not.toMatch(/[–—]/);
  });

  it("loads nothing from another origin", () => {
    const attrs = HOMEPAGE.match(/(?:src|url)=?\(?["']?https?:[^"')\s]+/g) ?? [];
    expect(attrs).toEqual([]);
    expect(HOMEPAGE).not.toMatch(/<link[^>]+href="https?:/);
  });

  it("hardcodes no fetched version in the served response placeholder", () => {
    expect(HOMEPAGE).toContain('"version": "x.y.z"');
  });

  it("keeps the homepage response headers", async () => {
    const res = await handler.fetch(new Request("https://lateststable.org/"), {});
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/html");
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });
});
