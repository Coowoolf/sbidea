import type { Metadata } from "next";
import { unicorns } from "@/lib/unicorns";
import { productUrl } from "@/lib/urls";
import { SB_MARQUEE_ITEMS } from "@/lib/sb-meanings";
import { SbRotatingText } from "@/components/sb-rotating-text";

export const metadata: Metadata = {
  title: "SB Idea · 看起来 SB，赚起来真",
  description:
    "10 个小工具：SB 想法生成器、鉴定所、独角兽名人堂、SBTI 人格测试、融资头条、死法占卜、Slogan 对撞机、创业塔罗、成功学日签、黑话词典。让 AI 帮你做最傻也最封神的创业决定。",
  alternates: { canonical: "/" },
};

type Product = {
  slug: string;
  emoji: string;
  title: string;
  tagline: string;
  tag: "生成" | "鉴定" | "策展" | "测试" | "娱乐" | "工具";
};

const products: Product[] = [
  {
    slug: "generator",
    emoji: "🎲",
    title: "SB 想法生成器",
    tagline: "一键吐出一个『听起来很傻、细想真行』的创业点子",
    tag: "生成",
  },
  {
    slug: "roast",
    emoji: "🔥",
    title: "SB 想法鉴定所",
    tagline: "把点子扔进来，AI 先毒舌一通再给你真心话",
    tag: "鉴定",
  },
  {
    slug: "hall",
    emoji: "🦄",
    title: "SB 独角兽名人堂",
    tagline: "那些发布时被骂 SB、现在估值百亿的真实案例",
    tag: "策展",
  },
  {
    slug: "sbti",
    emoji: "🧠",
    title: "SBTI · 创业 16 型",
    tagline: "12 道题测出你是哪一种 SB 创始人",
    tag: "测试",
  },
  {
    slug: "headline",
    emoji: "📰",
    title: "SB 融资头条",
    tagline: "把你的点子写成一篇煞有介事的融资新闻",
    tag: "娱乐",
  },
  {
    slug: "deathways",
    emoji: "💀",
    title: "SB 死法占卜",
    tagline: "预言你的点子会以哪 7 种戏剧化方式死掉",
    tag: "鉴定",
  },
  {
    slug: "slogan",
    emoji: "🎨",
    title: "SB Slogan 对撞机",
    tagline: "同一个产品的 8 种风格 slogan 并排比拼",
    tag: "工具",
  },
  {
    slug: "tarot",
    emoji: "🔮",
    title: "SB 创业塔罗",
    tagline: "22 张大阿卡那，抽 3 张解读你的创业命运",
    tag: "测试",
  },
  {
    slug: "daily",
    emoji: "🏆",
    title: "SB 成功学日签",
    tagline: "每天一句反成功学口号，自动配色海报",
    tag: "娱乐",
  },
  {
    slug: "jargon",
    emoji: "📖",
    title: "SB 黑话词典",
    tagline: "人话 ↔ 投资人黑话双向翻译",
    tag: "工具",
  },
];

const hallPreview = unicorns.slice(0, 4);

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-5">
      <section className="pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="flex flex-col items-start gap-6">
          <div className="sb-stamp wobble text-base md:text-lg">
            sbidea.ai · 傻想法研究所
          </div>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
            看起来 <span className="sb-stamp">SB</span> 的点子，
            <br />
            往往是最赚钱的那一个。
          </h1>
          <p className="max-w-2xl text-lg text-[color:var(--color-muted)] md:text-xl">
            创业者的灵感实验室。10 个 AI 小工具帮你生成、吐槽、鉴定、占卜那些
            听起来 SB 但可能封神的创业点子。
          </p>
          <SbRotatingText />
          <div className="mt-2 flex flex-wrap gap-3">
            <a href={productUrl("generator")} className="sb-btn">
              🎲 给我一个 SB 点子
            </a>
            <a href={productUrl("sbti")} className="sb-btn sb-btn-ghost">
              🧠 测我是哪一型
            </a>
            <a href={productUrl("tarot")} className="sb-btn sb-btn-ghost">
              🔮 抽张塔罗
            </a>
          </div>
        </div>
      </section>

      {/* SB Meanings Marquee */}
      <section className="mt-8 -mx-5 overflow-hidden border-y-2 border-[color:var(--color-ink)] bg-[color:var(--color-ink)] py-3">
        <div className="marquee-track">
          {[...SB_MARQUEE_ITEMS, ...SB_MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="mx-6 whitespace-nowrap text-sm font-semibold text-[color:var(--color-paper)] opacity-90"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-black md:text-3xl">10 个小工具</h2>
          <div className="text-sm text-[color:var(--color-muted)]">
            点开随便玩，无需注册
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <a
              key={p.slug}
              href={productUrl(p.slug)}
              className="sb-card slide-up block p-6 transition-transform hover:-translate-y-1"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="text-4xl">{p.emoji}</div>
                <span className="rounded-full border-2 border-[color:var(--color-ink)] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide">
                  {p.tag}
                </span>
              </div>
              <h3 className="mb-1 text-xl font-black">{p.title}</h3>
              <p className="text-sm text-[color:var(--color-muted)]">
                {p.tagline}
              </p>
              <div className="mt-5 text-sm font-bold underline">
                去玩一下 →
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-24 sb-card p-8 md:p-12">
        <h2 className="text-2xl font-black md:text-3xl">
          为什么 SB 的点子反而能赢？
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-[color:var(--color-muted)]">
              Paul Graham 在 2012 年写过：
              <em>
                &ldquo;The best startup ideas seem at first like bad
                ideas.&rdquo;
              </em>
            </p>
            <p className="mt-3 text-[color:var(--color-muted)]">
              Airbnb 发布时被骂『让陌生人睡你家客厅的气垫床』，Twitter
              被嘲『就是一行字有什么用』，拼多多被定性为『消费降级』。
              历史上最大的生意，往往是从一个『听起来 SB 的想法』长出来的。
            </p>
          </div>
          <div>
            <p className="font-bold">sbidea.ai 的小宇宙</p>
            <ul className="mt-3 space-y-2 text-[color:var(--color-muted)]">
              <li>
                <strong>生成侧：</strong>想法生成器 · 融资头条 · Slogan 对撞机
              </li>
              <li>
                <strong>鉴定侧：</strong>鉴定所 · 死法占卜 · 创业塔罗
              </li>
              <li>
                <strong>认识你自己：</strong>SBTI 人格 · 成功学日签 · 黑话词典
              </li>
              <li>
                <strong>确认你不孤单：</strong>独角兽名人堂
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-24">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-black md:text-3xl">
            名人堂精选 · 当年都被骂 SB
          </h2>
          <a href={productUrl("hall")} className="text-sm font-bold underline">
            查看全部 →
          </a>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {hallPreview.map((u) => (
            <a
              key={u.slug}
              href={`${productUrl("hall")}/${u.slug}`}
              className="sb-card block p-5 transition-transform hover:-translate-y-1"
            >
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
                {u.yearFounded} · {u.category}
              </div>
              <div className="text-lg font-black">{u.name}</div>
              <p className="mt-2 text-sm italic text-[color:var(--color-muted)]">
                &ldquo;{u.sbQuote}&rdquo;
              </p>
              <div className="mt-3 text-sm font-bold">{u.nowValuation}</div>
            </a>
          ))}
        </div>
      </section>

      <div className="h-20" />
    </div>
  );
}
