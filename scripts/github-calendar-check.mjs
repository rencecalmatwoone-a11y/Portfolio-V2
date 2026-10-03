import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const modules = new Map();

function loadModule(filename) {
  const target = path.join(root, filename);
  if (modules.has(target)) return modules.get(target).exports;
  const record = { exports: {} };
  modules.set(target, record);
  const source = ts.transpileModule(readFileSync(target, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const localRequire = (id) => id.startsWith("@/")
    ? id.endsWith(".json") ? require(path.join(root, id.slice(2))) : loadModule(`${id.slice(2)}.ts`)
    : require(id);
  new Function("require", "module", "exports", source)(localRequire, record, record.exports);
  return record.exports;
}

const { parseGitHubCalendar } = loadModule("lib/github-calendar.ts");
const { GET } = loadModule("app/api/github/route.ts");
const saved = require("../data/github-contributions.json").contributions.slice(-366);
const days = saved.map((day, index) => ({ ...day, count: index === 0 ? 1234 : index === 1 ? 1 : 0 }));

function calendar(activity) {
  return activity.toReversed().map(day =>
    `<td data-level='${day.level}' id='day-${day.date}' data-date='${day.date}'></td>` +
    `<tool-tip for='day-${day.date}'>${day.count ? day.count.toLocaleString("en-US") : "No"} contribution${day.count === 1 ? "" : "s"} on a day.</tool-tip>`
  ).join("\n");
}

const html = calendar(days);
assert.deepEqual(parseGitHubCalendar(html), days, "Counts, zero days, attribute order and row ordering");
const extra = { date: new Date(Date.parse(days.at(-1).date) + 86400000).toISOString().slice(0, 10), count: 6, level: 2 };
assert.deepEqual(parseGitHubCalendar(calendar([...days, extra])), [...days, extra].slice(-366), "Keep the newest 366 days");
assert.throws(() => parseGitHubCalendar("<html>Unavailable</html>"));
assert.throws(() => parseGitHubCalendar(calendar(days.slice(0, 10))));
assert.throws(() => parseGitHubCalendar(html.replace(/<tool-tip[^>]*>[\s\S]*?<\/tool-tip>/, "")));
assert.throws(() => parseGitHubCalendar(calendar(days.filter((_, index) => index !== 50))));
assert.throws(() => parseGitHubCalendar(calendar([...days, days.at(-1)])));
assert.throws(() => parseGitHubCalendar(html.replace("data-level='0'", "data-level='5'")));

const originalFetch = globalThis.fetch;
try {
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return new Response(calendar(requests.length === 1 ? days : [...days, extra]));
  };
  const first = await GET();
  const second = await GET();
  assert.deepEqual((await first.json()).contributions, days);
  assert.deepEqual((await second.json()).contributions.at(-1), extra, "Consecutive requests must return fresh activity");
  assert.match(second.headers.get("Cache-Control"), /no-store/);
  assert.equal(second.headers.get("X-Activity-Fallback"), null);
  assert.equal(requests.length, 2);
  assert.ok(requests.every(request => request.url.startsWith("https://github.com/users/") && request.options.cache === "no-store"));
  assert.ok(requests.every(request => request.options.headers["Accept-Language"] === "en-US"));

  for (const response of [() => new Response("Unavailable", { status: 503 }), () => new Response("<html>Invalid calendar</html>")]) {
    globalThis.fetch = async () => response();
    const fallback = await GET();
    assert.equal(fallback.headers.get("X-Activity-Fallback"), "true");
    assert.match(fallback.headers.get("Cache-Control"), /no-store/);
    assert.deepEqual((await fallback.json()).contributions, saved);
  }
  globalThis.fetch = async () => { throw new Error("Offline"); };
  assert.equal((await GET()).headers.get("X-Activity-Fallback"), "true");
} finally {
  globalThis.fetch = originalFetch;
}

console.log("GitHub calendar parsing, uncached requests and failure fallbacks passed.");
