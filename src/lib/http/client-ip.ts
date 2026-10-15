export function clientIp(headerList: Headers) {
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const real = headerList.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 64);
  return "anon";
}
