-- Stock is optional until the owner starts tracking a size.
-- track_stock = false stays sellable. Quantity changes only through adjust_stock.

alter table public.product_variants
  add column if not exists track_stock boolean not null default false;

alter table public.product_variants
  add column if not exists stock_quantity integer not null default 0;

alter table public.product_variants
  add column if not exists low_stock_threshold integer;

alter table public.product_variants
  drop constraint if exists product_variants_stock_quantity_check;

alter table public.product_variants
  add constraint product_variants_stock_quantity_check check (stock_quantity >= 0);

alter table public.product_variants
  drop constraint if exists product_variants_low_stock_threshold_check;

alter table public.product_variants
  add constraint product_variants_low_stock_threshold_check
  check (low_stock_threshold is null or low_stock_threshold >= 0);

alter table public.orders
  add column if not exists needs_attention boolean not null default false;

alter table public.orders
  add column if not exists attention_note text;

alter table public.orders
  add column if not exists stock_applied boolean not null default false;

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id text not null references public.product_variants (id) on delete restrict,
  change integer not null check (change <> 0),
  reason text not null check (
    reason in (
      'restock',
      'sale_online',
      'sale_pos',
      'correction',
      'damaged',
      'returned',
      'order_cancelled',
      'opening_stock'
    )
  ),
  order_id uuid references public.orders (id) on delete set null,
  note text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists stock_movements_variant_created_idx
  on public.stock_movements (variant_id, created_at desc);

create unique index if not exists stock_movements_order_variant_reason_idx
  on public.stock_movements (order_id, variant_id, reason)
  where order_id is not null and reason in ('sale_online', 'order_cancelled');

create or replace function public.guard_stock_quantity()
returns trigger
language plpgsql
as $$
begin
  if current_setting('elf.stock_write', true) = 'on' then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.stock_quantity := 0;
    return new;
  end if;
  if new.stock_quantity is distinct from old.stock_quantity then
    raise exception 'stock_quantity_locked';
  end if;
  return new;
end;
$$;

drop trigger if exists product_variants_stock_quantity_guard on public.product_variants;

create trigger product_variants_stock_quantity_guard
  before insert or update on public.product_variants
  for each row
  execute function public.guard_stock_quantity();

create or replace function public.adjust_stock(
  p_variant_id text,
  p_change integer,
  p_reason text,
  p_order_id uuid default null,
  p_note text default null,
  p_created_by uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_variant public.product_variants%rowtype;
  v_next integer;
begin
  if p_change is null or p_change = 0 then
    raise exception 'stock_change_required';
  end if;
  if p_reason not in (
    'restock',
    'sale_online',
    'sale_pos',
    'correction',
    'damaged',
    'returned',
    'order_cancelled',
    'opening_stock'
  ) then
    raise exception 'invalid_stock_reason';
  end if;

  select * into v_variant
  from public.product_variants
  where id = p_variant_id
  for update;

  if not found then
    raise exception 'unknown_variant';
  end if;

  if p_reason in ('sale_online', 'order_cancelled') then
    if p_order_id is null then
      raise exception 'order_required';
    end if;
    if exists (
      select 1
      from public.stock_movements
      where order_id = p_order_id
        and variant_id = p_variant_id
        and reason = p_reason
    ) then
      return jsonb_build_object(
        'applied', false,
        'reason', 'already_applied',
        'stock_quantity', v_variant.stock_quantity
      );
    end if;
  end if;

  if p_reason = 'sale_online' and not v_variant.track_stock then
    return jsonb_build_object(
      'applied', false,
      'reason', 'not_tracked',
      'stock_quantity', v_variant.stock_quantity
    );
  end if;

  if p_reason = 'order_cancelled' and not exists (
    select 1
    from public.stock_movements
    where order_id = p_order_id
      and variant_id = p_variant_id
      and reason = 'sale_online'
  ) then
    return jsonb_build_object(
      'applied', false,
      'reason', 'no_sale',
      'stock_quantity', v_variant.stock_quantity
    );
  end if;

  v_next := v_variant.stock_quantity + p_change;
  if v_next < 0 then
    raise exception 'insufficient_stock';
  end if;

  perform set_config('elf.stock_write', 'on', true);

  update public.product_variants
  set stock_quantity = v_next
  where id = v_variant.id;

  insert into public.stock_movements (
    variant_id, change, reason, order_id, note, created_by
  ) values (
    v_variant.id, p_change, p_reason, p_order_id, p_note, p_created_by
  );

  return jsonb_build_object(
    'applied', true,
    'reason', p_reason,
    'stock_quantity', v_next
  );
exception
  when unique_violation then
    return jsonb_build_object(
      'applied', false,
      'reason', 'already_applied',
      'stock_quantity', v_variant.stock_quantity
    );
end;
$$;

revoke all on function public.adjust_stock(text, integer, text, uuid, text, uuid) from public;
revoke all on function public.adjust_stock(text, integer, text, uuid, text, uuid) from anon, authenticated;
grant execute on function public.adjust_stock(text, integer, text, uuid, text, uuid) to service_role;

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

revoke all on function public.checkout_create_order(uuid, text, text, text, text, text, text, text, bigint, text, jsonb) from public;
revoke all on function public.checkout_create_order(uuid, text, text, text, text, text, text, text, bigint, text, jsonb) from anon, authenticated;
grant execute on function public.checkout_create_order(uuid, text, text, text, text, text, text, text, bigint, text, jsonb) to service_role;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'super_admin')
  );
$$;

revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to authenticated;

alter table public.stock_movements enable row level security;

drop policy if exists stock_movements_staff_read on public.stock_movements;

create policy stock_movements_staff_read
  on public.stock_movements
  for select
  to authenticated
  using (public.is_staff());
