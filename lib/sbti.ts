/**
 * SBTI — SB Type Indicator
 *
 * Four binary axes, each scored by 3 questions, total 12 questions.
 *
 * Axes:
 *   W vs Z — Wild (rush in) vs Zen (meditate first)
 *   F vs S — Fast iterator vs Slow craftsman
 *   I vs T — Individual operator vs Team operator
 *   M vs A — Market / sales driven vs Art / craft driven
 *
 * Type code is 4 chars, e.g. "WFIM" = 独狼推销员 (lone-wolf hustler).
 */

export type Axis = "WZ" | "FS" | "IT" | "MA";
export type AxisLetter = "W" | "Z" | "F" | "S" | "I" | "T" | "M" | "A";

export type Question = {
  id: string;
  axis: Axis;
  /** choice A gives +1 to first letter of axis (W/F/I/M), B gives second */
  prompt: string;
  a: string;
  b: string;
};

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    axis: "WZ",
    prompt: "半夜 3 点你突然想到一个点子，你会？",
    a: "马上爬起来写代码/文档，今晚不睡了",
    b: "先记下来，明天头脑清醒再判断值不值得做",
  },
  {
    id: "q2",
    axis: "FS",
    prompt: "你准备做一个新产品，第一步通常是？",
    a: "一周内搞一个最小可见的 demo 出来给人看",
    b: "先做三周的用户研究和市场分析",
  },
  {
    id: "q3",
    axis: "IT",
    prompt: "遇到自己不擅长的模块（比如不会设计），你会？",
    a: "自己硬学，反正网上教程那么多",
    b: "赶紧找一个靠谱的人一起搞，分工更快",
  },
  {
    id: "q4",
    axis: "MA",
    prompt: "拿到第一笔钱时你最先想做什么？",
    a: "加大推广预算，让更多人知道",
    b: "继续把产品打磨得更好看/更好用",
  },
  {
    id: "q5",
    axis: "WZ",
    prompt: "你和朋友聊创业，朋友说『这不行吧』，你会？",
    a: "心里更兴奋，觉得没竞争",
    b: "回去认真复盘一下他说的对不对",
  },
  {
    id: "q6",
    axis: "FS",
    prompt: "你更认同下面哪句话？",
    a: "Done is better than perfect",
    b: "值得做的事情值得做好",
  },
  {
    id: "q7",
    axis: "IT",
    prompt: "参加创业活动，你最常出现的姿势是？",
    a: "一个人默默观察，加想加的几个人",
    b: "到处搭讪加微信，先把网络建起来",
  },
  {
    id: "q8",
    axis: "MA",
    prompt: "产品上线后，你更愿意花时间在？",
    a: "追着用户问他们买不买，为什么不买",
    b: "优化界面、打磨动画、调字体",
  },
  {
    id: "q9",
    axis: "WZ",
    prompt: "你看到一个机会窗口，你会？",
    a: "立刻冲进去，比别人快一天都是命",
    b: "想清楚再冲，不然就是白跑一趟",
  },
  {
    id: "q10",
    axis: "FS",
    prompt: "面对用户反馈『还差点意思』，你的反应？",
    a: "先上线看数据，不要陷入过度打磨",
    b: "那就不上线，差哪补哪",
  },
  {
    id: "q11",
    axis: "IT",
    prompt: "项目到关键节点，你更愿意？",
    a: "关起门来自己一个人干到天亮",
    b: "拉所有人开会对齐再一起推进",
  },
  {
    id: "q12",
    axis: "MA",
    prompt: "你更有可能被夸的是？",
    a: "『这家伙销售很有一套』",
    b: "『这家伙手艺真好』",
  },
];

export type SbtiType = {
  code: string; // e.g. "WFIM"
  name: string;
  emoji: string;
  tagline: string;
  traits: string[];
  strengths: string[];
  watchOut: string[];
  suitableIdeas: string;
  avoid: string;
  famousKind: string;
};

