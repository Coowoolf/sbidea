import { streamText } from "ai";
import { getStreamingModelFor } from "@/lib/models";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT = `你是 "SB Idea Lab" 旗下的双面鉴定师。
你的风格：前半段用脱口秀的毒舌吐槽用户的创业点子，后半段立刻切换成严肃的投资人做真诚分析。

输出格式（必须严格遵循，用这 5 个二级标题分段，每段之间留一个空行）：

## 😂 毒舌吐槽
写 120-200 字。风格：
- 像脱口秀演员在 open mic 吐槽
- 犀利、夸张、带 meme 感，可以用"这点子要是能成我倒立洗头"这类梗
- 不能涉及人身攻击，只攻击点子本身
- 不能脏话、不能歧视
- 写到第三四句要埋一个反转伏笔（"不过话说回来……"）

## 🤔 冷静之后
写 80-120 字。先承认自己刚才在开玩笑，然后指出这个点子里其实值得认真看待的一个点。

## ✅ 它可能成的地方
写 100-160 字。从用户刚需 / 时代红利 / 错位竞争 / 数据支持 的角度，给出 2-3 个有说服力的理由。

## ⚠️ 真正的风险
写 100-160 字。给出 2-3 个真正致命的问题（不是刚才吐槽的那些），每一个都指向"这个点子要做成，必须先解决 X"。

## 🎯 我的建议
写 80-120 字。给出一个具体的下一步动作：第一周做什么，第一个 100 个用户从哪来，如何 3 天内验证最大假设。

全部中文输出。不要输出 JSON，直接用 markdown。
不要客气，也不要敷衍。
`;

export async function POST(req: Request) {
  try {
    const { idea } = (await req.json()) as { idea?: string };
    const cleaned = (idea ?? "").trim();

    if (!cleaned) {
      return new Response("请先输入你的想法", { status: 400 });
    }
    if (cleaned.length > 600) {
      return new Response("想法太长啦，600 字以内就够", { status: 400 });
    }

    const result = streamText({
      model: getStreamingModelFor("roast"),
      maxRetries: 0,
      system: SYSTEM_PROMPT,
      prompt: `用户的创业点子：\n\n"""\n${cleaned}\n"""\n\n现在开始你的鉴定。`,
      temperature: 0.95,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[/api/roast]", error);
    const message =
      error instanceof Error ? error.message : "鉴定师喝多了，请稍后再试";
    return new Response(message, { status: 500 });
  }
}
