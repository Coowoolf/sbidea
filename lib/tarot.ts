/**
 * SB 创业塔罗 · 22 张大阿卡那
 * 每张牌对应一个创业主题原型。
 */

export type TarotCard = {
  id: number;
  name: string;
  englishHint: string; // original MBTI-ish hint
  emoji: string;
  keywords: string[];
  meaning: string;
};

export const TAROT_DECK: TarotCard[] = [
  {
    id: 0,
    name: "愚者 · 第一次 Push",
    englishHint: "The Fool",
    emoji: "🎒",
    keywords: ["开始", "无知者无畏", "初心"],
    meaning: "你正处在那种『什么都不懂也就什么都不怕』的黄金状态，现在是下场的最好时刻。",
  },
  {
    id: 1,
    name: "魔术师 · MVP 工程师",
    englishHint: "The Magician",
    emoji: "🪄",
    keywords: ["动手", "执行力", "工具箱"],
    meaning: "你拥有把想法快速变成 demo 的能力，现在最缺的不是点子，而是坐下来的那 2 小时。",
  },
  {
    id: 2,
    name: "女祭司 · 用户洞察",
    englishHint: "The High Priestess",
    emoji: "🔮",
    keywords: ["直觉", "观察", "倾听"],
    meaning: "别再猜了，去找 5 个真实用户聊 30 分钟。答案早就在他们嘴里了。",
  },
  {
    id: 3,
    name: "皇后 · 内容创作",
    englishHint: "The Empress",
    emoji: "🌷",
    keywords: ["创造", "品牌", "亲和力"],
    meaning: "别急着拉增长，先把你的第一条 Twitter 或小红书写好，品牌感是滚雪球的开始。",
  },
  {
    id: 4,
    name: "皇帝 · 产品经理",
    englishHint: "The Emperor",
    emoji: "🏛️",
    keywords: ["结构", "权威", "路线图"],
    meaning: "你需要一张清晰的 roadmap，而不是一张 To-Do 清单。结构比冲动重要。",
  },
  {
    id: 5,
    name: "教皇 · 社区导师",
    englishHint: "The Hierophant",
    emoji: "📖",
    keywords: ["传承", "导师", "圈子"],
    meaning: "现在是找一位比你走过 3 步的 mentor 的好时刻，别自己瞎琢磨了。",
  },
  {
    id: 6,
    name: "恋人 · 合伙人",
    englishHint: "The Lovers",
    emoji: "💞",
    keywords: ["合伙", "关系", "承诺"],
    meaning: "你将面临一次关键的『和谁一起做』的选择，想清楚再签字。",
  },
  {
    id: 7,
    name: "战车 · 产品发布",
    englishHint: "The Chariot",
    emoji: "🏎️",
    keywords: ["冲刺", "上线", "发射"],
    meaning: "停止打磨，马上发射。拖延一天，对手就多一天。",
  },
  {
    id: 8,
    name: "力量 · 坚持",
    englishHint: "Strength",
    emoji: "🦁",
    keywords: ["韧性", "耐心", "内核"],
    meaning: "你会经历一段没人看的寂寞时光，能不能熬过去，决定了这件事的上限。",
  },
  {
    id: 9,
    name: "隐士 · 单干模式",
    englishHint: "The Hermit",
    emoji: "🕯️",
    keywords: ["独处", "深思", "少即是多"],
    meaning: "关掉 Slack 和群聊，一个人闭关一周，你会想明白到底该做什么。",
  },
  {
    id: 10,
    name: "命运之轮 · 机会窗口",
    englishHint: "Wheel of Fortune",
    emoji: "🎡",
    keywords: ["时机", "风口", "命运"],
    meaning: "你碰到了一扇转瞬即逝的窗口，敢不敢伸手决定了接下来几年。",
  },
  {
    id: 11,
    name: "正义 · 定价与分成",
    englishHint: "Justice",
    emoji: "⚖️",
    keywords: ["公平", "定价", "分配"],
    meaning: "你和合伙人、用户、投资人之间的『值不值』问题，现在必须被摆上台面。",
  },
  {
    id: 12,
    name: "倒吊人 · 卡住的时候",
    englishHint: "The Hanged Man",
    emoji: "🙃",
    keywords: ["换视角", "暂停", "顿悟"],
    meaning: "你现在卡住的问题，换一个视角就是答案。别硬推，反着想。",
  },
  {
    id: 13,
    name: "死神 · pivot",
    englishHint: "Death",
    emoji: "💀",
    keywords: ["结束", "转向", "重生"],
    meaning: "现在的版本该死了，不要舍不得。一次痛快的 pivot 胜过三个月的硬撑。",
  },
  {
    id: 14,
    name: "节制 · 节奏管理",
    englishHint: "Temperance",
    emoji: "🫖",
    keywords: ["平衡", "节奏", "可持续"],
    meaning: "你的冲刺节奏过快，可能会在第 6 个月烧光体力。现在就要学会停一下。",
  },
  {
    id: 15,
    name: "恶魔 · 诱惑",
    englishHint: "The Devil",
    emoji: "😈",
    keywords: ["诱惑", "依赖", "快钱"],
    meaning: "有一笔快钱正在朝你招手，接了可能卡住你三年的路径。三思。",
  },
  {
    id: 16,
    name: "塔 · 崩塌",
    englishHint: "The Tower",
    emoji: "🗼",
    keywords: ["突发", "危机", "清零"],
    meaning: "一个你以为稳固的基础可能会瞬间坍塌。准备好 Plan B。",
  },
  {
    id: 17,
    name: "星星 · 愿景",
    englishHint: "The Star",
    emoji: "⭐",
    keywords: ["希望", "长远", "北极星"],
    meaning: "拿出纸笔，写下你这件事 3 年后的样子。没有这张图你走不远。",
  },
  {
    id: 18,
    name: "月亮 · 数据迷雾",
    englishHint: "The Moon",
    emoji: "🌙",
    keywords: ["模糊", "数据", "直觉"],
    meaning: "现在你看不清真正的信号。先把数据面板做出来，别凭感觉做决策。",
  },
  {
    id: 19,
    name: "太阳 · PMF",
    englishHint: "The Sun",
    emoji: "☀️",
    keywords: ["PMF", "明朗", "增长"],
    meaning: "你距离一次真正的 PMF 只差一个具体的用户群，再聚焦一点。",
  },
  {
    id: 20,
    name: "审判 · 复盘",
    englishHint: "Judgement",
    emoji: "📯",
    keywords: ["复盘", "觉醒", "定位"],
    meaning: "是时候诚实地问自己：这件事我到底想做成什么，还是只想做。",
  },
  {
    id: 21,
    name: "世界 · IPO 或 Exit",
    englishHint: "The World",
    emoji: "🌍",
    keywords: ["完成", "圆满", "下一程"],
    meaning: "这一段的故事快要圆了，想清楚下一段是谁，再画一笔。",
  },
];

export function drawThree(): [TarotCard, TarotCard, TarotCard] {
  const copy = [...TAROT_DECK];
  const out: TarotCard[] = [];
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return out as [TarotCard, TarotCard, TarotCard];
}
