export function AnnouncementBar({ message }: { message: string }) {
  return (
    <div className="bg-rich text-ivory">
      <p className="mx-auto max-w-7xl px-4 py-2 text-center text-[11px] tracking-[0.04em]">{message}</p>
    </div>
  );
}
