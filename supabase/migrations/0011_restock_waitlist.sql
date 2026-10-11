create table if not exists public.restock_waitlist (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  unique (product_id, email)
);

alter table public.restock_waitlist enable row level security;

create index if not exists restock_waitlist_product_id_idx on public.restock_waitlist (product_id);
