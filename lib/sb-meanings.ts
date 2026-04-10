/**
 * SB 的 N 种含义 · 从街头到殿堂
 *
 * 五个层级，从 meme 到浪漫，覆盖不同受众的共鸣点。
 * 用于首页轮播、marquee 滚动、分享卡水印等场景。
 */

export type SbMeaning = {
  sb: string;
  meaning: string;
  tier: 1 | 2 | 3 | 4 | 5;
};

export const SB_MEANINGS: SbMeaning[] = [
  // Tier 1 — Meme
  { sb: "Stupid But...", meaning: "听起来傻，但其实能赚钱", tier: 1 },
  { sb: "Surprisingly Brilliant", meaning: "出人意料的天才", tier: 1 },

  // Tier 2 — 创业语境
  { sb: "Side Business", meaning: "伟大的公司都从副业开始", tier: 2 },
  { sb: "Startup Builder", meaning: "你不是在做梦，你是建造者", tier: 2 },
  { sb: "Small Beginnings", meaning: "帝国始于微末", tier: 2 },
  { sb: "Smart Bet", meaning: "看起来疯狂的赌注，往往最聪明", tier: 2 },
  { sb: "Solo Builder", meaning: "一个人，一台电脑，一个点子", tier: 2 },

  // Tier 3 — 哲学态度
  { sb: "Stupidly Brave", meaning: "傻到勇敢", tier: 3 },
  { sb: "Sacred Boldness", meaning: "神圣的大胆", tier: 3 },
  { sb: "Slow Burn", meaning: "不是爆红，是十年慢燃", tier: 3 },
  { sb: "Seek Beyond", meaning: "当所有人看眼前，你看向更远", tier: 3 },
  { sb: "Second Belief", meaning: "被骂了还能再信一次", tier: 3 },

  // Tier 4 — 浪漫诗意
  { sb: "Serendipity Born", meaning: "最好的点子不是想出来的，是降临的", tier: 4 },
  { sb: "Story Begins", meaning: "每个点子都是故事的第一页", tier: 4 },
  { sb: "Stardust & Belief", meaning: "你相信的那颗星，别人看不见", tier: 4 },
  { sb: "Surprisingly Beautiful", meaning: "被骂丑的东西，后来最美", tier: 4 },
  { sb: "Someday, Bloom", meaning: "今天被笑的种子，终会绽放", tier: 4 },

  // Tier 5 — 中文高阶
  { sb: "神笔 Shén Bǐ", meaning: "每个点子都可能是改变世界的一笔", tier: 5 },
  { sb: "首步 Shǒu Bù", meaning: "万事开头难，但你迈出了首步", tier: 5 },
  { sb: "闪变 Shǎn Biàn", meaning: "从被笑到独角兽，只差一次闪变", tier: 5 },
  { sb: "私奔 Sī Bēn", meaning: "辞职创业？不，这叫和梦想私奔", tier: 5 },
  { sb: "拾贝 Shí Bèi", meaning: "安静拾贝的人，终会发现珍珠", tier: 5 },
  { sb: "烧杯 Shāo Bēi", meaning: "创业是实验——每次都是化学反应", tier: 5 },
];

/** Flattened for marquee display: "SB = meaning" */
export const SB_MARQUEE_ITEMS: string[] = SB_MEANINGS.map(
  (m) => `SB = ${m.sb} · ${m.meaning}`
);
