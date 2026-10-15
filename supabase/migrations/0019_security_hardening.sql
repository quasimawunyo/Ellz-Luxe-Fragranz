-- Harden grants, definer RPCs, first-user race, pending stock release, and explicit RLS.

revoke all on all tables in schema public from anon, authenticated;

grant select on table
  public.categories,
  public.collections,
  public.products,
  public.product_variants,
  public.product_images,
  public.collection_products,
  public.store_settings,
  public.faq_items
to anon, authenticated;

grant select, update on table public.profiles to authenticated;
grant select on table public.orders, public.order_items to authenticated;

revoke execute on function public.checkout_create_order(
  uuid, text, text, text, text, text, text, text, bigint, text, jsonb
) from public, anon, authenticated;
grant execute on function public.checkout_create_order(
  uuid, text, text, text, text, text, text, text, bigint, text, jsonb
) to service_role;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.prevent_role_escalation() from public, anon, authenticated;

do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'rls_auto_enable'
  ) then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end
$$;

create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Role changes are not permitted from this client';
  end if;
  return new;
end;
$$;

revoke execute on function public.prevent_role_escalation() from public, anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := 'customer';
begin
  perform pg_advisory_xact_lock(872364011);
  if not exists (select 1 from public.profiles) then
    v_role := 'super_admin';
  end if;
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), v_role);
  return new;
end;
$$;

create or replace function public.release_expired_pending_orders(p_max_age interval default interval '45 minutes')
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
  v_order record;
  v_item record;
begin
  for v_order in
    select o.id
    from public.orders o
    where o.payment_status = 'pending'
      and o.order_status = 'open'
      and o.created_at < now() - p_max_age
    for update skip locked
  loop
    for v_item in
      select variant_id, quantity
      from public.order_items
      where order_id = v_order.id and variant_id is not null
    loop
      update public.product_variants
        set stock = stock + v_item.quantity
        where id = v_item.variant_id;
    end loop;

    update public.orders
      set payment_status = 'failed',
          order_status = 'cancelled',
          fulfillment_status = 'cancelled'
      where id = v_order.id;

    update public.payments
      set status = 'failed'
      where order_id = v_order.id and status = 'pending';

    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

revoke execute on function public.release_expired_pending_orders(interval) from public, anon, authenticated;
grant execute on function public.release_expired_pending_orders(interval) to service_role;

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
  perform public.release_expired_pending_orders();

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
    if v_variant.stock < v_qty then
      raise exception 'Insufficient stock for %', v_variant.sku;
    end if;
    if v_variant.price_minor <> (v_item->>'unit_price_minor')::bigint then
      raise exception 'Price mismatch for %', v_variant.sku;
    end if;
    select * into v_product from public.products where id = v_variant.product_id;
    if v_product.status <> 'published' then
      raise exception 'Product is not available';
    end if;
    update public.product_variants
      set stock = stock - v_qty
      where id = v_variant.id;
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

revoke execute on function public.checkout_create_order(
  uuid, text, text, text, text, text, text, text, bigint, text, jsonb
) from public, anon, authenticated;
grant execute on function public.checkout_create_order(
  uuid, text, text, text, text, text, text, text, bigint, text, jsonb
) to service_role;

create table if not exists public.rate_limits (
  bucket_key text primary key,
  hit_count integer not null default 0,
  reset_at timestamptz not null
);

alter table public.rate_limits enable row level security;

drop policy if exists "addresses_no_client" on public.addresses;
drop policy if exists "carts_no_client" on public.carts;
drop policy if exists "cart_items_no_client" on public.cart_items;
drop policy if exists "contact_messages_no_client" on public.contact_messages;
drop policy if exists "newsletter_no_client" on public.newsletter_subscribers;
drop policy if exists "payments_no_client" on public.payments;
drop policy if exists "waitlist_no_client" on public.restock_waitlist;
create policy "addresses_no_client" on public.addresses for all to anon, authenticated using (false) with check (false);
create policy "carts_no_client" on public.carts for all to anon, authenticated using (false) with check (false);
create policy "cart_items_no_client" on public.cart_items for all to anon, authenticated using (false) with check (false);
create policy "contact_messages_no_client" on public.contact_messages for all to anon, authenticated using (false) with check (false);
create policy "newsletter_no_client" on public.newsletter_subscribers for all to anon, authenticated using (false) with check (false);
create policy "payments_no_client" on public.payments for all to anon, authenticated using (false) with check (false);
create policy "waitlist_no_client" on public.restock_waitlist for all to anon, authenticated using (false) with check (false);
drop policy if exists "rate_limits_no_client" on public.rate_limits;
create policy "rate_limits_no_client" on public.rate_limits for all to anon, authenticated using (false) with check (false);

create or replace function public.restock_cancelled_order(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item record;
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    return;
  end if;
  if v_order.payment_status = 'paid' then
    return;
  end if;
  if v_order.order_status = 'cancelled' then
    return;
  end if;
  for v_item in
    select variant_id, quantity
    from public.order_items
    where order_id = p_order_id and variant_id is not null
  loop
    update public.product_variants
      set stock = stock + v_item.quantity
      where id = v_item.variant_id;
  end loop;
end;
$$;

revoke execute on function public.restock_cancelled_order(uuid) from public, anon, authenticated;
grant execute on function public.restock_cancelled_order(uuid) to service_role;

do $$
declare
  r record;
begin
  for r in select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', r.tablename);
  end loop;
end
$$;
