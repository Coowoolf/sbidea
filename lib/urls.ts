/**
 * Subdomain URL helper.
 *
 * In production: generator.sbidea.ai
 * In local dev:  /generator (path routing, no subdomains)
 */

const DOMAIN = "sbidea.ai";
const isProd = (process.env.NEXT_PUBLIC_SITE_URL ?? "").includes(DOMAIN);

export function productUrl(product: string): string {
  return isProd ? `https://${product}.${DOMAIN}` : `/${product}`;
}

export function homeUrl(): string {
  return isProd ? `https://${DOMAIN}` : "/";
}
