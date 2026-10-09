export function AnnouncementBar({ message }: { message: string }) {
  return (
    <div className="bg-espresso text-ivory">
      <p className="mx-auto max-w-7xl px-4 py-2 text-center text-[11px] uppercase tracking-[0.22em]">
        {message}
      </p>
    </div>
  );
}
