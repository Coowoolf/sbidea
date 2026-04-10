import { generateText, Output } from "ai";
import { z } from "zod";
import { withModelFallback } from "@/lib/models";

export const runtime = "nodejs";
export const maxDuration = 60;

const IdeaSchema = z.object({
  name: z
    .string()
    .describe("中文产品名，8 字以内，要有辨识度，最好带点 meme 感"),
  oneLiner: z
    .string()
    .describe("一句话产品介绍，30 字以内，像朋友圈 slogan"),
  category: z
    .string()
    .describe("所属赛道，例如：社交 / 工具 / 出行 / 餐饮 / 教育"),
  whySB: z
    .string()
    .describe(
      "为什么这个点子听起来很 SB（第一反应会被骂的理由），要写得犀利、具象、像路人评论，60-120 字"
    ),
  whyWorks: z
    .string()
    .describe(
      "为什么其实可能成（从用户刚需 / 时代红利 / 错位竞争角度分析），要有说服力，100-180 字"
    ),
  targetUser: z
    .string()
    .describe("目标用户画像，具体到一类人，30 字以内"),
  moat: z
    .string()
    .describe("护城河 / 壁垒是什么，50 字以内"),
  firstMvp: z
    .string()
    .describe("第一个 MVP 应该长什么样（一两周能上线），60 字以内"),
  marketSizeGuess: z
    .string()
    .describe("市场规模感觉（粗估），10-30 字，例：『国内估算 10 亿用户 × 年消费 200 元』"),
  sbScore: z
    .number()
    .int()
    .min(1)
    .max(10)
    .describe("SB 指数 1-10，越高越像 SB，8-10 是传奇级 SB"),
  unicornScore: z
    .number()
    .int()
    .min(1)
    .max(10)
    .describe("独角兽指数 1-10，越高越有望成为独角兽"),
});

export type GeneratedIdea = z.infer<typeof IdeaSchema>;

const SYSTEM_PROMPT = `你是 "SB Idea Lab" 的首席 AI 研究员。
你的任务：生成一个【听起来很 SB、但其实可能成】的创业点子。

核心原则：
1. 第一印象必须让人想笑或想骂『这什么玩意』，但认真看又觉得『卧槽也许能成』
2. 必须是有实际商业可能的点子，不要纯段子（你不是在写脱口秀）
3. 参考历史上真实存在过的反直觉成功案例：Airbnb / Twitter / 拼多多 / 泡泡玛特 / OnlyFans / Duolingo
4. 目标受众优先中国 / 华语市场，但也可以是全球化点子
5. 全部输出中文
6. whySB 要写得像微博评论区的吐槽，别客气
7. whyWorks 要写得像 a16z 投资备忘录，有理有据
8. 不要重复常见案例（Uber for X 之类已经被玩烂的不要）
9. 每一次生成都要给出一个全新的、有惊喜感的点子
10. 禁止输出违法、涉黄、歧视、政治敏感内容`;

const SEED_PROMPTS = [
  "关注那些被主流社会忽视的小众需求或尴尬场景",
  "把两个不相关的行业硬拼在一起看看能不能化学反应",
  "把一个奢侈品体验做成白菜价，或者把一个白菜体验做成奢侈品",
  "从一个『大家都默认的麻烦事』里找出可以收费的那一步",
  "把线下的冷门服务搬到线上，或者把线上的热门服务反向搬到线下",
  "利用 AI 让一个原本需要专业技能的服务变成人人可用",
  "针对某个特定群体（银发族 / Z 世代 / 单身狗 / 宝妈 / 夜猫子）的深度刚需",
  "从『反社交 / 反效率 / 反精致』的逆向角度切入",
  "把一个被嫌弃的属性（丑、慢、吵、贵）变成卖点",
];

function pickSeed() {
  return SEED_PROMPTS[Math.floor(Math.random() * SEED_PROMPTS.length)];
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      hint?: string;
    };

    const seed = pickSeed();
    const userHint = body.hint?.trim();

    const prompt = [
      `本次生成方向提示（你可以遵循也可以偏离）：${seed}`,
      userHint
        ? `用户额外要求：${userHint}`
        : `用户没有给出额外要求，请你尽情发挥。`,
      `现在，请生成 1 个 SB 创业点子，严格按照 schema 返回。`,
    ].join("\n\n");

    const result = await withModelFallback("generate", (model) =>
      generateText({
        model,
        maxRetries: 0,
        output: Output.object({ schema: IdeaSchema }),
        system: SYSTEM_PROMPT,
        prompt,
        temperature: 1.0,
      })
    );

    return Response.json({ ok: true, idea: result.output, seed });
  } catch (error) {
    console.error("[/api/generate]", error);
    const message =
      error instanceof Error ? error.message : "生成失败，请稍后再试";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
