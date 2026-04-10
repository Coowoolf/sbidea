import { generateText, Output } from "ai";
import { z } from "zod";
import { withModelFallback } from "@/lib/models";

export const runtime = "nodejs";
export const maxDuration = 60;

const DailySchema = z.object({
  quote: z
    .string()
    .describe(
      "一句荒诞但有能量的正能量创业口号，20-40 字，带一点 meme 感，不说教"
    ),
  explanation: z
    .string()
    .describe("一句解释它其实在说什么的小字，30-60 字"),
  signature: z
    .string()
    .describe(
      "假装是谁说的，例如『一个 SB 但赚钱的人 · 2026』，要好玩"
    ),
  colorA: z
    .string()
    .describe("hex 色 #RRGGBB，海报渐变起始色，鲜亮但不俗"),
  colorB: z
    .string()
    .describe("hex 色 #RRGGBB，海报渐变结束色，和 colorA 形成反差"),
});

export type Daily = z.infer<typeof DailySchema>;

const SYSTEM_PROMPT = `你是一个给朋友圈写『反成功学』式日签的文案。
用户会点一下按钮，你就要给他一句看起来是正能量、实际上带着反讽的口号，可以当朋友圈日签发。

风格要求：
1. 全部中文
2. 不要真鸡汤，要带点反讽或反直觉
3. 每次都要给一个全新的句子
4. 语气可以是：『一个过来人』『一个悲观的朋友』『一个刚亏钱的学长』『一个装睡的打工人』
5. 不要涉及政治、违法、涉黄、歧视
6. 严格按 schema 输出 JSON，包括两个十六进制颜色用于海报`;

export async function POST() {
  try {
    const output = await withModelFallback("daily", async (model) => {
      const result = await generateText({
        model,
        maxRetries: 0,
        output: Output.object({ schema: DailySchema }),
        system: SYSTEM_PROMPT,
        prompt:
          "请给我一张今日 SB 日签。可以是任何主题的创业或人生反思，要出乎意料。",
        temperature: 1.0,
      });
      return result.output;
    });
    return Response.json({ ok: true, daily: output });
  } catch (error) {
    console.error("[/api/daily]", error);
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "生成失败",
      },
      { status: 500 }
    );
  }
}
