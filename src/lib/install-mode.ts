export type InstallSurface = "prompt" | "ios-share" | "desktop-safari" | "in-app" | "none";

export function readInstallBrowser(input: {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
}) {
  const ua = input.userAgent;
  const iPadOs = input.platform === "MacIntel" && input.maxTouchPoints > 1;
  const ios = /iphone|ipad|ipod/i.test(ua) || iPadOs;
  const inApp = /FBAN|FBAV|Instagram|WhatsApp|TikTok|Snapchat|Line\/|Twitter|LinkedIn/i.test(ua);
  const safari = /safari/i.test(ua) && !/chrome|chromium|crios|fxios|edg\/|opr\/|android/i.test(ua);
  return { ios, desktopSafari: safari && !ios, inApp };
}

export function installSurface(input: {
  canPrompt: boolean;
  ios: boolean;
  desktopSafari: boolean;
  inApp: boolean;
}): InstallSurface {
  if (input.canPrompt) return "prompt";
  if (input.inApp) return "in-app";
  if (input.ios) return "ios-share";
  if (input.desktopSafari) return "desktop-safari";
  return "none";
}
