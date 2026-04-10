import { generateText, Output } from "ai";
import { z } from "zod";
import { withModelFallback } from "@/lib/models";

export const runtime = "nodejs";
export const maxDuration = 60;

const STYLES = [
  { key: "vc", label: "投资人", hint: "像 TechCrunch 头条，充满 buzz word" },
  { key: "douyin", label: "抖音 meme", hint: "短平快，有节奏感，带梗" },
  { key: "redbook", label: "小红书", hint: "温柔、治愈、带小 emoji 的语气" },
  { key: "laoganbu", label: "老干部", hint: "四平八稳，带一点宣传口吻" },
  { key: "micro", label: "微商", hint: "用感叹号多，熟人卖货语气" },
  { key: "anime", label: "中二", hint: "像动漫主角登场台词，夸张热血" },
  { key: "talkshow", label: "脱口秀", hint: "一句话段子，带反讽" },
  { key: "cctv", label: "央视广告", hint: "正能量，宏大叙事感" },
] as const;

const SloganSchema = z.object({
  slogans: z.array(
    z.object({
      styleKey: z.enum(STYLES.map((s) => s.key) as [string, ...string[]]),
      text: z.string().describe("中文 slogan 一句，20 字以内"),
    })
  ),
});

export type SloganResult = z.infer<typeof SloganSchema>;
export { STYLES };

const SYSTEM_PROMPT = `你是一个万能文案。用户会给你一个产品概念，你要用 8 种完全不同的语气风格各写一条 slogan。

规则：
1. 严格输出 8 条，每一条对应一个风格 key
2. 每条不超过 20 字
3. 风格之间的差异要拉满，让并排看的人一眼看到反差
4. 全部中文
5. 不能涉及违法、涉黄、歧视、政治敏感内容`;

export async function POST(req: Request) {
  try {
    const { concept } = (await req.json()) as { concept?: string };
    const cleaned = (concept ?? "").trim();
    if (!cleaned) {
      return Response.json(
        { ok: false, error: "请先描述你的产品" },
        { status: 400 }
      );
    }
    if (cleaned.length > 200) {
      return Response.json(
        { ok: false, error: "产品描述请控制在 200 字以内" },
        { status: 400 }
      );
    }

    const styleList = STYLES.map(
      (s) => `- ${s.key} (${s.label})：${s.hint}`
    ).join("\n");

    const result = await withModelFallback("slogan", (model) =>
      generateText({
        model,
        maxRetries: 0,
        output: Output.object({ schema: SloganSchema }),
        system: SYSTEM_PROMPT,
        prompt: `产品概念：\n"""\n${cleaned}\n"""\n\n请为以下 8 种风格各输出一条 slogan，styleKey 要严格匹配：\n${styleList}`,
        temperature: 0.95,
      })
    );

    return Response.json({ ok: true, result: result.output });
  } catch (error) {
    console.error("[/api/slogan]", error);
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "生成失败",
      },
      { status: 500 }
    );
  }
}
