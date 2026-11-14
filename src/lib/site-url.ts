export const CANONICAL_SITE_URL = "https://ellzluxefragranz.com";

const CANONICAL_HOST = "ellzluxefragranz.com";
const REDIRECT_HOSTS = new Set(["ellz-luxe-fragranz.vercel.app", "www.ellzluxefragranz.com"]);

function present(value: string | undefined) {
  return value && value.length > 0 ? value : undefined;
}

function withHttps(host: string) {
  return host.startsWith("http") ? host.replace(/\/$/, "") : `https://${host.replace(/\/$/, "")}`;
}

function hostname(value: string) {
  try {
    return new URL(withHttps(value)).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function resolveSiteUrl(input: {
  NEXT_PUBLIC_SITE_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
  VERCEL_URL?: string;
}) {
  const explicit = present(input.NEXT_PUBLIC_SITE_URL);
  if (explicit && !/localhost|127\.0\.0\.1/i.test(explicit)) {
    const host = hostname(explicit);
    if (host === CANONICAL_HOST) return explicit.replace(/\/$/, "");
    if (!REDIRECT_HOSTS.has(host)) return explicit.replace(/\/$/, "");
  }
  if (present(input.VERCEL_PROJECT_PRODUCTION_URL) || present(input.VERCEL_URL) || (explicit && REDIRECT_HOSTS.has(hostname(explicit)))) {
    return CANONICAL_SITE_URL;
  }
  return (explicit ?? "http://localhost:3000").replace(/\/$/, "");
}

export function canonicalRedirect(hostHeader: string | null, pathWithSearch: string) {
  const host = hostHeader?.split(":")[0]?.toLowerCase() ?? "";
  if (!REDIRECT_HOSTS.has(host)) return null;
  const path = pathWithSearch.startsWith("/") ? pathWithSearch : `/${pathWithSearch}`;
  return `${CANONICAL_SITE_URL}${path}`;
}
