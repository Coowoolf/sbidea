import { generateText, Output } from "ai";
import { z } from "zod";
import { MODELS } from "@/lib/models";

export const runtime = "nodejs";
export const maxDuration = 60;

const TarotReadingSchema = z.object({
  overall: z
    .string()
    .describe("整体解读，120-180 字，要像真的塔罗占卜师在说话，有仪式感"),
  past: z
    .string()
    .describe("第一张牌（现状）的针对性解读，60-100 字"),
  challenge: z
    .string()
    .describe("第二张牌（挑战）的针对性解读，60-100 字"),
  outcome: z
    .string()
    .describe("第三张牌（结果）的针对性解读，60-100 字"),
  actionTip: z
    .string()
    .describe("一条可以今晚就开始做的具体行动建议，30-60 字"),
});

export type TarotReading = z.infer<typeof TarotReadingSchema>;

type CardInput = {
  position: "past" | "challenge" | "outcome";
  name: string;
  meaning: string;
  keywords: string[];
};

const SYSTEM_PROMPT = `你是『SB Idea Lab』旗下的创业塔罗占卜师。
你使用一副 22 张大阿卡那创业塔罗，帮用户解读他们的创业命运。

风格要求：
1. 全部中文，语气有仪式感但不故弄玄虚
2. 要结合用户提供的『问题 / 现状』来解读，不能只是抄牌面含义
3. 三张牌分别代表：现状 / 挑战 / 结果，要有逻辑递进
4. 不要迷信，不要算命，要把塔罗作为『强制换角度思考』的工具
5. 严格按 schema 输出 JSON`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      question?: string;
      cards?: CardInput[];
    };

    const question = (body.question ?? "").trim();
    const cards = body.cards;

    if (!question) {
      return Response.json(
        { ok: false, error: "请先写下你想问塔罗的问题" },
        { status: 400 }
      );
    }
    if (question.length > 300) {
      return Response.json(
        { ok: false, error: "问题请控制在 300 字以内" },
        { status: 400 }
      );
    }
    if (!Array.isArray(cards) || cards.length !== 3) {
      return Response.json(
        { ok: false, error: "需要提供 3 张牌" },
        { status: 400 }
      );
    }

    const cardsText = cards
      .map(
        (c) =>
          `【${c.position}】${c.name}\n关键词：${c.keywords.join("、")}\n牌面含义：${c.meaning}`
      )
      .join("\n\n");

    const result = await generateText({
      model: MODELS.fast,
      output: Output.object({ schema: TarotReadingSchema }),
      system: SYSTEM_PROMPT,
      prompt: `用户的问题：\n"""\n${question}\n"""\n\n今晚抽到的 3 张牌：\n\n${cardsText}\n\n请解读。`,
      temperature: 0.9,
    });

    return Response.json({ ok: true, reading: result.output });
  } catch (error) {
    console.error("[/api/tarot]", error);
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "占卜师睡了",
      },
      { status: 500 }
    );
  }
}
