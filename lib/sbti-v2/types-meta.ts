export type TypeMeta = {
  code: string;
  name: string;
  emoji: string;
  tagline: string;
  gradient: [string, string]; // [from, to] for avatar gradient
};

export const TYPES: Record<string, TypeMeta> = {
  "CTRL":   { code: "CTRL",   name: "控制狂",       emoji: "🎮", tagline: "我要是撒手,天就塌了",              gradient: ["#6366f1", "#1e1b4b"] },
  "ATM-er": { code: "ATM-er", name: "金主",         emoji: "💰", tagline: "钱能解决的都不是事",               gradient: ["#eab308", "#422006"] },
  "Dior-s": { code: "Dior-s", name: "迪奥小姐",     emoji: "👛", tagline: "贵,但必须",                        gradient: ["#ec4899", "#500724"] },
  "BOSS":   { code: "BOSS",   name: "老板",         emoji: "👔", tagline: "事情要做就做对",                   gradient: ["#0ea5e9", "#0c4a6e"] },
  "THAN-K": { code: "THAN-K", name: "感恩王",       emoji: "🙏", tagline: "谢谢你,也谢谢我自己",             gradient: ["#10b981", "#064e3b"] },
  "OH-NO":  { code: "OH-NO",  name: "完美主义崩溃", emoji: "😱", tagline: "完了,又搞砸了",                   gradient: ["#f97316", "#7c2d12"] },
  "GOGO":   { code: "GOGO",   name: "冲冲冲",       emoji: "🚀", tagline: "不冲?那等啥",                      gradient: ["#d97a2a", "#3a1f00"] },
  "SEXY":   { code: "SEXY",   name: "气场王",       emoji: "💋", tagline: "我动一动,天都颤",                 gradient: ["#e11d48", "#4c0519"] },
  "LOVE-R": { code: "LOVE-R", name: "恋爱脑",       emoji: "💘", tagline: "TA 就是我的全部",                 gradient: ["#f472b6", "#831843"] },
  "MUM":    { code: "MUM",    name: "老妈子",       emoji: "🧺", tagline: "都坐好,我给你们煮锅汤",           gradient: ["#fbbf24", "#78350f"] },
  "FAKE":   { code: "FAKE",   name: "装样子",       emoji: "🎭", tagline: "社交媒体的我 ≠ 真的我",            gradient: ["#a855f7", "#3b0764"] },
  "OJBK":   { code: "OJBK",   name: "都行",         emoji: "🫠", tagline: "行,可以,都能接受",                gradient: ["#94a3b8", "#1e293b"] },
  "MALO":   { code: "MALO",   name: "犯懒",         emoji: "😪", tagline: "能躺就不坐",                       gradient: ["#78716c", "#1c1917"] },
  "JOKE-R": { code: "JOKE-R", name: "段子手",       emoji: "🃏", tagline: "严肃?我不擅长",                   gradient: ["#facc15", "#713f12"] },
  "WOC!":   { code: "WOC!",   name: "惊呼侠",       emoji: "😯", tagline: "我的天,真的假的",                 gradient: ["#38bdf8", "#0c4a6e"] },
  "THIN-K": { code: "THIN-K", name: "过度思考",     emoji: "🧠", tagline: "这事我脑子里转了 187 圈",           gradient: ["#818cf8", "#1e1b4b"] },
  "SHIT":   { code: "SHIT",   name: "摆烂王",       emoji: "💩", tagline: "我摆烂,但我承认我摆烂",           gradient: ["#a3a3a3", "#171717"] },
  "ZZZZ":   { code: "ZZZZ",   name: "睡王",         emoji: "😴", tagline: "醒了吗?我再睡一会",               gradient: ["#64748b", "#0f172a"] },
  "POOR":   { code: "POOR",   name: "苦大仇深",     emoji: "🪙", tagline: "命运给我的都是考验",               gradient: ["#854d0e", "#1c1917"] },
  "MONK":   { code: "MONK",   name: "出家人",       emoji: "🧘", tagline: "人生苦短,我来坐坐",               gradient: ["#f59e0b", "#451a03"] },
  "IMSB":   { code: "IMSB",   name: "我是 SB",      emoji: "🤡", tagline: "我就是这样,怎么了",               gradient: ["#fb7185", "#500724"] },
  "SOLO":   { code: "SOLO",   name: "独行侠",       emoji: "🦇", tagline: "一个人挺好的",                     gradient: ["#475569", "#0f172a"] },
  "FUCK":   { code: "FUCK",   name: "不想干了",     emoji: "🔥", tagline: "去他的",                           gradient: ["#dc2626", "#450a0a"] },
  "DEAD":   { code: "DEAD",   name: "已死",         emoji: "💀", tagline: "我这种货在这个世界没意义",         gradient: ["#525252", "#0a0a0a"] },
  "IMFW":   { code: "IMFW",   name: "完蛋",         emoji: "🫥", tagline: "就这样吧",                         gradient: ["#44403c", "#0c0a09"] },
  "HHHH":   { code: "HHHH",   name: "全能战士",     emoji: "✨", tagline: "所有维度都高,或者没测准",         gradient: ["#fbbf24", "#78350f"] },
  "DRUNK":  { code: "DRUNK",  name: "醉鬼",         emoji: "🍺", tagline: "干了这杯再说",                     gradient: ["#eab308", "#422006"] },
};
