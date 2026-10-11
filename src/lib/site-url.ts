function present(value: string | undefined) {
  return value && value.length > 0 ? value : undefined;
}

function withHttps(host: string) {
  return host.startsWith("http") ? host.replace(/\/$/, "") : `https://${host.replace(/\/$/, "")}`;
}

export function resolveSiteUrl(input: {
  NEXT_PUBLIC_SITE_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
  VERCEL_URL?: string;
}) {
  const explicit = present(input.NEXT_PUBLIC_SITE_URL);
  if (explicit && !/localhost|127\.0\.0\.1/i.test(explicit)) {
    return explicit.replace(/\/$/, "");
  }
  const production = present(input.VERCEL_PROJECT_PRODUCTION_URL);
  if (production) return withHttps(production);
  const deployment = present(input.VERCEL_URL);
  if (deployment) return withHttps(deployment);
  return (explicit ?? "http://localhost:3000").replace(/\/$/, "");
}
