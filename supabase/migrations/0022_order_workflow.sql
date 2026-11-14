-- Daily order work: fulfilment names, delivery fee history, and a review flag.
-- The existing paid order is flagged for review. It is not marked as a test.

alter table public.orders
  add column if not exists is_test boolean not null default false;

alter table public.orders
  add column if not exists awaiting_review boolean not null default false;

alter table public.orders
  alter column fulfillment_status set default 'new';

alter table public.payments
  add column if not exists method text;

alter table public.payments
  add column if not exists note text;

alter table public.payments
  add column if not exists link_url text;

alter table public.payments
  drop constraint if exists payments_method_check;

alter table public.payments
  add constraint payments_method_check
  check (method is null or method in ('mobile_money', 'cash', 'card', 'moolre', 'paystack'));

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  event_type text not null check (
    event_type in ('fulfilment', 'payment', 'delivery_fee', 'test', 'refund', 'note')
  ),
  from_value text,
  to_value text,
  note text,
  created_by uuid references public.profiles (id) on delete set null,
  actor_email text,
  created_at timestamptz not null default now()
);

create index if not exists order_events_order_created_idx
  on public.order_events (order_id, created_at);

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'orders'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%fulfillment_status%'
  loop
    execute format('alter table public.orders drop constraint %I', constraint_name);
  end loop;
end $$;

insert into public.order_events (order_id, event_type, from_value, to_value, note, actor_email)
select
  id,
  'fulfilment',
  fulfillment_status,
  case
    when fulfillment_status = 'unfulfilled' then 'new'
    when fulfillment_status = 'processing' then 'packed'
    when fulfillment_status = 'shipped' and delivery_method ilike '%pickup%' then 'ready_for_pickup'
    when fulfillment_status = 'shipped' then 'out_for_delivery'
    when fulfillment_status = 'delivered' and delivery_method ilike '%pickup%' then 'collected'
    else fulfillment_status
  end,
  'Fulfilment names updated for daily order work.',
  'system'
from public.orders
where fulfillment_status in ('unfulfilled', 'processing', 'shipped')
   or (fulfillment_status = 'delivered' and delivery_method ilike '%pickup%');

update public.orders
set fulfillment_status = case
  when fulfillment_status = 'unfulfilled' then 'new'
  when fulfillment_status = 'processing' then 'packed'
  when fulfillment_status = 'shipped' and delivery_method ilike '%pickup%' then 'ready_for_pickup'
  when fulfillment_status = 'shipped' then 'out_for_delivery'
  when fulfillment_status = 'delivered' and delivery_method ilike '%pickup%' then 'collected'
  else fulfillment_status
end
where fulfillment_status in ('unfulfilled', 'processing', 'shipped', 'delivered');

alter table public.orders
  drop constraint if exists orders_fulfillment_status_check;

alter table public.orders
  add constraint orders_fulfillment_status_check
  check (
    fulfillment_status in (
      'new',
      'packed',
      'out_for_delivery',
      'ready_for_pickup',
      'delivered',
      'collected',
      'cancelled'
    )
  );

insert into public.order_events (order_id, event_type, note, actor_email)
select
  id,
  'note',
  'This paid order is waiting for review. It was not marked as a test.',
  'system'
from public.orders
where payment_status = 'paid'
  and awaiting_review = false
  and not exists (
    select 1
    from public.order_events
    where order_events.order_id = orders.id
      and order_events.note = 'This paid order is waiting for review. It was not marked as a test.'
  );

update public.orders
set awaiting_review = true
where payment_status = 'paid'
  and awaiting_review = false
  and is_test = false;

alter table public.order_events enable row level security;

drop policy if exists order_events_staff_read on public.order_events;

create policy order_events_staff_read
  on public.order_events
  for select
  to authenticated
  using (public.is_staff());
