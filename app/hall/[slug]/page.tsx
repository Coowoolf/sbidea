import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUnicorn, unicorns } from "@/lib/unicorns";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return unicorns.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const u = getUnicorn(slug);
  if (!u) return { title: "未找到" };
  const title = `${u.name} — 当年也被骂 SB`;
  const description = `${u.oneLiner}。${u.whatMadeItWork[0]}`;
  return {
    title,
    description,
    alternates: { canonical: `/hall/${u.slug}` },
    openGraph: {
      title,
      description,
      url: `/hall/${u.slug}`,
      type: "article",
    },
  };
}

export default async function UnicornDetail({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const u = getUnicorn(slug);
  if (!u) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 pt-12 pb-24">
      <nav className="mb-6 text-sm">
        <Link
          href="/hall"
          className="font-bold text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
        >
          ← 返回名人堂
        </Link>
      </nav>

      <header className="mb-10">
        <div className="mb-3 text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
          {u.category} · 成立于 {u.yearFounded} · {u.founders}
        </div>
        <h1 className="text-5xl font-black tracking-tight">{u.name}</h1>
        <p className="mt-3 text-xl text-[color:var(--color-muted)]">
          {u.oneLiner}
        </p>

        <blockquote className="sb-card mt-8 p-6 md:p-8">
          <div className="mb-3 text-xs font-bold uppercase tracking-wide text-[color:var(--color-accent)]">
            发布时的路人评论
          </div>
          <p className="text-xl italic leading-relaxed md:text-2xl">
            &ldquo;{u.sbQuote}&rdquo;
          </p>
        </blockquote>
      </header>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">为什么它当年听起来 SB</h2>
        <ul className="space-y-3">
          {u.whyItSounded.map((r) => (
            <li key={r} className="flex gap-3">
              <span className="mt-1 text-[color:var(--color-accent)]">●</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">
          但它为什么最终封神
        </h2>
        <ol className="space-y-4">
          {u.whatMadeItWork.map((r, i) => (
            <li key={r} className="flex gap-4">
              <span className="shrink-0 text-xl font-black text-[color:var(--color-accent)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="leading-relaxed">{r}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="sb-card mb-10 p-6 md:p-8">
        <div className="text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
          今天
        </div>
        <div className="mt-1 text-2xl font-black">{u.nowValuation}</div>
        <div className="mt-5 border-t-2 border-[color:var(--color-line)] pt-5">
          <div className="text-xs font-bold uppercase tracking-wide text-[color:var(--color-muted)]">
            启示
          </div>
          <p className="mt-1 text-lg leading-relaxed">{u.lesson}</p>
        </div>
      </section>

      <section className="mt-16 flex flex-wrap gap-3">
        <Link href="/generator" className="sb-btn">
          🎲 我也来一个 SB 点子
        </Link>
        <Link href="/hall" className="sb-btn sb-btn-ghost">
          🦄 看更多独角兽
        </Link>
      </section>
    </div>
  );
}
