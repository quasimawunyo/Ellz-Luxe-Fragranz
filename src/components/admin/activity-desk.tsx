"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ActivityRow = {
  id: string;
  actorEmail: string;
  label: string;
  before: string;
  after: string;
  createdAt: string;
};

export function ActivityDesk({
  rows,
  initialPerson,
  action,
  from,
  to,
  order,
  actions,
}: {
  rows: ActivityRow[];
  initialPerson: string;
  action?: string;
  from?: string;
  to?: string;
  order?: string;
  actions: Array<{ id: string; label: string }>;
}) {
  const [person, setPerson] = useState(initialPerson);
  const needle = person.trim().toLowerCase();
  const visible = needle
    ? rows.filter((row) => `${row.actorEmail} ${row.label} ${row.before} ${row.after}`.toLowerCase().includes(needle))
    : rows;

  return (
    <>
      <form className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" method="get">
        {order ? <input type="hidden" name="order" value={order} /> : null}
        <Input
          name="person"
          value={person}
          onChange={(event) => setPerson(event.target.value)}
          placeholder="Person"
          aria-label="Person"
          autoComplete="off"
        />
        <select name="action" defaultValue={action ?? ""} aria-label="Action" className="min-h-11 border border-espresso/15 bg-white px-3 text-sm">
          <option value="">All actions</option>
          {actions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <Input name="from" type="date" defaultValue={from} aria-label="From" />
        <Input name="to" type="date" defaultValue={to} aria-label="To" />
        <Button type="submit">Filter</Button>
      </form>
      <ul className="mt-8 divide-y divide-espresso/10 rounded-[1.25rem] border border-espresso/10 bg-white" aria-live="polite">
        {visible.map((row) => (
          <li key={row.id} className="px-4 py-4 text-sm">
            <p>{row.label}</p>
            {row.before || row.after ? (
              <p className="mt-1 text-taupe">
                {row.before || "—"} → {row.after || "—"}
              </p>
            ) : null}
            <p className="mt-1 text-xs text-taupe">
              {row.actorEmail} ·{" "}
              {new Intl.DateTimeFormat("en-GH", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Accra" }).format(new Date(row.createdAt))}
            </p>
          </li>
        ))}
        {!visible.length ? <li className="px-4 py-8 text-sm text-taupe">No activity yet.</li> : null}
      </ul>
    </>
  );
}
