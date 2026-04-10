/**
 * Product QA walkthrough for sbidea.ai.
 *
 * Hits each of the 8 AI-backed products once with a real request and
 * reports per-product results:
 *   - did the API return 200?
 *   - is every required schema field present?
 *   - is every string field in a reasonable length range?
 *   - any format-specific validation (hex colors, enums, array lengths)?
 *
 * Produces a markdown report at docs/qa-walkthrough-<ISO-date>.md.
 *
 * Run with:
 *   # dev server must be running first
 *   npm run dev
 *   # in another terminal:
 *   npx tsx scripts/product-qa.mts
 *
 * Exit 0 if every product passes, exit 1 if any product fails.
 * Intended to be re-run after provisioning a paid/BYOK fallback so
 * free-tier rate limits don't poison the results.
 */

import { writeFileSync, mkdirSync } from "node:fs";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:3456";
const TIMEOUT_MS = 180_000;

type Severity = "pass" | "warn" | "fail";

type Check = {
  name: string;
  severity: Severity;
  detail: string;
};

type ProductReport = {
  product: string;
  path: string;
  httpStatus: number | "timeout" | "network-error";
  durationMs: number;
  checks: Check[];
  raw?: unknown;
};

async function postJson(
  path: string,
  body: unknown
): Promise<{ status: number | "timeout" | "network-error"; data?: unknown; durationMs: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const start = Date.now();
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const durationMs = Date.now() - start;
    const data = await res.json().catch(() => undefined);
    return { status: res.status, data, durationMs };
  } catch (err) {
    const durationMs = Date.now() - start;
    if ((err as { name?: string } | null)?.name === "AbortError") {
      return { status: "timeout", durationMs };
    }
    return { status: "network-error", durationMs };
  } finally {
    clearTimeout(timer);
  }
}

async function postText(
  path: string,
  body: unknown
): Promise<{ status: number | "timeout" | "network-error"; text?: string; durationMs: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const start = Date.now();
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const durationMs = Date.now() - start;
    const text = await res.text().catch(() => undefined);
    return { status: res.status, text, durationMs };
  } catch (err) {
    const durationMs = Date.now() - start;
    if ((err as { name?: string } | null)?.name === "AbortError") {
      return { status: "timeout", durationMs };
    }
    return { status: "network-error", durationMs };
  } finally {
    clearTimeout(timer);
  }
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                      */
/* -------------------------------------------------------------------------- */

function lenCheck(
  name: string,
  value: unknown,
  min: number,
  ideal: [number, number],
  max: number
): Check {
  if (typeof value !== "string") {
    return { name, severity: "fail", detail: `not a string (got ${typeof value})` };
  }
  const n = value.trim().length;
  if (n === 0) {
    return { name, severity: "fail", detail: "empty" };
  }
  if (n < min) {
    return { name, severity: "fail", detail: `too short (${n} chars, min ${min})` };
  }
  if (n > max) {
    return { name, severity: "fail", detail: `too long (${n} chars, max ${max})` };
  }
  if (n < ideal[0] || n > ideal[1]) {
    return {
      name,
      severity: "warn",
      detail: `${n} chars (ideal ${ideal[0]}-${ideal[1]})`,
    };
  }
  return { name, severity: "pass", detail: `${n} chars` };
}

function presentCheck(name: string, value: unknown): Check {
  if (value === undefined || value === null) {
    return { name, severity: "fail", detail: "missing field" };
  }
  return { name, severity: "pass", detail: "present" };
}

function arrayLenCheck(
  name: string,
  value: unknown,
  expected: number | [number, number]
): Check {
  if (!Array.isArray(value)) {
    return { name, severity: "fail", detail: `not an array (got ${typeof value})` };
  }
  const n = value.length;
  if (typeof expected === "number") {
    if (n !== expected) {
      return { name, severity: "fail", detail: `expected exactly ${expected}, got ${n}` };
    }
  } else {
    const [mn, mx] = expected;
    if (n < mn || n > mx) {
      return { name, severity: "fail", detail: `expected ${mn}-${mx}, got ${n}` };
    }
  }
  return { name, severity: "pass", detail: `${n} items` };
}

