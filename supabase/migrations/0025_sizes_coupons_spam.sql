-- Sizes can be hidden, coupons apply to goods only, and contact spam can be set aside.
-- Existing orders, payments, prices, and stock quantities are not changed.
-- Run this before deploying the branch that reads these columns.

alter table public.product_variants
  add column if not exists visible boolean not null default true;

alter table public.orders
  add column if not exists coupon_code text,
  add column if not exists discount_minor bigint not null default 0;

alter table public.orders
  drop constraint if exists orders_discount_minor_check;

alter table public.orders
  add constraint orders_discount_minor_check check (discount_minor >= 0);

alter table public.contact_messages
  add column if not exists is_spam boolean not null default false;

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  value_minor bigint not null check (value_minor > 0),
  starts_at timestamptz,
  expires_at timestamptz,
  max_uses integer check (max_uses is null or max_uses > 0),
  uses_count integer not null default 0 check (uses_count >= 0),
  minimum_order_minor bigint check (minimum_order_minor is null or minimum_order_minor >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists coupons_code_lower_idx on public.coupons (lower(code));

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons (id),
  order_id uuid not null unique references public.orders (id),
  created_at timestamptz not null default now()
);

alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;

revoke all on public.coupons from anon, authenticated;
revoke all on public.coupon_redemptions from anon, authenticated;
grant select, insert, update, delete on public.coupons to service_role;
grant select, insert, delete on public.coupon_redemptions to service_role;

create or replace function public.redeem_coupon(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text;
  v_coupon_id uuid;
begin
  select coupon_code into v_code from public.orders where id = p_order_id;
  if v_code is null then
    return false;
  end if;
  if exists (select 1 from public.coupon_redemptions where order_id = p_order_id) then
    return true;
  end if;
  update public.coupons
    set uses_count = uses_count + 1
    where lower(code) = lower(v_code)
      and (max_uses is null or uses_count < max_uses)
    returning id into v_coupon_id;
  if v_coupon_id is null then
    return false;
  end if;
  insert into public.coupon_redemptions (coupon_id, order_id)
  values (v_coupon_id, p_order_id);
  return true;
end;
$$;

do $$
begin
  execute (
    select format('revoke all on function %s from public, anon, authenticated', p.oid::regprocedure)
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'redeem_coupon'
  );
  execute (
    select format('grant execute on function %s to service_role', p.oid::regprocedure)
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'redeem_coupon'
  );
end $$;

create or replace function public.checkout_create_order(
  p_user_id uuid,
  p_email text,
  p_full_name text,
  p_phone text,
  p_region text,
  p_locality text,
  p_address_line text,
  p_delivery_method text,
  p_shipping_minor bigint,
  p_notes text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid := gen_random_uuid();
  v_item jsonb;
  v_variant public.product_variants%rowtype;
  v_product public.products%rowtype;
  v_subtotal bigint := 0;
  v_qty integer;
begin
  if jsonb_array_length(p_items) is null or jsonb_array_length(p_items) < 1 then
    raise exception 'Cart is empty';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item->>'quantity')::integer;
    select * into v_variant from public.product_variants
      where id = v_item->>'variant_id'
      for update;
    if not found then
      raise exception 'Unknown variant';
    end if;
    if v_variant.visible = false then
      raise exception 'That size is not available';
    end if;
    select * into v_product from public.products where id = v_variant.product_id;
    if v_product.status <> 'published' then
      raise exception 'Product is not available';
    end if;
    if v_variant.price_minor <> (v_item->>'unit_price_minor')::bigint then
      raise exception 'Price mismatch for %', v_variant.sku;
    end if;
    if v_variant.track_stock and v_variant.stock_quantity < v_qty then
      raise exception 'Only % of % (%) are available.', v_variant.stock_quantity, v_product.name, v_variant.label;
    end if;
    v_subtotal := v_subtotal + (v_variant.price_minor * v_qty);
  end loop;

  insert into public.orders (
    id, order_number, user_id, email, full_name, phone, region, locality, address_line,
    delivery_method, notes, currency_code, subtotal_minor, shipping_minor, total_minor
  ) values (
    v_order_id,
    'ELF-' || upper(substr(replace(v_order_id::text, '-', ''), 1, 10)),
    p_user_id, p_email, p_full_name, p_phone, p_region, p_locality, p_address_line,
    p_delivery_method, p_notes, 'GHS', v_subtotal, p_shipping_minor, v_subtotal + p_shipping_minor
  );

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into public.order_items (
      order_id, product_name, sku, variant_label, quantity, unit_price_minor, product_id, variant_id
    ) values (
      v_order_id,
      v_item->>'product_name',
      v_item->>'sku',
      v_item->>'variant_label',
      (v_item->>'quantity')::integer,
      (v_item->>'unit_price_minor')::bigint,
      v_item->>'product_id',
      v_item->>'variant_id'
    );
  end loop;

  return v_order_id;
end;
$$;

do $$
begin
  execute (
    select format('revoke all on function %s from public, anon, authenticated', p.oid::regprocedure)
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'checkout_create_order'
  );
  execute (
    select format('grant execute on function %s to service_role', p.oid::regprocedure)
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'checkout_create_order'
  );
end $$;
