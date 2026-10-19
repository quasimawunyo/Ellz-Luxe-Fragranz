import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { env, isSupabaseConfigured } from "@/lib/env";
import { contentSecurityPolicy } from "@/lib/security/csp";

function sessionNeedsRefresh(request: NextRequest) {
  const chunks = request.cookies
    .getAll()
    .filter((cookie) => cookie.name.includes("-auth-token"))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (!chunks.length) return false;
  try {
    const raw = chunks.map((cookie) => cookie.value).join("");
    const json = raw.startsWith("base64-")
      ? Buffer.from(raw.slice("base64-".length), "base64url").toString("utf8")
      : raw;
    const session = JSON.parse(json) as { expires_at?: number };
    if (typeof session.expires_at !== "number") return true;
    return session.expires_at * 1000 < Date.now() + 60_000;
  } catch {
    return true;
  }
}

function withCsp(request: NextRequest, nonce: string) {
  const requestHeaders = new Headers(request.headers);
  const csp = contentSecurityPolicy(nonce);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  let response = withCsp(request, nonce);
  const { pathname } = request.nextUrl;
  const isProtected = pathname.startsWith("/account") || pathname.startsWith("/admin");

  if (!isSupabaseConfigured()) {
    if (isProtected) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
    return response;
  }

  if (!isProtected && !sessionNeedsRefresh(request)) {
    return response;
  }

  const supabase = createServerClient(env.supabaseUrl!, env.supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = withCsp(request, nonce);
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtected && !user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
