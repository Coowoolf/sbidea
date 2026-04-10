import { streamText } from "ai";
import { getStreamingModelFor } from "@/lib/models";
import { TYPES } from "@/lib/sbti";

export const runtime = "nodejs";
export const maxDuration = 60;

type StoryStyle = "techcrunch" | "founder" | "biography";

const VALID_STYLES = new Set<StoryStyle>(["techcrunch", "founder", "biography"]);

interface StoryRequest {
  sbtiCode: string;
  mbtiType: string;
  profileName: string;
  profileEmoji: string;
  profileNumber: number;
  style: StoryStyle;
  todaySbMeaning: string;
  stops: Record<string, { summary: string; data: Record<string, unknown> }>;
}

function buildSystemPrompt(body: StoryRequest): string {
  // Look up SBTI profile for personality traits
  const profile = TYPES[body.sbtiCode];
  const traits = profile?.traits?.join("；") ?? "未知";
  const strengths = profile?.strengths?.join("；") ?? "未知";
  const watchOut = profile?.watchOut?.join("；") ?? "未知";
  const suitableIdeas = profile?.suitableIdeas ?? "未知";
  const famousKind = profile?.famousKind ?? "未知";

  // Format stop results as plot material
  const stopEntries = Object.entries(body.stops);
  const stopsBlock = stopEntries.length > 0
    ? stopEntries
        .map(([product, stop]) => {
          const dataStr = Object.entries(stop.data)
            .map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
            .join("，");
          return `- 【${product}】摘要：${stop.summary}${dataStr ? `（${dataStr}）` : ""}`;
        })
        .join("\n")
    : "- 暂无站点数据";

  return `你是一位极擅长讲故事的创业领域资深写手，为 sbidea.ai 平台的用户生成个性化的"未来成功故事"。

## 你的任务

根据用户的创业人格测试结果和冒险旅程中各站的收获，写一篇 800-1200 字的中文故事。
这篇故事是送给用户的礼物——基于真实数据编织的一段虚构但让人心潮澎湃的未来叙事。

## 三种文风

1. **TechCrunch 报道体**：以科技媒体视角，用"2028 年，[公司名] 宣布完成 B 轮融资……"开场，带有数据、引述、行业分析。语气客观但隐含敬意，仿佛在报道一个真实的商业传奇。
2. **创始人自述体**：第一人称回忆录，"三年前那个晚上，我在 sbidea.ai 上测出自己是 #${body.profileNumber} 号 ${body.profileName}……"开场。语气私密、真诚、有笑有泪，像创始人在融资晚宴上的即兴演讲。
3. **传记特写体**：第三人称特写，"TA 当时还不知道，那个被所有人骂 SB 的想法，会改变一个行业。"开场。语气沉稳、有画面感，像《人物》杂志的封面长文。

用户选择的文风：**${body.style === "techcrunch" ? "TechCrunch 报道体" : body.style === "founder" ? "创始人自述体" : "传记特写体"}**

## 用户的创业人格

- SBTI 类型：${body.sbtiCode}（${body.profileEmoji} #${body.profileNumber} ${body.profileName}）
- MBTI 类型：${body.mbtiType}
- 性格特征：${traits}
- 核心优势：${strengths}
- 盲区/风险：${watchOut}
- 适合的方向：${suitableIdeas}
- 类似的成功者：${famousKind}

## 冒险旅途中的各站收获（请全部织入故事）

${stopsBlock}

## 今日 SB 定义（作为主题线索贯穿故事）

"${body.todaySbMeaning}"

## 写作要求

1. 字数 800-1200 字，不要太短也不要注水
2. 必须把上面【每一个站点的收获】都自然地编织为故事中的情节要素——不是简单罗列，而是变成叙事的转折点、灵感来源、关键决策的依据等
3. 融入用户的人格特征：优势是怎么发挥的，盲区是怎么在某个关键时刻差点害了 TA、最终又是怎么克服的
4. 把"${body.todaySbMeaning}"作为一条情感暗线——在开头或结尾呼应这个主题
5. 结尾要鼓舞人心但不悬浮，不要鸡汤空话，要有落地感——让人觉得"这个故事虽然是虚构的，但好像真的可以发生"
6. 排版像微信公众号长文：使用 markdown 的大标题（##）、引用块（>）、粗体（**）、分隔线（---）来增强阅读体验
7. 最后一行加上品牌水印：> *${body.todaySbMeaning} — sbidea.ai*
8. 全部使用中文
9. 不要输出 JSON，直接输出 markdown 正文`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as StoryRequest | null;

    if (!body) {
      return new Response("请求体格式错误", { status: 400 });
    }

    // Validate required fields
    if (!body.sbtiCode || typeof body.sbtiCode !== "string") {
      return new Response("缺少 sbtiCode", { status: 400 });
    }
    if (!body.mbtiType || typeof body.mbtiType !== "string") {
      return new Response("缺少 mbtiType", { status: 400 });
    }
    if (!body.profileName || typeof body.profileName !== "string") {
      return new Response("缺少 profileName", { status: 400 });
    }
    if (!body.profileEmoji || typeof body.profileEmoji !== "string") {
      return new Response("缺少 profileEmoji", { status: 400 });
    }
    if (typeof body.profileNumber !== "number") {
      return new Response("缺少 profileNumber", { status: 400 });
    }
    if (!body.style || !VALID_STYLES.has(body.style)) {
      return new Response("style 必须是 techcrunch / founder / biography 之一", {
        status: 400,
      });
    }
    if (!body.todaySbMeaning || typeof body.todaySbMeaning !== "string") {
      return new Response("缺少 todaySbMeaning", { status: 400 });
    }
    if (!body.stops || typeof body.stops !== "object") {
      return new Response("缺少 stops", { status: 400 });
    }

    const systemPrompt = buildSystemPrompt(body);

    const result = streamText({
      model: getStreamingModelFor("adventure-story"),
      maxRetries: 0,
      system: systemPrompt,
      prompt: `请为 ${body.profileEmoji} #${body.profileNumber} ${body.profileName}（${body.sbtiCode}）生成一篇 ${body.style === "techcrunch" ? "TechCrunch 报道体" : body.style === "founder" ? "创始人自述体" : "传记特写体"} 风格的未来成功故事。`,
      temperature: 0.9,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[/api/adventure-story]", error);
    const message =
      error instanceof Error ? error.message : "故事生成失败，请稍后再试";
    return new Response(message, { status: 500 });
  }
}