function hexColorCheck(name: string, value: unknown): Check {
  if (typeof value !== "string") {
    return { name, severity: "fail", detail: `not a string (got ${typeof value})` };
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(value.trim())) {
    return { name, severity: "fail", detail: `not a valid #RRGGBB (got "${value}")` };
  }
  return { name, severity: "pass", detail: value };
}

function intRangeCheck(name: string, value: unknown, min: number, max: number): Check {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return { name, severity: "fail", detail: `not an integer (got ${typeof value})` };
  }
  if (value < min || value > max) {
    return { name, severity: "fail", detail: `out of range (${value}, expected ${min}-${max})` };
  }
  return { name, severity: "pass", detail: String(value) };
}

/* -------------------------------------------------------------------------- */
/* Product-specific tests                                                       */
/* -------------------------------------------------------------------------- */

async function testGenerator(): Promise<ProductReport> {
  const { status, data, durationMs } = await postJson("/api/generate", {
    hint: "宠物",
  });
  const checks: Check[] = [];
  if (status !== 200) {
    checks.push({ name: "http", severity: "fail", detail: `status ${status}` });
    return { product: "generator", path: "/api/generate", httpStatus: status, durationMs, checks };
  }
  const body = data as { ok?: boolean; idea?: Record<string, unknown> };
  if (!body?.ok || !body?.idea) {
    checks.push({ name: "ok", severity: "fail", detail: "ok flag missing" });
    return { product: "generator", path: "/api/generate", httpStatus: status, durationMs, checks, raw: data };
  }
  const idea = body.idea;
  checks.push(lenCheck("name", idea.name, 2, [3, 12], 30));
  checks.push(lenCheck("oneLiner", idea.oneLiner, 8, [12, 50], 100));
  checks.push(lenCheck("category", idea.category, 2, [2, 20], 50));
  checks.push(lenCheck("whySB", idea.whySB, 30, [60, 160], 300));
  checks.push(lenCheck("whyWorks", idea.whyWorks, 40, [100, 220], 400));
  checks.push(lenCheck("targetUser", idea.targetUser, 4, [6, 40], 80));
  checks.push(lenCheck("moat", idea.moat, 10, [20, 70], 150));
  checks.push(lenCheck("firstMvp", idea.firstMvp, 10, [20, 80], 150));
  checks.push(lenCheck("marketSizeGuess", idea.marketSizeGuess, 4, [8, 40], 100));
  checks.push(intRangeCheck("sbScore", idea.sbScore, 1, 10));
  checks.push(intRangeCheck("unicornScore", idea.unicornScore, 1, 10));
  return { product: "generator", path: "/api/generate", httpStatus: status, durationMs, checks, raw: idea };
}

