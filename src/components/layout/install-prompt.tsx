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

type InstallWindow = Window & {
  __elfInstallPrompt?: BeforeInstallPromptEvent;
};

const tiles = [
  { icon: Smartphone, label: "One tap" },
  { icon: ShoppingBag, label: "The shop" },
  { icon: MessageCircle, label: "WhatsApp" },
];

function isIosDevice() {
  const ua = navigator.userAgent;
  const iPadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return /iphone|ipad|ipod/i.test(ua) || iPadOs;
}

function isStandalone() {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [phone, setPhone] = useState(false);
  const [waited, setWaited] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [manual, setManual] = useState<string | null>(null);
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
    const iosDevice = isIosDevice();
    setIos(iosDevice);
    setPhone(window.matchMedia("(max-width: 767px), (pointer: coarse)").matches);
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

  async function install() {
    if (!deferred) {
      setManual(ios ? "Tap Share, then Add to Home Screen." : "Open the browser menu, then choose Add to Home Screen.");
      return;
    }
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      (window as InstallWindow).__elfInstallPrompt = undefined;
      setDeferred(null);
      if (choice.outcome === "accepted") localStorage.setItem(NEVER_KEY, "1");
      setDismissed(true);
    } catch {
      setManual("Open the browser menu, then choose Add to Home Screen.");
    }
  }

  const open = waited && !dismissed && (Boolean(deferred) || ios || phone);
  if (!open) return null;

  const steps = ios
    ? "Tap Share, then Add to Home Screen."
    : deferred
      ? null
      : "Open the browser menu, then choose Add to Home Screen.";

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
        {deferred ? (
          <button
            type="button"
            onClick={install}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf py-4 text-base font-semibold text-white"
          >
            <Download className="size-5" aria-hidden />
            Add to Home Screen
          </button>
        ) : (
          <p className="mt-5 text-center text-sm leading-6 text-espresso">{steps}</p>
        )}
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
