"use client";

import { useEffect, useId, useRef } from "react";

export function FormGuard() {
  const opened = useRef<HTMLInputElement>(null);
  const trapId = useId();
  useEffect(() => {
    if (opened.current) opened.current.value = String(Date.now());
  }, []);
  return (
    <>
      <input ref={opened} type="hidden" name="openedAt" defaultValue="" />
      <div className="absolute -left-[10000px] top-0 h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor={trapId}>Company website</label>
        <input id={trapId} name="company_website" tabIndex={-1} autoComplete="off" />
      </div>
    </>
  );
}