async function testRoast(): Promise<ProductReport> {
  const { status, text, durationMs } = await postText("/api/roast", {
    idea: "一个 App，让你给路边野猫发红包，系统自动找志愿者喂猫并拍照反馈。",
  });
  const checks: Check[] = [];
  if (status !== 200) {
    checks.push({ name: "http", severity: "fail", detail: `status ${status}` });
    return { product: "roast", path: "/api/roast", httpStatus: status, durationMs, checks };
  }
  const body = text ?? "";
  if (body.trim().length < 80) {
    checks.push({ name: "body", severity: "fail", detail: `stream body too short (${body.length} chars)` });
  } else {
    checks.push({ name: "body", severity: "pass", detail: `${body.length} chars total` });
  }
  // Expected 5 markdown headings
  const headings = body.match(/^##\s/gm) ?? [];
  if (headings.length < 3) {
    checks.push({
      name: "sections",
      severity: "fail",
      detail: `expected 5 '##' sections, got ${headings.length}`,
    });
  } else if (headings.length < 5) {
    checks.push({
      name: "sections",
      severity: "warn",
      detail: `expected 5 '##' sections, got ${headings.length}`,
    });
  } else {
    checks.push({ name: "sections", severity: "pass", detail: "5 sections" });
  }
  return { product: "roast", path: "/api/roast", httpStatus: status, durationMs, checks };
}

async function testHall(): Promise<ProductReport> {
  // /hall is static, no AI involved — just verify it loads
  const start = Date.now();
  try {
    const res = await fetch(`${BASE}/hall`);
    const durationMs = Date.now() - start;
    const checks: Check[] = [];
    if (res.status !== 200) {
      checks.push({ name: "http", severity: "fail", detail: `status ${res.status}` });
    } else {
      const html = await res.text();
      if (!html.includes("名人堂")) {
        checks.push({ name: "content", severity: "fail", detail: "title '名人堂' not found" });
      } else {
        checks.push({ name: "http", severity: "pass", detail: "200 OK" });
        checks.push({ name: "content", severity: "pass", detail: "title present" });
      }
    }
    return { product: "hall", path: "/hall", httpStatus: res.status, durationMs, checks };
  } catch (err) {
    return {
      product: "hall",
      path: "/hall",
      httpStatus: "network-error",
      durationMs: Date.now() - start,
      checks: [{ name: "http", severity: "fail", detail: String(err) }],
    };
  }
}

async function testSbti(): Promise<ProductReport> {
  // /sbti is pure client-side, no AI. Just verify it loads.
  const start = Date.now();
  try {
    const res = await fetch(`${BASE}/sbti`);
    const durationMs = Date.now() - start;
    const checks: Check[] = [];
    if (res.status !== 200) {
      checks.push({ name: "http", severity: "fail", detail: `status ${res.status}` });
    } else {
      checks.push({ name: "http", severity: "pass", detail: "200 OK" });
    }
    return { product: "sbti", path: "/sbti", httpStatus: res.status, durationMs, checks };
  } catch (err) {
    return {
      product: "sbti",
      path: "/sbti",
      httpStatus: "network-error",
      durationMs: Date.now() - start,
      checks: [{ name: "http", severity: "fail", detail: String(err) }],
    };
  }
}

async function testHeadline(): Promise<ProductReport> {
  const { status, data, durationMs } = await postJson("/api/headline", {
    idea: "一个订阅制服务，每天给你发一个『今天最废物行为指南』，鼓励你躺平。",
  });
  const checks: Check[] = [];
  if (status !== 200) {
    checks.push({ name: "http", severity: "fail", detail: `status ${status}` });
    return { product: "headline", path: "/api/headline", httpStatus: status, durationMs, checks };
  }
  const body = data as { ok?: boolean; article?: Record<string, unknown> };
  if (!body?.ok || !body?.article) {
    checks.push({ name: "ok", severity: "fail", detail: "ok flag missing" });
    return { product: "headline", path: "/api/headline", httpStatus: status, durationMs, checks, raw: data };
  }
  const a = body.article;
  checks.push(lenCheck("headline", a.headline, 10, [15, 60], 120));
  checks.push(lenCheck("subheadline", a.subheadline, 5, [10, 40], 80));
  checks.push(lenCheck("dateline", a.dateline, 4, [6, 30], 60));
  checks.push(lenCheck("leadParagraph", a.leadParagraph, 60, [120, 220], 400));
  checks.push(arrayLenCheck("body", a.body, [3, 5]));
  checks.push(lenCheck("founderQuote", a.founderQuote, 10, [15, 80], 160));
  checks.push(lenCheck("investorQuote", a.investorQuote, 10, [15, 80], 160));
  checks.push(arrayLenCheck("fakeMetrics", a.fakeMetrics, [3, 5]));
  checks.push(lenCheck("fundingStage", a.fundingStage, 2, [2, 15], 30));
  checks.push(lenCheck("fundingAmount", a.fundingAmount, 3, [3, 20], 40));
  checks.push(lenCheck("leadInvestor", a.leadInvestor, 3, [3, 30], 60));
  checks.push(lenCheck("companyName", a.companyName, 2, [2, 20], 40));
  checks.push(lenCheck("valuation", a.valuation, 4, [4, 30], 60));
  return { product: "headline", path: "/api/headline", httpStatus: status, durationMs, checks, raw: a };
}

async function testDeathways(): Promise<ProductReport> {
  const { status, data, durationMs } = await postJson("/api/deathways", {
    idea: "做一个 AI，把老板的消息翻译成阴阳怪气版。",
  });
  const checks: Check[] = [];
  if (status !== 200) {
    checks.push({ name: "http", severity: "fail", detail: `status ${status}` });
    return { product: "deathways", path: "/api/deathways", httpStatus: status, durationMs, checks };
  }
  const body = data as { ok?: boolean; oracle?: { ways?: unknown[]; finalEulogy?: string } };
  if (!body?.ok || !body?.oracle) {
    checks.push({ name: "ok", severity: "fail", detail: "ok flag missing" });
    return { product: "deathways", path: "/api/deathways", httpStatus: status, durationMs, checks, raw: data };
  }
  const o = body.oracle;
  checks.push(arrayLenCheck("ways", o.ways, 7));
  if (Array.isArray(o.ways)) {
    o.ways.forEach((w: unknown, i: number) => {
      const way = w as Record<string, unknown>;
      checks.push(lenCheck(`ways[${i}].title`, way.title, 2, [3, 12], 30));
      checks.push(lenCheck(`ways[${i}].timeline`, way.timeline, 3, [5, 20], 40));
      checks.push(lenCheck(`ways[${i}].story`, way.story, 30, [80, 200], 400));
      checks.push(lenCheck(`ways[${i}].rootCause`, way.rootCause, 5, [10, 40], 80));
    });
  }
  checks.push(lenCheck("finalEulogy", o.finalEulogy, 40, [80, 180], 300));
  return { product: "deathways", path: "/api/deathways", httpStatus: status, durationMs, checks, raw: o };
}

async function testSlogan(): Promise<ProductReport> {
  const { status, data, durationMs } = await postJson("/api/slogan", {
    concept: "一个帮你写日记的 AI，每晚 10 点主动问你今天发生了什么。",
  });
  const checks: Check[] = [];
  if (status !== 200) {
    checks.push({ name: "http", severity: "fail", detail: `status ${status}` });
    return { product: "slogan", path: "/api/slogan", httpStatus: status, durationMs, checks };
  }
  const body = data as { ok?: boolean; result?: { slogans?: unknown[] } };
  if (!body?.ok || !body?.result) {
    checks.push({ name: "ok", severity: "fail", detail: "ok flag missing" });
    return { product: "slogan", path: "/api/slogan", httpStatus: status, durationMs, checks, raw: data };
  }
  const slogans = body.result.slogans;
  checks.push(arrayLenCheck("slogans", slogans, 8));
  const expectedStyles = ["vc", "douyin", "redbook", "laoganbu", "micro", "anime", "talkshow", "cctv"];
  if (Array.isArray(slogans)) {
    const keys = new Set(
      slogans.map((s: unknown) => (s as { styleKey?: string }).styleKey ?? "")
    );
    const missing = expectedStyles.filter((s) => !keys.has(s));
    if (missing.length > 0) {
      checks.push({
        name: "styleKeys",
        severity: "fail",
        detail: `missing styles: ${missing.join(", ")}`,
      });
    } else {
      checks.push({ name: "styleKeys", severity: "pass", detail: "all 8 styles present" });
    }
    slogans.forEach((s: unknown, i: number) => {
      const slogan = s as { text?: unknown };
      checks.push(lenCheck(`slogans[${i}].text`, slogan.text, 2, [4, 22], 50));
    });
  }
  return { product: "slogan", path: "/api/slogan", httpStatus: status, durationMs, checks, raw: body.result };
}

async function testTarot(): Promise<ProductReport> {
  const { status, data, durationMs } = await postJson("/api/tarot", {
    question: "我现在是应该离职全职创业，还是再兼职做一年？",
    cards: [
      {
        position: "past",
        name: "愚者 · 第一次 Push",
        keywords: ["开始", "无知者无畏", "初心"],
        meaning: "你正处在什么都不懂也就什么都不怕的黄金状态。",
      },
      {
        position: "challenge",
        name: "月亮 · 数据迷雾",
        keywords: ["模糊", "数据", "直觉"],
        meaning: "现在你看不清真正的信号。",
      },
      {
        position: "outcome",
        name: "太阳 · PMF",
        keywords: ["PMF", "明朗", "增长"],
        meaning: "你距离一次真正的 PMF 只差一个具体的用户群。",
      },
    ],
  });
  const checks: Check[] = [];
  if (status !== 200) {
    checks.push({ name: "http", severity: "fail", detail: `status ${status}` });
    return { product: "tarot", path: "/api/tarot", httpStatus: status, durationMs, checks };
  }
  const body = data as { ok?: boolean; reading?: Record<string, unknown> };
  if (!body?.ok || !body?.reading) {
    checks.push({ name: "ok", severity: "fail", detail: "ok flag missing" });
    return { product: "tarot", path: "/api/tarot", httpStatus: status, durationMs, checks, raw: data };
  }
  const r = body.reading;
  checks.push(lenCheck("overall", r.overall, 60, [120, 200], 320));
  checks.push(lenCheck("past", r.past, 30, [60, 120], 220));
  checks.push(lenCheck("challenge", r.challenge, 30, [60, 120], 220));
  checks.push(lenCheck("outcome", r.outcome, 30, [60, 120], 220));
  checks.push(lenCheck("actionTip", r.actionTip, 15, [30, 80], 160));
  return { product: "tarot", path: "/api/tarot", httpStatus: status, durationMs, checks, raw: r };
}

async function testDaily(): Promise<ProductReport> {
  const { status, data, durationMs } = await postJson("/api/daily", {});
  const checks: Check[] = [];
  if (status !== 200) {
    checks.push({ name: "http", severity: "fail", detail: `status ${status}` });
    return { product: "daily", path: "/api/daily", httpStatus: status, durationMs, checks };
  }
  const body = data as { ok?: boolean; daily?: Record<string, unknown> };
  if (!body?.ok || !body?.daily) {
    checks.push({ name: "ok", severity: "fail", detail: "ok flag missing" });
    return { product: "daily", path: "/api/daily", httpStatus: status, durationMs, checks, raw: data };
  }
  const d = body.daily;
  checks.push(lenCheck("quote", d.quote, 10, [20, 60], 100));
  checks.push(lenCheck("explanation", d.explanation, 15, [30, 80], 160));
  checks.push(lenCheck("signature", d.signature, 3, [4, 30], 60));
  checks.push(hexColorCheck("colorA", d.colorA));
  checks.push(hexColorCheck("colorB", d.colorB));
  return { product: "daily", path: "/api/daily", httpStatus: status, durationMs, checks, raw: d };
}

async function testJargon(): Promise<ProductReport> {
  const { status, data, durationMs } = await postJson("/api/jargon", {
    text: "我想做一个帮人记账的 App。",
    direction: "toJargon",
  });
  const checks: Check[] = [];
  if (status !== 200) {
    checks.push({ name: "http", severity: "fail", detail: `status ${status}` });
    return { product: "jargon", path: "/api/jargon", httpStatus: status, durationMs, checks };
  }
  const body = data as { ok?: boolean; result?: Record<string, unknown> };
  if (!body?.ok || !body?.result) {
    checks.push({ name: "ok", severity: "fail", detail: "ok flag missing" });
    return { product: "jargon", path: "/api/jargon", httpStatus: status, durationMs, checks, raw: data };
  }
  const r = body.result;
  checks.push(lenCheck("translation", r.translation, 20, [40, 140], 300));
  checks.push(intRangeCheck("jargonScore", r.jargonScore, 0, 100));
  checks.push(arrayLenCheck("highlights", r.highlights, [3, 6]));
  checks.push(lenCheck("vibe", r.vibe, 5, [10, 40], 80));
  return { product: "jargon", path: "/api/jargon", httpStatus: status, durationMs, checks, raw: r };
}

/* -------------------------------------------------------------------------- */
/* Runner                                                                       */
/* -------------------------------------------------------------------------- */

const TESTS: Array<[string, () => Promise<ProductReport>]> = [
  ["generator", testGenerator],
  ["roast", testRoast],
  ["hall", testHall],
  ["sbti", testSbti],
  ["headline", testHeadline],
  ["deathways", testDeathways],
  ["slogan", testSlogan],
  ["tarot", testTarot],
  ["daily", testDaily],
  ["jargon", testJargon],
];

function severityFor(report: ProductReport): Severity {
  if (report.httpStatus !== 200) return "fail";
  if (report.checks.some((c) => c.severity === "fail")) return "fail";
  if (report.checks.some((c) => c.severity === "warn")) return "warn";
  return "pass";
}

function icon(s: Severity): string {
  return s === "pass" ? "✅" : s === "warn" ? "⚠️ " : "❌";
}

async function main() {
  console.log(`\n🧪 sbidea.ai · product QA walkthrough\n   base: ${BASE}\n`);
  console.log("=".repeat(80));

  // Verify dev server is reachable before hammering it
  try {
    const probe = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(5000) });
    if (probe.status !== 200) {
      console.error(`❌ ${BASE}/ returned ${probe.status}. Is the dev server running?`);
      process.exit(1);
    }
  } catch {
    console.error(`❌ Could not reach ${BASE}. Start it with: npm run dev`);
    process.exit(1);
  }

  const reports: ProductReport[] = [];
  for (const [name, fn] of TESTS) {
    process.stdout.write(`\n🔎 ${name.padEnd(12)} ... `);
    const report = await fn();
    const sev = severityFor(report);
    console.log(`${icon(sev)} ${report.durationMs}ms`);
    for (const c of report.checks) {
      console.log(`   ${icon(c.severity)} ${c.name}: ${c.detail}`);
    }
    reports.push(report);
  }

  const passCount = reports.filter((r) => severityFor(r) === "pass").length;
  const warnCount = reports.filter((r) => severityFor(r) === "warn").length;
  const failCount = reports.filter((r) => severityFor(r) === "fail").length;

  console.log("\n" + "=".repeat(80));
  console.log(
    `\n📊 Summary: ${passCount} pass · ${warnCount} warn · ${failCount} fail\n`
  );

  // Write markdown report
  try {
    mkdirSync("docs", { recursive: true });
    const date = new Date().toISOString().slice(0, 10);
    const path = `docs/qa-walkthrough-${date}.md`;
    const md = buildMarkdown(reports, { passCount, warnCount, failCount });
    writeFileSync(path, md);
    console.log(`📝 Report written to ${path}\n`);
  } catch (err) {
    console.error("Failed to write report:", err);
  }

  process.exit(failCount > 0 ? 1 : 0);
}

