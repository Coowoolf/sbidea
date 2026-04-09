import { generateText, Output } from "ai";
import { z } from "zod";
import { MODELS } from "@/lib/models";

export const runtime = "nodejs";
export const maxDuration = 60;

const ArticleSchema = z.object({
  headline: z
    .string()
    .describe("一句话的文章大标题，要有新闻感，含公司名和融资规模"),
  subheadline: z
    .string()
    .describe("副标题，一句话补充关键信息，30 字内"),
  dateline: z
    .string()
    .describe("日期和地点开头，例如『2026 年 4 月 · 上海讯』"),
  leadParagraph: z
    .string()
    .describe(
      "导语，像 TechCrunch 一样开头一段，包含公司、融资轮次、金额、领投，120-180 字"
    ),
  body: z
    .array(z.string())
    .min(3)
    .max(5)
    .describe(
      "正文段落数组 3-5 段，每段 80-150 字，要有专业度：公司背景 / 产品逻辑 / 市场机会 / 团队介绍 / 未来计划，可以引用虚构投资人或创始人的话"
    ),
  founderQuote: z
    .string()
    .describe("创始人引言，一两句话，要有创始人那种让人又兴奋又质疑的腔调"),
  investorQuote: z
    .string()
    .describe("领投机构合伙人的引言，要像投资备忘录里那种正式又忽悠的腔调"),
  fakeMetrics: z
    .array(z.string())
    .min(3)
    .max(5)
    .describe(
      "3-5 条虚构的关键数据点，格式类似『注册用户已突破 50 万』『GMV 年同比增长 1400%』"
    ),
  fundingStage: z
    .string()
    .describe("融资轮次，例如 Pre-A / A 轮 / B+ 轮"),
  fundingAmount: z
    .string()
    .describe("融资金额，例如 2000 万美元、1.5 亿人民币"),
  leadInvestor: z.string().describe("领投机构，用一个好记的虚构名字"),
  companyName: z.string().describe("虚构的公司名，最好和点子相关有记忆点"),
  valuation: z
    .string()
    .describe("估值，例如『估值约 5 亿美元』，要看上去合理"),
});

export type FakeArticle = z.infer<typeof ArticleSchema>;

const SYSTEM_PROMPT = `你是一个给《36Kr》《TechCrunch 中文版》写融资报道的资深记者。
你要做的事：把用户给你的创业点子，包装成一篇看起来完全真实的融资报道。

风格要求：
1. 全文中文，腔调要专业，像真新闻，不要有玩笑感
2. 但内容可以荒诞、可以 SB，要靠新闻腔调制造反差
3. 所有投资机构、估值、人名都必须虚构但看上去合理
4. 不要使用任何真实公司名或真实投资人名
5. 引用要自然，要像被采访时说的话
6. 严格按照 schema 输出结构化 JSON`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { idea?: string };
    const idea = (body.idea ?? "").trim();
    if (!idea) {
      return Response.json(
        { ok: false, error: "请先描述你的点子" },
        { status: 400 }
      );
    }
    if (idea.length > 400) {
      return Response.json(
        { ok: false, error: "点子描述请控制在 400 字以内" },
        { status: 400 }
      );
    }

    const result = await generateText({
      model: MODELS.fast,
      output: Output.object({ schema: ArticleSchema }),
      system: SYSTEM_PROMPT,
      prompt: `用户的创业点子：\n\n"""\n${idea}\n"""\n\n请为这个点子生成一篇完整的融资新闻稿。`,
      temperature: 0.95,
    });

    return Response.json({ ok: true, article: result.output });
  } catch (error) {
    console.error("[/api/headline]", error);
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "生成失败",
      },
      { status: 500 }
    );
  }
}
