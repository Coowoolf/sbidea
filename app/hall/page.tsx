import type { Metadata } from "next";
import Link from "next/link";
import { unicorns } from "@/lib/unicorns";

export const metadata: Metadata = {
  title: "SB 独角兽名人堂 · 那些发布时被骂 SB、现在估值百亿的公司",
  description:
    "Airbnb、Twitter、拼多多、泡泡玛特、Duolingo、Slack…… 每一个被历史验证的『SB 点子』都有自己的故事。策展式列表，告诉你为什么它们能成。",
  alternates: { canonical: "/hall" },
  openGraph: {
    title: "SB 独角兽名人堂",
    description: "那些发布时被骂 SB、现在估值百亿的真实公司案例",
    url: "/hall",
  },
};

export default function HallPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-12 pb-24">
      <header className="mb-10">
        <div className="sb-stamp mb-4">产品 3 / 3</div>
        <h1 className="text-4xl font-black md:text-5xl">🦄 SB 独角兽名人堂</h1>
        <p className="mt-3 max-w-3xl text-lg text-[color:var(--color-muted)]">
          这里收录的都是真实案例：发布时被主流叙事骂 SB、
          被投资人拒绝、被路人嘲笑，但最后证明所有人都错了的公司。
          每一个条目都有独立页面，方便你在怀疑自己的时候来读一遍。
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {unicorns.map((u) => (
          <Link
            key={u.slug}
            href={`/hall/${u.slug}`}
            className="sb-card flex flex-col p-6 transition-transform hover:-translate-y-1"
          >
            <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
              <span>{u.category}</span>
              <span>{u.yearFounded}</span>
            </div>
            <h2 className="text-2xl font-black">{u.name}</h2>
            <p className="mt-1 text-[color:var(--color-muted)]">
              {u.oneLiner}
            </p>
            <blockquote className="mt-4 border-l-4 border-[color:var(--color-accent)] pl-3 text-sm italic text-[color:var(--color-muted)]">
              &ldquo;{u.sbQuote}&rdquo;
            </blockquote>
            <div className="mt-auto pt-5 text-sm font-bold">
              {u.nowValuation}
              <span className="ml-2 underline">阅读全文 →</span>
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-20 sb-card p-8 md:p-12">
        <h2 className="text-2xl font-black md:text-3xl">有推荐的案例？</h2>
        <p className="mt-2 text-[color:var(--color-muted)]">
          名人堂会持续更新。
          如果你知道哪家公司发布时被骂、现在封神，欢迎发邮件到 hi@sbidea.ai，
          也可以直接去 <Link href="/generator" className="underline font-bold">生成器</Link> 生成一个，说不定下一个独角兽就是你。
        </p>
      </section>
    </div>
  );
}
