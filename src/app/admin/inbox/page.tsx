import Link from "next/link";
import { markMessageAnsweredAction, markMessageSpamAction } from "@/app/actions/inbox";
import { listContactMessages, countNewsletterSubscribers, listRestockWaitlist, countInboxMessages, type ContactNote } from "@/lib/admin/inbox";
import { getAllProductsForAdmin } from "@/lib/catalog/queries";
import { whatsappHref } from "@/lib/whatsapp";

export const metadata = { title: "Inbox · Shop desk" };

function replyFor(note: ContactNote) {
  const found = note.phone.trim() || note.message.match(/(?:\+?233|0)\d{9}/)?.[0] || "";
  const whatsapp = found ? whatsappHref(found, `Hello ${note.name}, this is EllzLuxe Fragranz.`) : null;
  if (whatsapp) return { href: whatsapp, label: "Reply on WhatsApp" };
  if (note.email.trim()) return { href: `mailto:${encodeURIComponent(note.email.trim())}`, label: "Reply by email" };
  return null;
}

export default async function AdminInboxPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const view = (await searchParams).view;
  const spam = view === "spam";
  const answered = view === "answered";
  const [messages, subscribers, waitlist, products, inboxCount] = await Promise.all([
    listContactMessages(spam),
    countNewsletterSubscribers(),
    listRestockWaitlist(),
    getAllProductsForAdmin(),
    countInboxMessages(),
  ]);
  const names = Object.fromEntries(products.map((product) => [product.id, product.name]));
  const visible = spam
    ? messages
    : answered
      ? messages.filter((note) => note.answeredAt)
      : messages.filter((note) => !note.answeredAt).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div>
      <h1 className="text-2xl font-semibold">Inbox</h1>
      <p className="mt-2 text-sm text-taupe">
        {inboxCount} new {inboxCount === 1 ? "message" : "messages"} · {subscribers} newsletter {subscribers === 1 ? "subscriber" : "subscribers"} ·{" "}
        {waitlist.length} restock {waitlist.length === 1 ? "request" : "requests"}.
      </p>
      <p className="mt-3 flex flex-wrap gap-4 text-sm">
        {view ? (
          <Link href="/admin/inbox" className="underline">
            New
          </Link>
        ) : (
          <span>New</span>
        )}
        {answered ? <span>Answered</span> : (
          <Link href="/admin/inbox?view=answered" className="underline">
            Answered
          </Link>
        )}
        {spam ? <span>Spam</span> : (
          <Link href="/admin/inbox?view=spam" className="underline">
            Spam
          </Link>
        )}
      </p>
      {waitlist.length && !spam ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Restock waitlist</h2>
          <ul className="luxe-panel mt-3 divide-y divide-espresso/10">
            {waitlist.map((row) => (
              <li key={row.id} className="flex flex-wrap justify-between gap-2 px-6 py-4 text-sm">
                <span>
                  {names[row.productId] ?? row.productId} · {row.email}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <ul className="luxe-panel mt-8 divide-y divide-espresso/10">
        {visible.map((note) => {
          const reply = replyFor(note);
          return (
          <li key={note.id} className="px-6 py-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium">{note.name}</p>
              <p className="text-xs text-taupe">
                {new Intl.DateTimeFormat("en-GH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Africa/Accra",
                }).format(new Date(note.createdAt))}
              </p>
            </div>
            <p className="mt-1 text-sm text-taupe">{[note.phone, note.email].filter(Boolean).join(" · ") || "No phone or email"}</p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7">{note.message}</p>
            <div className="mt-3 flex flex-wrap gap-4">
              {reply ? (
                <a href={reply.href} className="inline-flex min-h-11 items-center text-sm underline">
                  {reply.label}
                </a>
              ) : null}
              {!spam && !note.answeredAt ? (
                <form action={markMessageAnsweredAction}>
                  <input type="hidden" name="id" value={note.id} />
                  <button type="submit" className="min-h-11 text-sm underline">
                    Answered
                  </button>
                </form>
              ) : null}
              <form action={markMessageSpamAction}>
                <input type="hidden" name="id" value={note.id} />
                <input type="hidden" name="spam" value={spam ? "false" : "true"} />
                <button type="submit" className="min-h-11 text-sm underline">
                  {spam ? "Not spam" : "Mark as spam"}
                </button>
              </form>
            </div>
          </li>
          );
        })}
        {!visible.length ? (
          <li className="px-6 py-12 text-sm text-taupe">
            {spam ? "No spam messages." : answered ? "No answered messages." : "No messages waiting."}
          </li>
        ) : null}
      </ul>
    </div>
  );
}
