import { generateText, Output } from "ai";
import { z } from "zod";
import { MODELS } from "@/lib/models";

export const runtime = "nodejs";
export const maxDuration = 60;

const JargonSchema = z.object({
  translation: z
    .string()
    .describe("翻译后的那句话，一到两句，60-120 字"),
  jargonScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe(
      "黑话含量分数 0-100。只有在方向为 plain→jargon 时才会高，反之会很低。"
    ),
  highlights: z
    .array(z.string())
    .min(3)
    .max(6)
    .describe("3-6 条解释，每条列出一个被『翻译』的词的前后对照"),
  vibe: z
    .string()
    .describe("一句话总结这条翻译的调性，例如『像在高铁站一等座偶遇的投资人』"),
});

export type JargonResult = z.infer<typeof JargonSchema>;

type Direction = "toJargon" | "toPlain";

const SYSTEM_PROMPT = `你是创投圈双向翻译机。
两个方向：
1. plain → jargon：把人话翻译成投资人黑话，尽量塞满流行 buzz word 和宏大叙事
2. jargon → plain：把投资人黑话翻译回菜市场大妈能听懂的人话

风格要求：
1. 全部中文
2. 翻译要夸张，目标是让两种版本的反差足够好笑
3. highlights 要列出关键词的前后对照，让读者能学到词
4. jargonScore：plain→jargon 的输出应该 80-100，jargon→plain 的输出应该 5-25
5. 严格按 schema 输出 JSON`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      text?: string;
      direction?: Direction;
    };
    const text = (body.text ?? "").trim();
    const direction: Direction =
      body.direction === "toPlain" ? "toPlain" : "toJargon";

    if (!text) {
      return Response.json(
        { ok: false, error: "请先输入要翻译的内容" },
        { status: 400 }
      );
    }
    if (text.length > 300) {
      return Response.json(
        { ok: false, error: "内容请控制在 300 字以内" },
        { status: 400 }
      );
    }

    const directionNote =
      direction === "toJargon"
        ? `方向：人话 → 投资人黑话。请把下面这句话翻译成听起来特别专业、特别能骗钱的投资人语言。`
        : `方向：投资人黑话 → 人话。请把下面这句话翻译成你妈能听懂的人话，戳破所有 buzz word。`;

    const result = await generateText({
      model: MODELS.fast,
      output: Output.object({ schema: JargonSchema }),
      system: SYSTEM_PROMPT,
      prompt: `${directionNote}\n\n原文：\n"""\n${text}\n"""\n\n请严格按 schema 输出。`,
      temperature: 0.95,
    });

    return Response.json({ ok: true, result: result.output, direction });
  } catch (error) {
    console.error("[/api/jargon]", error);
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "翻译失败",
      },
      { status: 500 }
    );
  }
}
