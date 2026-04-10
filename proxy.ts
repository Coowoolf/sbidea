/**
 * Next.js 16 Proxy (formerly middleware.ts in v15).
 *
 * Maps subdomains to product paths so each product gets a clean
 * shareable URL:
 *   generator.sbidea.ai  → /generator
 *   sbti.sbidea.ai       → /sbti
 *   roast.sbidea.ai      → /roast
 *   ...etc
 *
 * API routes (/api/*), static assets (/_next/*), and the bare domain
 * (sbidea.ai) are NOT rewritten.
 *
 * DNS: *.sbidea.ai CNAME → cname.vercel-dns.com (Cloudflare)
 * Vercel: add *.sbidea.ai as a wildcard domain in project settings
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SUBDOMAIN_MAP: Record<string, string> = {
  generator: "/generator",
  sbti: "/sbti",
  roast: "/roast",
  hall: "/hall",
  headline: "/headline",
  deathways: "/deathways",
  slogan: "/slogan",
  tarot: "/tarot",
  daily: "/daily",
  jargon: "/jargon",
  adventure: "/adventure",
};

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  // Skip localhost / dev (no subdomains)
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    return NextResponse.next();
  }

  // Extract subdomain: "generator.sbidea.ai" → "generator"
  const parts = host.split(".");
  if (parts.length < 3) return NextResponse.next(); // bare domain
  const subdomain = parts[0];

  // Skip www
  if (subdomain === "www") return NextResponse.next();

  const targetPath = SUBDOMAIN_MAP[subdomain];
  if (!targetPath) return NextResponse.next(); // unknown subdomain → pass through

  const { pathname } = request.nextUrl;

  // Don't rewrite API routes or static assets
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/")) {
    return NextResponse.next();
  }

  // Rewrite root "/" to the product page
  if (pathname === "/" || pathname === "") {
    const url = request.nextUrl.clone();
    url.pathname = targetPath;
    return NextResponse.rewrite(url);
  }

  // For any other path on a subdomain (e.g., sbti.sbidea.ai/generator),
  // let it pass through — Next.js will render the page normally since
  // all product paths exist in the app directory.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.svg
     */
    "/((?!_next/static|_next/image|favicon.svg).*)",
  ],
};
