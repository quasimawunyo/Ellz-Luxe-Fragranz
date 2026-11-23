"use client";

import Image from "next/image";
import { Download, MessageCircle, ShoppingBag, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { installSurface, readInstallBrowser, type InstallSurface } from "@/lib/install-mode";

const NEVER_KEY = "elf-install-never";
const LATER_KEY = "elf-install-later";
const SHOW_AFTER_MS = 5_000;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type InstallWindow = Window & {
  __elfInstallPrompt?: BeforeInstallPromptEvent;
};

const tiles = [
  { icon: Smartphone, label: "One tap" },
  { icon: ShoppingBag, label: "The shop" },
  { icon: MessageCircle, label: "WhatsApp" },
];

function isStandalone() {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [browser, setBrowser] = useState({ ios: false, desktopSafari: false, inApp: false });
  const [waited, setWaited] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [note, setNote] = useState<string | null>(null);
  const [host, setHost] = useState("");

  useEffect(() => {
    if (isStandalone()) return;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    const installWindow = window as InstallWindow;
    const take = (event?: BeforeInstallPromptEvent) => {
      const promptEvent = event ?? installWindow.__elfInstallPrompt ?? null;
      if (!promptEvent) return;
      promptEvent.preventDefault();
      installWindow.__elfInstallPrompt = promptEvent;
      setDeferred(promptEvent);
    };
    take();
    const onPrompt = (event: Event) => take(event as BeforeInstallPromptEvent);
    const onReady = () => take();
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("elf-install-ready", onReady);

    const hidden = localStorage.getItem(NEVER_KEY) === "1" || sessionStorage.getItem(LATER_KEY) === "1";
    setBrowser(
      readInstallBrowser({
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        maxTouchPoints: navigator.maxTouchPoints,
      }),
    );
    setHost(window.location.host);
    setDismissed(hidden);
    const id = window.setTimeout(() => setWaited(true), SHOW_AFTER_MS);

    return () => {
      window.clearTimeout(id);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("elf-install-ready", onReady);
    };
  }, []);

  function later() {
    sessionStorage.setItem(LATER_KEY, "1");
    setDismissed(true);
  }

  function never() {
    localStorage.setItem(NEVER_KEY, "1");
    setDismissed(true);
  }

  const surface: InstallSurface = installSurface({
    canPrompt: Boolean(deferred),
    ios: browser.ios,
    desktopSafari: browser.desktopSafari,
    inApp: browser.inApp,
  });

  async function install() {
    if (deferred) {
      try {
        await deferred.prompt();
        const choice = await deferred.userChoice;
        (window as InstallWindow).__elfInstallPrompt = undefined;
        setDeferred(null);
        if (choice.outcome === "accepted") localStorage.setItem(NEVER_KEY, "1");
        setDismissed(true);
      } catch {
        setNote("Use the install icon in the address bar.");
      }
      return;
    }

    if (surface !== "ios-share" || typeof navigator.share !== "function") {
      setNote("Tap Share in Safari, then Add to Home Screen.");
      return;
    }

    try {
      await navigator.share({ title: "EllzLuxe Fragranz", url: window.location.href });
      setNote("Choose Add to Home Screen in that menu.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setNote("Tap Share in Safari, then Add to Home Screen.");
    }
  }

  const open = waited && !dismissed && surface !== "none";
  if (!open) return null;

  const instructions =
    surface === "desktop-safari"
      ? "From the Safari menu, choose Add to Dock."
      : surface === "in-app"
        ? "Open this page in Safari, then tap Share and Add to Home Screen."
        : surface === "ios-share"
          ? "Opens the share menu. Then choose Add to Home Screen."
          : null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-rich/50 p-4 pb-24 sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-prompt-title"
        className="w-full max-w-sm rounded-[1.75rem] bg-white px-5 pb-6 pt-3 shadow-xl"
      >
        <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-espresso/15" />
        <div className="flex items-center gap-3">
          <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#e7f6ee]">
            <Image src="/icons/icon-192.png" alt="EllzLuxe" width={56} height={56} className="size-14 object-contain" />
          </span>
          <span className="min-w-0">
            <span id="install-prompt-title" className="block text-xl font-semibold leading-tight text-espresso">
              Add to Home Screen
            </span>
            {host ? <span className="mt-0.5 block truncate text-sm text-taupe">{host}</span> : null}
            <span className="mt-1 block text-sm text-taupe">EllzLuxe Fragranz</span>
          </span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-2xl bg-[#f6f7f4] px-2 py-4 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#d9f3e3] text-leaf">
                <tile.icon className="size-5" aria-hidden />
              </span>
              <span className="mt-3 block text-xs text-espresso/80">{tile.label}</span>
            </div>
          ))}
        </div>
        {surface === "prompt" || surface === "ios-share" ? (
          <button
            type="button"
            onClick={install}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf py-4 text-base font-semibold text-white"
          >
            <Download className="size-5" aria-hidden />
            Add to Home Screen
          </button>
        ) : null}
        {instructions ? <p className="mt-5 text-center text-sm leading-6 text-espresso">{instructions}</p> : null}
        {note ? <p className="mt-3 text-center text-sm leading-6 text-taupe">{note}</p> : null}
        <button type="button" onClick={later} className="mt-4 block w-full text-center text-sm text-taupe">
          Maybe Later
        </button>
        <button type="button" onClick={never} className="mt-3 block w-full text-center text-xs text-taupe/80">
          Don&apos;t show again
        </button>
      </div>
    </div>
  );
}
