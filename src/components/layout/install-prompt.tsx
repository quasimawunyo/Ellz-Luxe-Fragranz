"use client";

import Image from "next/image";
import { Download, MessageCircle, ShoppingBag, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

const NEVER_KEY = "elf-install-never";
const LATER_KEY = "elf-install-later";
const SHOW_AFTER_MS = 5_000;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const tiles = [
  { icon: Smartphone, label: "One tap" },
  { icon: ShoppingBag, label: "The shop" },
  { icon: MessageCircle, label: "WhatsApp" },
];

export function InstallPrompt() {
  const [open, setOpen] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [manual, setManual] = useState<string | null>(null);
  const [host, setHost] = useState("");

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem(NEVER_KEY) === "1" || sessionStorage.getItem(LATER_KEY) === "1") return;
    setHost(window.location.host);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    const id = window.setTimeout(() => setOpen(true), SHOW_AFTER_MS);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, []);

  function later() {
    sessionStorage.setItem(LATER_KEY, "1");
    setOpen(false);
  }

  function never() {
    localStorage.setItem(NEVER_KEY, "1");
    setOpen(false);
  }

  async function install() {
    if (!deferred) {
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      setManual(
        ios
          ? "Tap Share, then Add to Home Screen."
          : "Open the browser menu, then choose Add to Home Screen.",
      );
      return;
    }
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    if (choice.outcome === "accepted") localStorage.setItem(NEVER_KEY, "1");
    setOpen(false);
  }

  if (!open) return null;

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
            <Image src="/icons/icon-192.png" alt="" width={56} height={56} className="size-14 object-contain" />
          </span>
          <span className="min-w-0">
            <span id="install-prompt-title" className="block text-xl font-semibold leading-tight text-espresso">
              EllzLuxe Fragranz
            </span>
            {host ? <span className="mt-0.5 block truncate text-sm text-taupe">{host}</span> : null}
            <span className="mt-1 block text-sm text-taupe">Perfume boutique</span>
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
        <button
          type="button"
          onClick={install}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf py-4 text-base font-semibold text-white"
        >
          <Download className="size-5" aria-hidden />
          Add to Home Screen
        </button>
        {manual ? <p className="mt-3 text-center text-sm leading-6 text-taupe">{manual}</p> : null}
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