function buildMarkdown(
  reports: ProductReport[],
  totals: { passCount: number; warnCount: number; failCount: number }
): string {
  const lines: string[] = [];
  lines.push(`# sbidea.ai · Product QA Walkthrough`);
  lines.push(``);
  lines.push(`Run at: **${new Date().toISOString()}**`);
  lines.push(`Base URL: \`${BASE}\``);
  lines.push(``);
  lines.push(
    `**Summary**: ${totals.passCount} pass · ${totals.warnCount} warn · ${totals.failCount} fail`
  );
  lines.push(``);
  lines.push(`| # | Product | Status | Duration | Checks |`);
  lines.push(`|---|---------|--------|----------|--------|`);
  reports.forEach((r, i) => {
    const sev = severityFor(r);
    const passing = r.checks.filter((c) => c.severity === "pass").length;
    const total = r.checks.length;
    lines.push(
      `| ${i + 1} | \`${r.product}\` (${r.path}) | ${icon(sev)} | ${r.durationMs}ms | ${passing}/${total} pass |`
    );
  });
  lines.push(``);
  lines.push(`## Per-product details`);
  lines.push(``);
  for (const r of reports) {
    const sev = severityFor(r);
    lines.push(`### ${icon(sev)} ${r.product} — \`${r.path}\``);
    lines.push(``);
    lines.push(`- HTTP status: \`${r.httpStatus}\``);
    lines.push(`- Duration: ${r.durationMs}ms`);
    lines.push(``);
    lines.push(`| Check | Severity | Detail |`);
    lines.push(`|-------|----------|--------|`);
    for (const c of r.checks) {
      lines.push(`| ${c.name} | ${icon(c.severity)} | ${c.detail} |`);
    }
    lines.push(``);
  }
  return lines.join("\n");
}

await main().catch((err) => {
  console.error("QA runner crashed:", err);
  process.exit(1);
});
