export function AnnouncementBar({ message }: { message: string }) {
  return (
    <div className="bg-rich text-ivory">
      <p className="mx-auto max-w-7xl px-4 py-2 text-center text-xs">{message}</p>
    </div>
  );
}
