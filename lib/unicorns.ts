/**
 * SB to Unicorn Wall — curated list of real companies that
 * sounded stupid at launch but became enormous businesses.
 *
 * Every entry needs:
 * - slug (URL-safe id)
 * - name, oneLiner, category, yearFounded
 * - founders
 * - sbQuote (an actual "this sounds stupid" reaction at launch)
 * - whyItSounded (why people dismissed it)
 * - whatMadeItWork (the non-obvious insight)
 * - nowValuation (current rough scale)
 * - lesson (one-line takeaway for readers)
 */

export type Unicorn = {
  slug: string;
  name: string;
  oneLiner: string;
  category: string;
  yearFounded: number;
  founders: string;
  sbQuote: string;
  whyItSounded: string[];
  whatMadeItWork: string[];
  nowValuation: string;
  lesson: string;
};

export const unicorns: Unicorn[] = [
  {
    slug: "airbnb",
    name: "Airbnb",
    oneLiner: "让陌生人睡你家的气垫床",
    category: "共享住宿",
    yearFounded: 2008,
    founders: "Brian Chesky, Joe Gebbia, Nathan Blecharczyk",
    sbQuote: "谁会想睡陌生人家的客厅气垫床？也不怕被杀了埋后院？",
    whyItSounded: [
      "让陌生人进你家这件事本身就反人性",
      "酒店业已经高度成熟，凭什么需要第三个选项",
      "初期 YC 面试时几乎每个 VC 都拒绝了",
      "创始人为了活下来靠卖大选主题麦片筹钱",
    ],
    whatMadeItWork: [
      "大型活动（政治大会、音乐节）城市酒店一房难求时，市场真空非常明显",
      "专业摄影师免费为房东拍照这一个动作，让供给质量和转化率都翻倍",
      "社交网络让陌生人信任成本大幅下降",
      "在旅游预算紧张的千禧一代中，价格 + 『本地人家』的体验感击穿了酒店",
    ],
    nowValuation: "市值约 800 亿美元",
    lesson: "当你的 idea 被质疑『人性不允许』时，其实是在问『有什么信号可以降低信任成本』。",
  },
  {
    slug: "twitter",
    name: "Twitter / X",
    oneLiner: "140 字的状态更新，就这？",
    category: "社交 / 信息",
    yearFounded: 2006,
    founders: "Jack Dorsey, Noah Glass, Biz Stone, Evan Williams",
    sbQuote: "就 140 个字，这能叫产品？博客不是更自由吗？",
    whyItSounded: [
      "140 字限制看起来像能力不足，不是设计",
      "主流博客、即时通讯、Facebook 都已经存在",
      "早期用户经常没有人看，像对着墙说话",
      "盈利模式长期模糊",
    ],
    whatMadeItWork: [
      "140 字刚好等于一条 SMS 的长度，这是设计约束变成病毒传播的起点",
      "『公共发言 + 异步订阅』的组合突发事件下成为新闻速度最快的信道",
      "@ / # / RT 三个协议全部是用户发明的，然后 Twitter 官方化了",
      "它吃掉了名人和媒体的注意力分发，改变了公共议程的生产方式",
    ],
    nowValuation: "被收购时 440 亿美元，改造后仍是全球性公共广场",
    lesson: "约束不是 bug，是独特传播机制的种子。",
  },
  {
    slug: "pinduoduo",
    name: "拼多多",
    oneLiner: "在微信群里砍一刀买厕纸，这还能做成?",
    category: "电商 / 社交裂变",
    yearFounded: 2015,
    founders: "黄峥",
    sbQuote: "淘宝都做了十几年了，还拼？而且消费不是应该升级吗？",
    whyItSounded: [
      "中国电商被认为是淘宝 / 京东的双寡头终局",
      "『消费降级』在当时的主流叙事里是贬义词",
      "砍一刀、拼团这种玩法看起来很 low",
      "充斥假货、投诉多，一度被骂上热搜",
    ],
    whatMadeItWork: [
      "微信 11 亿的社交池是一个几乎没被利用的零成本流量金矿",
      "五环外人群在淘宝天猫的体验里被系统性忽视，拼多多直接命中",
      "拼团 = C2M 反向定价 + 工厂白牌货，供应链成本打穿",
      "产品经理出身的创始人对『游戏化电商』理解远超传统零售思维",
    ],
    nowValuation: "母公司 PDD 市值超过阿里的高光时刻",
    lesson: "『消费降级』的本质是巨型被忽视人群，他们没有要求升级，只要求值。",
  },
  {
    slug: "popmart",
    name: "泡泡玛特",
    oneLiner: "卖看不见的盲盒玩具，这不是智商税吗？",
    category: "潮玩 / 情绪消费",
    yearFounded: 2010,
    founders: "王宁",
    sbQuote: "一个塑料小人 79 块，还不告诉你是哪个，这不就是赌博？",
    whyItSounded: [
      "单价 59-79 元的塑料小娃娃被认为没有『实用价值』",
      "『盲盒』听起来就像收割智商税",
      "主流消费叙事是性价比，泡泡玛特反其道而行",
      "早期被指控对青少年不友好",
    ],
    whatMadeItWork: [
      "IP 养成 + 艺术家分成机制让泡泡玛特变成一个『工艺品孵化器』",
      "盲盒提供的是即时多巴胺，真正的对手是手游抽卡而不是传统玩具",
      "收藏、换、晒的三位一体构成社交货币",
      "线下店 + 机器人商店让每次开盒都是公共仪式",
    ],
    nowValuation: "港股市值曾突破 1500 亿港币",
    lesson: "当你卖的是情绪而不是物品时，价格锚点是娱乐消费，不是竞品定价。",
  },
  {
    slug: "duolingo",
    name: "Duolingo",
    oneLiner: "绿色的猫头鹰威胁你学语言",
    category: "教育 / 游戏化学习",
    yearFounded: 2011,
    founders: "Luis von Ahn, Severin Hacker",
    sbQuote: "免费学语言？靠一只卡通猫头鹰威胁你？这能做多大？",
    whyItSounded: [
      "语言学习市场被 Rosetta Stone / 新东方等巨头占据",
      "完全免费 + 零门槛听起来不像可持续商业",
      "『推送你学习』看起来像骚扰",
      "早期被学术界评价为『不够深度』",
    ],
    whatMadeItWork: [
      "把学习拆成 30 秒 streak 的小游戏单位，改写了学习这件事的心理成本",
      "Push meme 化（那只暴躁猫头鹰）让品牌自己变成 Twitter/TikTok 传播素材",
      "免费用户本身是数据飞轮，让学习路径不断优化",
      "上市后广告 + 订阅 + 英语认证考试三条腿一起跑",
    ],
    nowValuation: "纳斯达克上市，市值峰值超过 150 亿美元",
    lesson: "让学习像游戏一样上瘾，比让学习更深刻更有商业价值。",
  },
  {
    slug: "onlyfans",
    name: "OnlyFans",
    oneLiner: "成年人订阅服务，这不就是…？",
    category: "创作者经济",
    yearFounded: 2016,
    founders: "Tim Stokely",
    sbQuote: "它的名字就让 VC 不敢投，银行不敢对接，App Store 不给上架。",
    whyItSounded: [
      "品牌污名过重，一切合作方都避之不及",
      "主流叙事里它等同于成人内容平台",
      "没有 App、没有广告投放渠道",
      "支付通道随时可能被切断",
    ],
    whatMadeItWork: [
      "创作者分成 80%，比 YouTube / TikTok 等平台慷慨得多",
      "粉丝订阅 + 私信打赏的 1:1 直连模式一旦跑通就极其难以被替代",
      "疫情封锁期线下收入归零时成为大量普通人的唯一变现渠道",
      "逐步把非成人内容创作者（健身教练、音乐人、厨师）接入，稀释品牌污名",
    ],
    nowValuation: "年 GMV 超过 60 亿美元，利润率惊人",
    lesson: "别人不敢做的市场，竞争最少；只要支付不被切断，护城河巨大。",
  },
  {
    slug: "mobike",
    name: "Mobike / ofo (初始形态)",
    oneLiner: "把车扔在街边让陌生人骑，会不会半天就没了？",
    category: "出行 / 共享经济",
    yearFounded: 2015,
    founders: "胡玮炜 / 戴威",
    sbQuote: "一大堆自行车扔马路上，不上锁就让人骑？不出一周就被偷光。",
    whyItSounded: [
      "无桩模式看起来与中国治安常识相违背",
      "传统公共自行车都是有桩管理，被证明很难规模化",
      "自行车造价和损耗看起来完全不划算",
      "投资人认为中国人不会为几元钱扫码",
    ],
    whatMadeItWork: [
      "移动支付 + GPS + 二维码三件套同时成熟，才让无桩可能",
      "最后一公里是城市出行真空，滴滴、地铁、公交都没覆盖到",
      "早期故意压低客单价制造使用习惯，再谈单位经济",
      "即使最终大多数玩家亏损，但它重塑了中国城市出行骨架",
    ],
    nowValuation: "被美团收购作为入口，共享单车本身成为新基础设施",
    lesson: "当三项关键基础设施同时成熟时，反直觉的点子会突然变得可行。",
  },
  {
    slug: "slack",
    name: "Slack",
    oneLiner: "一个聊天软件，公司凭什么付费？",
    category: "SaaS / 协作",
    yearFounded: 2013,
    founders: "Stewart Butterfield",
    sbQuote: "IRC 已经存在二十年了，邮件够用了，凭什么企业会为聊天买单？",
    whyItSounded: [
      "企业聊天市场被 HipChat / Yammer 等占据",
      "前身是一款失败游戏 Glitch 的副产品",
      "SaaS 卖给公司，而 Slack 却走自下而上的员工自发传播路线",
      "初期收入看起来不像能撑起一家公司的故事",
    ],
    whatMadeItWork: [
      "频道 + 搜索 + 第三方集成构成的『公司操作系统』价值被远远低估",
      "自下而上传播路径让 IT 部门无从拒绝，因为员工已经在用",
      "强烈的设计语言让办公软件第一次像消费品一样讨人喜欢",
      "API 生态让它成为所有 SaaS 的粘合剂",
    ],
    nowValuation: "被 Salesforce 以 277 亿美元收购",
    lesson: "自下而上的工具，传播路径就是产品本身。",
  },
  {
    slug: "shein",
    name: "SHEIN",
    oneLiner: "中国工厂 24 小时出一款快时尚，国际市场凭什么买账？",
    category: "跨境电商 / 快时尚",
    yearFounded: 2008,
    founders: "许仰天",
    sbQuote: "ZARA 都卷不动的快时尚，一个中国公司能赢？",
    whyItSounded: [
      "2008 年说中国品牌能在海外打 Zara 是天方夜谭",
      "跨境物流、关税、退货率等问题被认为是结构性天花板",
      "早期被认为只是靠便宜，没有品牌",
      "主流媒体长期质疑其供应链可持续性",
    ],
    whatMadeItWork: [
      "小单快反的柔性供应链让『每天上新 1 万款』成为可能",
      "数据驱动设计 + 工厂直连让库存成本降到传统快时尚的 1/10",
      "TikTok 时代的短视频传播天然适配 haul 文化",
      "海外 Z 世代对极致性价比的需求比想象中更硬",
    ],
    nowValuation: "估值最高时 1000 亿美元，全球下载量第一的购物 App",
    lesson: "当供应链速度快到可以响应 TikTok 趋势时，传统时尚品牌的护城河就变成沉没成本。",
  },
  {
    slug: "substack",
    name: "Substack",
    oneLiner: "邮件订阅时代结束了几十年了，凭什么回得来？",
    category: "创作者经济 / 邮件",
    yearFounded: 2017,
    founders: "Chris Best, Hamish McKenzie, Jairaj Sethi",
    sbQuote: "Medium、Twitter 都在，邮件订阅是什么上个世纪的东西？",
    whyItSounded: [
      "邮件被视作过时的媒介",
      "Medium 已经做了一遍博客商业化，且失败",
      "创作者逃离社交算法的这件事没人相信真的会发生",
      "订阅付费模型在中文世界几乎被证伪",
    ],
    whatMadeItWork: [
      "创作者对平台算法的绝望达到历史高点，需要『拥有你的读者』的渠道",
      "邮件是唯一没有被算法攥在手里的分发方式",
      "Substack 的抽成模式简单透明（10%）",
      "疫情期间大量记者离开传统媒体，直接引爆供给端",
    ],
    nowValuation: "估值约 6.5 亿美元，改变了记者和意见领袖的收入结构",
    lesson: "没有『过时的技术』，只有『被重新需要的时代』。",
  },
  {
    slug: "roblox",
    name: "Roblox",
    oneLiner: "让一群小孩用积木造游戏并卖给其他小孩，你认真的吗？",
    category: "游戏 / UGC 平台",
    yearFounded: 2004,
    founders: "David Baszucki, Erik Cassel",
    sbQuote: "图形这么丑，谁玩？小孩自己造的游戏能玩得下去？",
    whyItSounded: [
      "画面相较同时期游戏差距巨大",
      "UGC 内容质量参差不齐",
      "『让儿童赚钱』的模式充满伦理争议",
      "早期近 10 年未爆发",
    ],
    whatMadeItWork: [
      "不是在做游戏，而是在做游戏的 YouTube",
      "儿童创作者 + 儿童消费者形成同龄社交闭环",
      "低画面门槛反而降低了创作门槛，产能是所有 3A 游戏加起来的几倍",
      "疫情期间成为 Z 世代最重要的线上社交场景之一",
    ],
    nowValuation: "纽交所上市，市值峰值超过 700 亿美元",
    lesson: "长期积累的 UGC 平台在某个临界点会突然变成世代社交基础设施。",
  },
  {
    slug: "notion",
    name: "Notion",
    oneLiner: "又一个笔记软件，跟 Evernote 有啥区别？",
    category: "SaaS / 生产力",
    yearFounded: 2013,
    founders: "Ivan Zhao, Simon Last",
    sbQuote: "笔记软件红海，Evernote / OneNote / Bear 都在，再做一个没意义。",
    whyItSounded: [
      "笔记赛道被认为是成熟且拥挤的红海",
      "早期版本差点让公司倒闭，团队回炉重造",
      "全块化（block-based）结构一开始让新用户困惑",
      "面向个人免费 + 企业付费的商业模式当时不明朗",
    ],
    whatMadeItWork: [
      "block 模型让笔记 + 数据库 + wiki 三位一体，是一种新的信息单元",
      "Twitter / YouTube 模板社区让自传播成本接近零",
      "被远程工作浪潮推上高点，团队协作迁移需求爆发",
      "打通 AI 写作后进一步扩大 TAM",
    ],
    nowValuation: "估值约 100 亿美元，全球创作者和团队的默认工作台",
    lesson: "成熟赛道的切入点不是功能更多，而是基础单元本身被重新定义。",
  },
];

export function getUnicorn(slug: string): Unicorn | undefined {
  return unicorns.find((u) => u.slug === slug);
}
