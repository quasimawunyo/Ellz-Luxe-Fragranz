export function AnnouncementBar({ message }: { message: string }) {
  return (
    <div className="bg-rich text-champagne">
      <p className="mx-auto max-w-7xl px-4 py-2.5 text-center text-[10px] font-medium uppercase tracking-[0.32em]">
        {message}
      </p>
    </div>
  );
}
