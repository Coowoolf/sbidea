import { generateText, Output } from "ai";
import { z } from "zod";
import { withModelFallback } from "@/lib/models";

export const runtime = "nodejs";
export const maxDuration = 60;

const DeathSchema = z.object({
  ways: z
    .array(
      z.object({
        title: z
          .string()
          .describe("死法名字，要戏剧化像电影片名，8 字以内"),
        timeline: z
          .string()
          .describe("从创立到死的时间，例如『第 11 个月』或『A 轮后 180 天』"),
        story: z
          .string()
          .describe(
            "具体的死法叙事，要写得像一段小说，带有场景感和细节，100-160 字"
          ),
        rootCause: z
          .string()
          .describe("根本原因的冷酷总结，一句话，30 字以内"),
      })
    )
    .length(7)
    .describe("恰好 7 种戏剧化的死法"),
  finalEulogy: z
    .string()
    .describe(
      "一段作为全文结尾的墓志铭或总结，100-150 字，要带点悲壮和幽默"
    ),
});

export type DeathOracle = z.infer<typeof DeathSchema>;

const SYSTEM_PROMPT = `你是 "SB Idea Lab" 的死亡占卜师。
你的工作：接收一个创业点子，预测它会以怎样 7 种戏剧化的方式死掉。

风格要求：
1. 全部中文
2. 黑色幽默，冷酷，但不要恶毒
3. 每一种死法都要具体、有场景感、有时间线
4. 不能乱编，死法要真的和这个点子的商业结构相关
5. 7 种死法要互相不同：有的是产品问题，有的是增长问题，有的是团队问题，有的是政策问题，有的是宏观问题
6. 严格按照 schema 输出结构化 JSON，ways 数组刚好 7 个元素
7. 禁止涉及违法、涉黄、暴力、政治敏感内容`;

export async function POST(req: Request) {
  try {
    const { idea } = (await req.json()) as { idea?: string };
    const cleaned = (idea ?? "").trim();
    if (!cleaned) {
      return Response.json(
        { ok: false, error: "请先输入点子" },
        { status: 400 }
      );
    }
    if (cleaned.length > 400) {
      return Response.json(
        { ok: false, error: "点子请控制在 400 字以内" },
        { status: 400 }
      );
    }

    const output = await withModelFallback("deathways", async (model) => {
      const result = await generateText({
        model,
        maxRetries: 0,
        output: Output.object({ schema: DeathSchema }),
        system: SYSTEM_PROMPT,
        prompt: `用户的点子：\n\n"""\n${cleaned}\n"""\n\n请预言它的 7 种死法。`,
        temperature: 1.0,
      });
      return result.output;
    });

    return Response.json({ ok: true, oracle: output });
  } catch (error) {
    console.error("[/api/deathways]", error);
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "占卜失败",
      },
      { status: 500 }
    );
  }
}
