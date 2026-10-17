import { ThemeToggle } from "@/components/theme/theme-toggle";

export function AnnouncementBar({ message }: { message: string }) {
  return (
    <div className="relative bg-leaf text-snow">
      <p className="mx-auto max-w-7xl px-14 py-2 text-center text-[11px] tracking-[0.04em] sm:px-16">
        {message}
      </p>
      <div className="absolute right-1 top-1/2 -translate-y-1/2 sm:right-3">
        <ThemeToggle className="text-snow" />
      </div>
    </div>
  );
}