export const TYPES: Record<string, SbtiType> = {
  WFIM: {
    code: "WFIM",
    name: "独狼推销员",
    emoji: "🐺",
    tagline: "野性 · 快打 · 独行 · 销售驱动",
    traits: [
      "不怎么开会，开会也是自己发言",
      "白天跑单子，晚上写代码",
      "销售能力是靠 100 个被拒绝练出来的",
    ],
    strengths: [
      "执行力拉满，0-1 阶段速度惊人",
      "能直接对着客户谈钱，不怕被拒绝",
      "决策链极短，转向快",
    ],
    watchOut: [
      "不擅长带团队，规模化后容易卡住",
      "容易把所有英雄主义都扛在自己肩上",
    ],
    suitableIdeas: "需要快速拿下第一个 100 个付费用户的生意，比如 B2B SaaS 的冷启动、DTC 小品类",
    avoid: "需要深度技术壁垒、耐心十年的科研型公司",
    famousKind: "早期的 Elon Musk / Pieter Levels",
  },
  WFIA: {
    code: "WFIA",
    name: "车库艺术家",
    emoji: "🎸",
    tagline: "野性 · 快打 · 独行 · 工艺驱动",
    traits: [
      "一个人关在屋里一周就能憋出一个作品",
      "做出来的东西自带气质，不像模板",
      "不怎么说话，但每次发推都有人转",
    ],
    strengths: [
      "美学直觉极强，第一眼就能打动用户",
      "小而美产品的天选之人",
      "独立开发者收入的上限很高",
    ],
    watchOut: [
      "销售和推广经常是短板",
      "容易陷在『再打磨一下』的死循环",
    ],
    suitableIdeas: "Indie app、风格化工具、独立游戏、艺术向 SaaS",
    avoid: "需要大规模销售和地推的传统行业",
    famousKind: "早期的 Dieter Rams / Teenage Engineering 创始人",
  },
  WFTM: {
    code: "WFTM",
    name: "疯子 CEO",
    emoji: "🔥",
    tagline: "野性 · 快打 · 团队 · 销售驱动",
    traits: [
      "全员开会气氛热烈，CEO 发言占 60%",
      "每周都换一个战略方向",
      "能在凌晨把 VC 说服到投第二轮",
    ],
    strengths: [
      "拉人和融资是天赋技能",
      "能在短时间内聚拢一个能打的小团队",
      "极强的场面感染力",
    ],
    watchOut: [
      "节奏太快容易内部失速",
      "团队流失率可能偏高",
    ],
    suitableIdeas: "需要巨大融资、快速扩张的市场抢位战",
    avoid: "需要十年默默打磨的冷门技术",
    famousKind: "早期的 Travis Kalanick / Adam Neumann",
  },
  WFTA: {
    code: "WFTA",
    name: "摇滚乐队主唱",
    emoji: "🎤",
    tagline: "野性 · 快打 · 团队 · 工艺驱动",
    traits: [
      "团队里每个人都有自己的风格但又都听他的",
      "产品发布像一场演出",
      "重视氛围超过 KPI",
    ],
    strengths: [
      "能把才华各异的怪人聚在一起",
      "产品有强烈的作品感和文化感",
      "品牌力和社群力极强",
    ],
    watchOut: [
      "商业化节奏容易被艺术坚持拖住",
      "核心成员一离开打击巨大",
    ],
    suitableIdeas: "内容平台、文化品牌、创意工具、独立媒体",
    avoid: "纯效率导向的工具产品",
    famousKind: "早期的 Brian Chesky / Tobias Lütke",
  },
  WSIM: {
    code: "WSIM",
    name: "长期主义猎人",
    emoji: "🏹",
    tagline: "野性 · 慢工 · 独行 · 销售驱动",
    traits: [
      "不爱参加活动，但每一次出手都猎到大单",
      "相信复利，看重多年前埋下的种子",
      "很少发朋友圈，但朋友圈都是真本事",
    ],
    strengths: [
      "能把十年冷板凳坐成护城河",
      "客户关系极其深厚",
      "对价格和价值的判断精准",
    ],
    watchOut: [
      "冷启动阶段容易寂寞",
      "错过需要快速扩张的窗口",
    ],
    suitableIdeas: "专业服务、企业级长单、稀缺行业的咨询",
    avoid: "需要快速迭代的消费互联网",
    famousKind: "Charlie Munger 式的孤独投资者",
  },
  WSIA: {
    code: "WSIA",
    name: "一人工坊匠人",
    emoji: "🛠️",
    tagline: "野性 · 慢工 · 独行 · 工艺驱动",
    traits: [
      "一个产品做三年不嫌久",
      "拒绝融资，靠订单活着",
      "代码 / 设计 / 文档都亲自写",
    ],
    strengths: [
      "作品质量让人上瘾",
      "成本低到可怕，抗风险能力强",
      "不需要团队管理的烦恼",
    ],
    watchOut: [
      "规模上限低，容易被大厂抄",
      "个人健康就是公司命脉",
    ],
    suitableIdeas: "Indie 工具、字体、插件、艺术品",
    avoid: "需要重资产或监管资质的行业",
    famousKind: "日本那种一辈子只做一种寿司的匠人",
  },
  WSTM: {
    code: "WSTM",
    name: "深耕派 CEO",
    emoji: "🌳",
    tagline: "野性 · 慢工 · 团队 · 销售驱动",
    traits: [
      "做一个行业做十年",
      "团队是战友不是员工",
      "销售像布道",
    ],
    strengths: [
      "行业认知深到可怕",
      "客户忠诚度极高",
      "能穿越周期",
    ],
    watchOut: [
      "错过相邻的新机会",
      "组织迭代可能偏慢",
    ],
    suitableIdeas: "行业 SaaS、垂直解决方案、to G 业务",
    avoid: "追热点的消费品",
    famousKind: "Atlassian 早期的两位创始人",
  },
  WSTA: {
    code: "WSTA",
    name: "大师工坊",
    emoji: "🎨",
    tagline: "野性 · 慢工 · 团队 · 工艺驱动",
    traits: [
      "每一个产品都像作品集",
      "团队成员跟着创始人进化",
      "拒绝平庸的上线",
    ],
    strengths: [
      "产品质感独一档",
      "被行业尊敬甚至膜拜",
      "能吸引最顶尖的人才加入",
    ],
    watchOut: [
      "扩张速度慢到焦虑",
      "可能一直在被人抄",
    ],
    suitableIdeas: "精品 SaaS、设计驱动工具、奢侈品",
    avoid: "拼低价的红海",
    famousKind: "Linear 的早期团队 / 早期的苹果",
  },
  ZFIM: {
    code: "ZFIM",
    name: "套路熟练工",
    emoji: "♟️",
    tagline: "冷静 · 快打 · 独行 · 销售驱动",
    traits: [
      "不冲动，但每一次出手都讲究 ROI",
      "数据表是他的日常娱乐",
      "能把一件事复制到第五次",
    ],
    strengths: [
      "冷启动打法稳定可靠",
      "能识别真正的机会而非噪音",
      "长期下来 ROI 远高于野心家",
    ],
    watchOut: [
      "缺少 0-1 的爆点",
      "容易陷在增量里错过质变",
    ],
    suitableIdeas: "套利型小生意、广告 arbitrage、海外站群",
    avoid: "故事驱动的 to VC 公司",
    famousKind: "那个月入百万但没人听说过的独立开发者",
  },
  ZFIA: {
    code: "ZFIA",
    name: "效率工匠",
    emoji: "⚙️",
    tagline: "冷静 · 快打 · 独行 · 工艺驱动",
    traits: [
      "只用自己顺手的工具链",
      "每一次迭代都是重构",
      "审美在线但不执着",
    ],
    strengths: [
      "能快速输出高质量作品",
      "对工具链有深度理解",
      "独立开发者的标杆",
    ],
    watchOut: [
      "容易活在工具洁癖里",
      "商业化节奏可能偏保守",
    ],
    suitableIdeas: "开发者工具、效率 App、技术博客",
    avoid: "需要大量路人用户教育的 to C 生意",
    famousKind: "那些 Hacker News 常驻榜一的独立开发者",
  },
  ZFTM: {
    code: "ZFTM",
    name: "职业经理人创业者",
    emoji: "🕴️",
    tagline: "冷静 · 快打 · 团队 · 销售驱动",
    traits: [
      "团队架构图写得比产品文档还清楚",
      "每周一、三、五都有例会",
      "融资材料 48 小时搞定",
    ],
    strengths: [
      "管理和融资双满点",
      "能快速拉起一个可控的组织",
      "执行力和治理一起在线",
    ],
    watchOut: [
      "原创产品直觉可能偏弱",
      "有时过于相信流程",
    ],
    suitableIdeas: "复制海外成熟模式、行业整合、并购型创业",
    avoid: "需要极端原创的先锋产品",
    famousKind: "那些从大厂离职三个月就拿到 Pre-A 的高管",
  },
  ZFTA: {
    code: "ZFTA",
    name: "产品经理派",
    emoji: "🧩",
    tagline: "冷静 · 快打 · 团队 · 工艺驱动",
    traits: [
      "A/B 测试是宗教",
      "每一个像素都要对齐",
      "用 Figma 开会",
    ],
    strengths: [
      "产品体验精致可控",
      "能跨团队协作把细节拉满",
      "对用户研究有方法论",
    ],
    watchOut: [
      "有时过度依赖方法论",
      "情绪色彩可能偏淡",
    ],
    suitableIdeas: "工具 SaaS、效率产品、to C 精品 App",
    avoid: "需要话题和情绪驱动的文化产品",
    famousKind: "Notion 早期团队风格",
  },
  ZSIM: {
    code: "ZSIM",
    name: "渠道老炮",
    emoji: "🛤️",
    tagline: "冷静 · 慢工 · 独行 · 销售驱动",
    traits: [
      "所有资源都在他个人的关系里",
      "一年只做几单，但单单赚钱",
      "生活极简，生意极深",
    ],
    strengths: [
      "抗风险能力接近满分",
      "关系链护城河极深",
      "现金流稳定",
    ],
    watchOut: [
      "规模上限受限于个人精力",
      "接班人很难找",
    ],
    suitableIdeas: "传统贸易、行业中介、线下服务",
    avoid: "需要技术护城河的前沿赛道",
    famousKind: "那种开奔驰但低调到不发朋友圈的叔叔",
  },
  ZSIA: {
    code: "ZSIA",
    name: "匠人",
    emoji: "🪵",
    tagline: "冷静 · 慢工 · 独行 · 工艺驱动",
    traits: [
      "相信时间是最好的催化剂",
      "不被流量牵着鼻子走",
      "作品是自己最骄傲的事",
    ],
    strengths: [
      "作品质感无可替代",
      "自我驱动力极强",
      "一旦被发现就会被长期支持",
    ],
    watchOut: [
      "早期很可能长期没收入",
      "扩张意愿低",
    ],
    suitableIdeas: "艺术、字体、独立游戏、长周期创作",
    avoid: "任何需要快周转的商业模式",
    famousKind: "那种做一款独立游戏十年的开发者",
  },
  ZSTM: {
    code: "ZSTM",
    name: "孵化家",
    emoji: "🏗️",
    tagline: "冷静 · 慢工 · 团队 · 销售驱动",
    traits: [
      "擅长培养人和体系",
      "不求一战成名，求年年复利",
      "人脉深厚但低调",
    ],
    strengths: [
      "组织能力拉满",
      "能同时孵化多条业务线",
      "对行业周期把握稳",
    ],
    watchOut: [
      "创新速度偏慢",
      "容易被新势力偷袭",
    ],
    suitableIdeas: "平台型生意、企业服务集团、行业孵化器",
    avoid: "快周期的潮流生意",
    famousKind: "日本的三菱、韩国的 CJ 集团创始人风格",
  },
  ZSTA: {
    code: "ZSTA",
    name: "教授式创始人",
    emoji: "🎓",
    tagline: "冷静 · 慢工 · 团队 · 工艺驱动",
    traits: [
      "用论文的态度做产品",
      "团队像一个研究所",
      "产品说明书比产品还厚",
    ],
    strengths: [
      "技术深度极强",
      "能做出行业新范式",
      "人才聚集力大",
    ],
    watchOut: [
      "商业化节奏极慢",
      "容易被更会讲故事的公司超越",
    ],
    suitableIdeas: "深科技、AI 基础模型、生物医药",
    avoid: "需要快速变现的消费 App",
    famousKind: "DeepMind 早期 / OpenAI 早期学院派",
  },
};

export function codeOf(scores: Record<AxisLetter, number>): string {
  const letter = (a: AxisLetter, b: AxisLetter) =>
    scores[a] >= scores[b] ? a : b;
  return (
    letter("W", "Z") +
    letter("F", "S") +
    letter("I", "T") +
    letter("M", "A")
  );
}

export function emptyScores(): Record<AxisLetter, number> {
  return { W: 0, Z: 0, F: 0, S: 0, I: 0, T: 0, M: 0, A: 0 };
}
