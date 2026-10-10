export function AnnouncementBar({ message }: { message: string }) {
  return (
    <div className="bg-rich text-champagne">
      <p className="mx-auto max-w-7xl px-4 py-2 text-center text-[11px] font-medium uppercase tracking-[0.18em]">
        {message}
      </p>
    </div>
  );
}
