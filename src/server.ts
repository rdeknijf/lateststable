import handler from "./index";
import { createCache } from "./cache";

const env = { VERSIONS: createCache() };
const port = parseInt(process.env.PORT || "3000");

const server = Bun.serve({
  port,
  fetch: (req) => handler.fetch(req, env),
});

console.log(`lateststable listening on :${server.port}`);
