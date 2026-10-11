import { listContactMessages, countNewsletterSubscribers } from "@/lib/admin/inbox";

export const metadata = { title: "Inbox · Admin" };

export default async function AdminInboxPage() {
  const [messages, subscribers] = await Promise.all([listContactMessages(), countNewsletterSubscribers()]);

  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.22em] text-taupe">House mail</p>
      <h1 className="mt-2 font-serif text-4xl">Inbox</h1>
      <p className="mt-3 text-sm text-taupe">
        {subscribers} newsletter {subscribers === 1 ? "subscriber" : "subscribers"}. Contact notes are stored when Supabase is connected.
      </p>
      <ul className="luxe-panel mt-8 divide-y divide-espresso/10">
        {messages.map((note) => (
          <li key={note.id} className="px-6 py-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium">{note.name}</p>
              <p className="text-xs uppercase tracking-[0.16em] text-taupe">
                {new Intl.DateTimeFormat("en-GH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Africa/Accra",
                }).format(new Date(note.createdAt))}
              </p>
            </div>
            <p className="mt-1 text-sm text-taupe">{note.email}</p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{note.message}</p>
          </li>
        ))}
        {!messages.length ? (
          <li className="px-6 py-12 text-sm text-taupe">No contact messages yet.</li>
        ) : null}
      </ul>
    </div>
  );
}
