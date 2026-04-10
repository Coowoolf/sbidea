import { generateText, Output } from "ai";
import { z } from "zod";
import { withModelFallback } from "@/lib/models";

export const runtime = "nodejs";
export const maxDuration = 60;

const SbIdeaSchema = z.object({
  name: z.string().describe("点子名称，6 字以内"),
  oneLiner: z.string().describe("一句话描述，25 字以内"),
  whyFit: z.string().describe("为什么适合这个人格，40-60 字"),
});

const ProfileSchema = z.object({
  number: z
    .number()
    .int()
    .min(1)
    .max(100)
    .describe("创业人格编号 1-100，基于 SBTI+MBTI 组合的唯一编号"),
  name: z.string().describe("创意中文人格名，6-8 字，要有画面感和记忆点"),
  emoji: z.string().describe("1 个最能代表这个人格的 emoji"),
  tagline: z
    .string()
    .describe("一句话标签，20 字以内，概括这个人格的核心特质"),
  overview: z
    .string()
    .describe(
      "200-300 字的深度画像。要写得像在描述一个真实的人，有场景、有细节、有温度。不要列表，要叙事。"
    ),
  strengths: z
    .array(z.string())
    .length(3)
    .describe("3 条核心优势，每条 15-25 字"),
  blindspots: z
    .array(z.string())
    .length(2)
    .describe("2 条盲区/暗面，每条 15-25 字"),
  idealCofounder: z.object({
    sbtiCode: z.string().describe("最适合搭档的 SBTI 4 字母 code"),
    reason: z.string().describe("为什么配，40-60 字"),
  }),
  sbIdeas: z
    .array(SbIdeaSchema)
    .length(3)
    .describe("3 个最适合这个人格的 SB 创业点子"),
  fortune: z
    .string()
    .describe(
      "80-120 字的创业运势，要有仪式感，像塔罗师在说话。包含一个具体的行动建议。"
    ),
  gradientFrom: z
    .string()
    .describe("结果卡渐变起始色 hex (#RRGGBB)，鲜亮但不俗"),
  gradientTo: z
    .string()
    .describe("结果卡渐变结束色 hex (#RRGGBB)，和起始色形成高级反差"),
});

export type SbtiProfile = z.infer<typeof ProfileSchema>;

const SYSTEM_PROMPT = `你是 SBTI (Startup Builder Type Indicator) 的首席人格分析师。
你要根据用户的创业人格测试结果 (SBTI 4 字母 code) 和 MBTI 类型，生成一份深度个性化的创业人格画像报告。

## SBTI 四轴解读

- W (Wild) = 冲动型、敢赌、先干再说 / Z (Zen) = 冷静型、先想后做、风险规避
- F (Fast) = 快速迭代、Done > Perfect / S (Slow) = 精工细作、质量优先
- I (Individual) = 独行侠、一个人扛 / T (Team) = 团队作战、分工协作
- M (Market) = 销售驱动、用户买单最重要 / A (Art) = 作品驱动、产品说话

## MBTI 四轴解读

- E/I = 外向 / 内向（能量来源）
- S/N = 实感 / 直觉（信息获取方式）
- T/F = 思考 / 情感（决策方式）
- J/P = 判断 / 感知（生活方式）

## 你的任务

结合两个系统，生成一份独一无二的创业人格画像。

要求：
1. overview 要写得像在描述一个真实的朋友，有场景、有细节、有温度，不要干巴巴的列表
2. strengths 和 blindspots 要针对创业场景，不要泛泛而谈
3. idealCofounder 要给出具体的 SBTI code 和配对逻辑
4. sbIdeas 要和这个人的性格真正匹配——不是随机的点子，是"只有这种人才会做成"的点子
5. fortune 要有仪式感和诗意，但也要接地气
6. number 编号 1-100 根据 SBTI+MBTI 组合确定，同一组合永远同一编号
7. 全部中文输出
8. gradientFrom / gradientTo 要和这个人格的气质匹配（暖色=外向/热情，冷色=内敛/理性）
9. 禁止输出违法、涉黄、歧视、政治敏感内容`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      sbtiCode?: string;
      mbtiType?: string;
    };

    const sbtiCode = (body.sbtiCode ?? "").trim().toUpperCase();
    const mbtiType = (body.mbtiType ?? "unknown").trim().toUpperCase();

    if (!/^[WZ][FS][IT][MA]$/.test(sbtiCode)) {
      return Response.json(
        { ok: false, error: "无效的 SBTI code" },
        { status: 400 }
      );
    }

    const mbtiLabel =
      mbtiType === "UNKNOWN" || !mbtiType
        ? "用户不确定自己的 MBTI，请你根据 SBTI 结果合理推测一个最可能的 MBTI 类型并在分析中说明"
        : `用户的 MBTI 是 ${mbtiType}`;

    const prompt = [
      `用户的 SBTI 测试结果：${sbtiCode}`,
      `${mbtiLabel}`,
      ``,
      `请为这个创业人格组合生成一份完整的画像报告。`,
      ``,
      `注意：number 编号请根据 "${sbtiCode}-${mbtiType}" 这个组合来确定（1-100），相同组合永远给相同编号。`,
    ].join("\n");

    const output = await withModelFallback("generate", async (model) => {
      const result = await generateText({
        model,
        maxRetries: 0,
        output: Output.object({ schema: ProfileSchema }),
        system: SYSTEM_PROMPT,
        prompt,
        temperature: 0.85,
      });
      return result.output;
    });

    return Response.json({ ok: true, profile: output });
  } catch (error) {
    console.error("[/api/sbti-profile]", error);
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "人格分析师走神了，请重试",
      },
      { status: 500 }
    );
  }
}
