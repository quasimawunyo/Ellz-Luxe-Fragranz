import { listContactMessages, countNewsletterSubscribers, listRestockWaitlist } from "@/lib/admin/inbox";
import { getAllProductsForAdmin } from "@/lib/catalog/queries";

export const metadata = { title: "Inbox · Admin" };

export default async function AdminInboxPage() {
  const [messages, subscribers, waitlist, products] = await Promise.all([
    listContactMessages(),
    countNewsletterSubscribers(),
    listRestockWaitlist(),
    getAllProductsForAdmin(),
  ]);
  const names = Object.fromEntries(products.map((product) => [product.id, product.name]));

  return (
    <div>
      <h1 className="text-2xl font-semibold">Inbox</h1>
      <p className="mt-2 text-sm text-taupe">
        {subscribers} newsletter {subscribers === 1 ? "subscriber" : "subscribers"} · {waitlist.length} restock{" "}
        {waitlist.length === 1 ? "request" : "requests"}.
      </p>
      {waitlist.length ? (
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
        {messages.map((note) => (
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
