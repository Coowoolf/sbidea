import type { Dim, Level } from "./dimensions";

export type Option = { text: string; value: Level };

export type Question = {
  id: string;
  dim: Dim;
  prompt: string;
  options: [Option, Option, Option]; // always 3 options, L/M/H
};

export const QUESTIONS: Question[] = [
  // S1 × 2
  { id: "q1", dim: "S1", prompt: "朋友圈晒了条精心写的内容,3 小时 0 赞 0 评论,你的第一反应?",
    options: [
      { text: "人和人的悲欢并不相通,默默删了", value: "L" },
      { text: "无所谓,反正我自己写得爽",       value: "M" },
      { text: "我的朋友圈配不上这条",           value: "H" },
    ] },
  { id: "q2", dim: "S1", prompt: '老板在会上当众问"这事你怎么看",你?',
    options: [
      { text: "脑子瞬间空白,支吾半天",         value: "L" },
      { text: "稳住,按流程答",                 value: "M" },
      { text: "来都来了,多讲两句我的 framework", value: "H" },
    ] },
  // S2 × 2
  { id: "q3", dim: "S2", prompt: '被问"你最大的优点是什么",你?',
    options: [
      { text: "不知道,让我想想……",            value: "L" },
      { text: "会按场合挑一个夸",               value: "M" },
      { text: "精准报 3 个,能举例",             value: "H" },
    ] },
  { id: "q4", dim: "S2", prompt: "人生大方向变了三次,你现在的感觉?",
    options: [
      { text: "我到底是谁",                     value: "L" },
      { text: "有时候也迷,但大致对",            value: "M" },
      { text: "我就知道这是必经之路",            value: "H" },
    ] },
  // S3 × 2
  { id: "q5", dim: "S3", prompt: "一份给钱多但无聊的工作 vs 给钱少但想干的:",
    options: [
      { text: "当然钱多的,生活要紧",             value: "L" },
      { text: "先给钱多撑一撑,副业搞理想",       value: "M" },
      { text: "只做想干的,反正都能赚到钱",       value: "H" },
    ] },
  { id: "q6", dim: "S3", prompt: "你觉得 5 年后自己最想被人记住什么?",
    options: [
      { text: "过得安稳,家人健康",               value: "L" },
      { text: "某个领域有点名堂",                 value: "M" },
      { text: "改变过一件事的那个人",             value: "H" },
    ] },
  // E1 × 2
  { id: "q7", dim: "E1", prompt: "对象 2 小时没回消息,你心里?",
    options: [
      { text: "完了,是不是不爱我了",             value: "L" },
      { text: "可能在忙,等等",                   value: "M" },
      { text: "她看到就会回,我先干别的",         value: "H" },
    ] },
  { id: "q8", dim: "E1", prompt: "新朋友第一次约你吃饭突然临时取消:",
    options: [
      { text: "是不是我哪里做错了",               value: "L" },
      { text: "有点失望,但 OK",                   value: "M" },
      { text: "正好空出时间,我去看书",            value: "H" },
    ] },
  // E2 × 2
  { id: "q9", dim: "E2", prompt: "和一个刚认识 3 个月的人好感爆棚,你会?",
    options: [
      { text: "保留,等 1 年以上再说",             value: "L" },
      { text: "按比例给一点,双向试探",            value: "M" },
      { text: "all in,爱就是 all in",            value: "H" },
    ] },
  { id: "q10", dim: "E2", prompt: "对象过生日,你的投入方式?",
    options: [
      { text: "转个红包搞定",                     value: "L" },
      { text: "送礼物 + 蛋糕,按预算",             value: "M" },
      { text: "策划一整天的惊喜,每个细节想 2 周", value: "H" },
    ] },
  // E3 × 2
  { id: "q11", dim: "E3", prompt: '对象说"我想一个人静静":',
    options: [
      { text: "完了出事了,怎么办",                value: "L" },
      { text: "给她空间,隔 1 小时发个关心",       value: "M" },
      { text: "完美,我也正好去健身",              value: "H" },
    ] },
  { id: "q12", dim: "E3", prompt: "你会因为一个人改变自己的计划吗?",
    options: [
      { text: "经常,重要的人说了算",              value: "L" },
      { text: "看事,大事会",                      value: "M" },
      { text: "基本不会,我的节奏最要紧",           value: "H" },
    ] },
  // A1 × 2
  { id: "q13", dim: "A1", prompt: "网上看到一个特别好的故事:",
    options: [
      { text: "八成是编的吧",                     value: "L" },
      { text: "半信半疑",                         value: "M" },
      { text: "相信人性本善,挺感动",               value: "H" },
    ] },
  { id: "q14", dim: "A1", prompt: "新来的同事各种夸你:",
    options: [
      { text: "有所图",                           value: "L" },
      { text: "先观察再说",                       value: "M" },
      { text: "好事啊,她挺有眼光",                 value: "H" },
    ] },
  // A2 × 2
  { id: "q15", dim: "A2", prompt: "公司新规要求每周写日报:",
    options: [
      { text: "我非得写不可?摸了",                 value: "L" },
      { text: "写吧,应付过去",                     value: "M" },
      { text: "正好系统化一下我的进展",             value: "H" },
    ] },
  { id: "q16", dim: "A2", prompt: "过马路没车但红灯:",
    options: [
      { text: "直接走,没必要等",                   value: "L" },
      { text: "看情况,没人就走",                   value: "M" },
      { text: "必须等绿灯",                         value: "H" },
    ] },
  // A3 × 2
  { id: "q17", dim: "A3", prompt: "周末没安排,你的默认操作?",
    options: [
      { text: "刷手机到天黑",                       value: "L" },
      { text: "随便约个朋友或者看看书",             value: "M" },
      { text: "把这周想推进的事干完",               value: "H" },
    ] },
  { id: "q18", dim: "A3", prompt: '你觉得"活着"是为了?',
    options: [
      { text: "开心就行",                           value: "L" },
      { text: "做一些喜欢的事",                     value: "M" },
      { text: "把一件事做到极致 / 留下点东西",       value: "H" },
    ] },
  // Ac1 × 2
  { id: "q19", dim: "Ac1", prompt: "看到一个 10 倍回报但 90% 会亏的机会:",
    options: [
      { text: "算了,我不碰",                       value: "L" },
      { text: "小仓位试一下",                       value: "M" },
      { text: "梭哈,上",                            value: "H" },
    ] },
  { id: "q20", dim: "Ac1", prompt: "你的人生关键词更接近?",
    options: [
      { text: "稳",                                 value: "L" },
      { text: "平衡",                               value: "M" },
      { text: "搞事",                               value: "H" },
    ] },
  // Ac2 × 2
  { id: "q21", dim: "Ac2", prompt: "选餐厅时候:",
    options: [
      { text: "纠结半小时,最后让别人定",            value: "L" },
      { text: "看评分选前 3,随便一个",              value: "M" },
      { text: "30 秒,就这家",                       value: "H" },
    ] },
  { id: "q22", dim: "Ac2", prompt: "老板甩给你一个周五决定,你?",
    options: [
      { text: "周日晚上还在想",                     value: "L" },
      { text: "周六上午过一下,行就行",              value: "M" },
      { text: "30 秒出结论,回他'就这么干'",         value: "H" },
    ] },
  // Ac3 × 2
  { id: "q23", dim: "Ac3", prompt: "一个没人 push 的个人项目:",
    options: [
      { text: "做了两周就荒废",                     value: "L" },
      { text: "节奏慢一点能坚持",                   value: "M" },
      { text: "每天雷打不动推进",                   value: "H" },
    ] },
  { id: "q24", dim: "Ac3", prompt: "健身的 deadline 是?",
    options: [
      { text: "老板发红头文件那天",                 value: "L" },
      { text: "某个特定时间前要看起来瘦",           value: "M" },
      { text: "我自己定的周计划",                   value: "H" },
    ] },
  // So1 × 2
  { id: "q25", dim: "So1", prompt: "认识新朋友的场合,你?",
    options: [
      { text: "找个角落吃喝",                       value: "L" },
      { text: "等别人主动来聊",                     value: "M" },
      { text: "主动破冰,加微信",                   value: "H" },
    ] },
  { id: "q26", dim: "So1", prompt: "群里突然有人找话题:",
    options: [
      { text: "潜水",                               value: "L" },
      { text: "看心情接一两句",                     value: "M" },
      { text: "必接,我要当气氛组",                 value: "H" },
    ] },
  // So2 × 2
  { id: "q27", dim: "So2", prompt: "对象的手机密码,你觉得?",
    options: [
      { text: "必须告诉我",                         value: "L" },
      { text: "她愿意说就说",                       value: "M" },
      { text: "那是她的事,我不管",                 value: "H" },
    ] },
  { id: "q28", dim: "So2", prompt: "朋友的秘密该不该和对象分享?",
    options: [
      { text: "当然,我们没有秘密",                 value: "L" },
      { text: "重大的会说,小事就算了",              value: "M" },
      { text: "不是我的事,她自己决定",              value: "H" },
    ] },
  // So3 × 2
  { id: "q29", dim: "So3", prompt: "老板私下说了句让你反感的话:",
    options: [
      { text: "当场怼回去",                         value: "L" },
      { text: "看情况,后面私下再说",                value: "M" },
      { text: "表面笑呵呵,回家再消化",              value: "H" },
    ] },
  { id: "q30", dim: "So3", prompt: "拍合影时:",
    options: [
      { text: "我怎么舒服怎么来",                   value: "L" },
      { text: "按大家的节奏调整一下",                value: "M" },
      { text: "按场合选合适的笑容",                  value: "H" },
    ] },
];
