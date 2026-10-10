-- Combined apply file for Supabase SQL Editor. Run once on a fresh project.

-- EllzLuxe Fragranz initial schema, RLS, checkout function, and demonstration seed.

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id text primary key,
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table public.collections (
  id text primary key,
  slug text not null unique,
  name text not null,
  description text not null default '',
  image_url text not null default '',
  created_at timestamptz not null default now()
);

create table public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  description text not null,
  brand text not null,
  concentration text,
  category_id text not null references public.categories(id),
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_demonstration boolean not null default true,
  top_notes text[] not null default '{}',
  heart_notes text[] not null default '{}',
  base_notes text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  sku text not null unique,
  label text not null,
  size_ml integer,
  price_minor bigint not null check (price_minor >= 0),
  compare_at_minor bigint check (compare_at_minor is null or compare_at_minor >= 0),
  stock integer not null default 0 check (stock >= 0),
  created_at timestamptz not null default now()
);

create table public.product_images (
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  url text not null,
  alt text not null default '',
  position integer not null default 0
);

create table public.collection_products (
  collection_id text not null references public.collections(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  primary key (collection_id, product_id)
);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cart_items (
  cart_id uuid not null references public.carts(id) on delete cascade,
  variant_id text not null references public.product_variants(id),
  quantity integer not null check (quantity > 0),
  primary key (cart_id, variant_id)
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text not null,
  region text not null,
  locality text not null,
  address_line text not null
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  full_name text not null,
  phone text not null,
  region text not null,
  locality text not null,
  address_line text not null,
  delivery_method text not null,
  notes text,
  currency_code text not null default 'GHS',
  subtotal_minor bigint not null check (subtotal_minor >= 0),
  shipping_minor bigint not null check (shipping_minor >= 0),
  total_minor bigint not null check (total_minor >= 0),
  order_status text not null default 'open' check (order_status in ('open', 'completed', 'cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  fulfillment_status text not null default 'unfulfilled' check (fulfillment_status in ('unfulfilled', 'processing', 'shipped', 'delivered', 'cancelled')),
  tracking_number text,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_name text not null,
  sku text not null,
  variant_label text not null,
  quantity integer not null check (quantity > 0),
  unit_price_minor bigint not null check (unit_price_minor >= 0),
  product_id text,
  variant_id text
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  provider_reference text not null unique,
  amount_minor bigint not null check (amount_minor >= 0),
  currency_code text not null default 'GHS',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  raw_event_id text,
  created_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  email text primary key,
  created_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table public.store_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.faq_items (
  id text primary key,
  question text not null,
  answer text not null,
  requires_owner_review boolean not null default true,
  position integer not null default 0
);

create index orders_user_id_idx on public.orders (user_id);
create index orders_email_idx on public.orders (email);
create index products_status_idx on public.products (status);
create index product_variants_product_id_idx on public.product_variants (product_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), 'customer');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role then
    raise exception 'Role changes are not permitted from this client';
  end if;
  return new;
end;
$$;

create trigger profiles_no_self_admin
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

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

revoke execute on function public.checkout_create_order from anon, authenticated;
grant execute on function public.checkout_create_order to service_role;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.collection_products enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;
alter table public.store_settings enable row level security;
alter table public.faq_items enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "categories_public_read" on public.categories for select using (true);
create policy "collections_public_read" on public.collections for select using (true);
create policy "products_public_read" on public.products for select using (status = 'published');
create policy "variants_public_read" on public.product_variants for select using (
  exists (select 1 from public.products p where p.id = product_id and p.status = 'published')
);
create policy "images_public_read" on public.product_images for select using (
  exists (select 1 from public.products p where p.id = product_id and p.status = 'published')
);
create policy "collection_products_public_read" on public.collection_products for select using (true);
create policy "settings_public_read" on public.store_settings for select using (true);
create policy "faq_public_read" on public.faq_items for select using (true);

create policy "orders_select_own" on public.orders for select using (auth.uid() = user_id);
create policy "order_items_select_own" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);

-- carts, payments, newsletter, contact, addresses: no anon/authenticated policies.
-- Privileged access uses the service role, which bypasses RLS.

insert into public.categories (id, slug, name) values
  ('cat-eau-de-parfum', 'eau-de-parfum', 'Eau de Parfum'),
  ('cat-discovery', 'discovery-and-gifts', 'Discovery and gifts');

insert into public.collections (id, slug, name, description, image_url) values
  ('col-women', 'womens-fragrances', 'Women''s fragrances', 'Compositions with floral, citrus, and luminous warmth.', '/images/products/floral.jpg'),
  ('col-men', 'mens-fragrances', 'Men''s fragrances', 'Wood, amber, and resin with a quiet, tailored presence.', '/images/products/woody.jpg'),
  ('col-unisex', 'unisex-fragrances', 'Unisex fragrances', 'Shared scents composed without a gendered brief.', '/images/products/musk.jpg'),
  ('col-oud', 'oud-and-oriental', 'Oud and oriental', 'Resinous, spiced compositions with depth and smoke.', '/images/products/oud.jpg'),
  ('col-fresh', 'fresh-and-citrus', 'Fresh and citrus', 'Bright openings of citrus peel, air, and clean musk.', '/images/products/citrus.jpg'),
  ('col-floral', 'floral', 'Floral', 'Petal, green stem, and white-flower accords.', '/images/products/floral.jpg'),
  ('col-woody', 'woody-and-amber', 'Woody and amber', 'Cedar, amber, and softly smoked woods.', '/images/products/amber.jpg'),
  ('col-gifts', 'gift-and-discovery-sets', 'Gift and discovery sets', 'Smaller formats for sampling and gifting.', '/images/products/gift.jpg');

insert into public.store_settings (key, value) values
  ('announcement', '"Demonstration catalog — prices shown in Ghana cedis. Policies are placeholders pending owner review."'),
  ('contact_email', '"hello@example.com"'),
  ('contact_phone', '"+233 00 000 0000"'),
  ('instagram_url', '"https://instagram.com/"'),
  ('currency_code', '"GHS"'),
  ('shipping_note', '"Shipping and delivery terms are placeholders. The business owner must publish confirmed Ghana delivery options before launch."'),
  ('returns_note', '"Returns and refunds are not yet defined. Do not treat this page as an operational policy until the owner approves the final text."'),
  ('privacy_note', '"This privacy page is a structural placeholder. Replace it with counsel-reviewed language before collecting customer data in production."'),
  ('terms_note', '"These terms are a structural placeholder and are not a binding commercial contract."'),
  ('about_story', '"EllzLuxe Fragranz is a Ghana-based fragrance house in formation. This story will be replaced with owner-approved copy."'),
  ('delivery_methods', '[{"id":"accra","label":"Greater Accra delivery","amountMinor":3000,"description":"Placeholder Accra rate."},{"id":"national","label":"Rest of Ghana","amountMinor":5000,"description":"Placeholder nationwide rate."},{"id":"pickup","label":"Scheduled pickup","amountMinor":0,"description":"Placeholder pickup option."}]');

-- ===== 0002_seed_catalog.sql =====
-- Demonstration catalog only. Do not present these as live commercial juices.

insert into public.products (
  id, slug, name, description, brand, concentration, category_id, featured, status, is_demonstration,
  top_notes, heart_notes, base_notes, created_at
) values
('prd-citrus-veil', 'citrus-veil', 'Citrus Veil',
 'A demonstration citrus composition: bitter orange peel, a cool green facet, and a dry musk finish.',
 'EllzLuxe Fragranz', 'Eau de Parfum', 'cat-eau-de-parfum', true, 'published', true,
 array['Bitter orange','bergamot','petitgrain'], array['Neroli','green tea'], array['White musk','pale woods'],
 '2026-01-12T10:00:00Z'),
('prd-night-oud', 'night-oud', 'Night Oud',
 'A demonstration oud-leaning scent with incense, dried rose, and smoked woods.',
 'EllzLuxe Fragranz', 'Eau de Parfum', 'cat-eau-de-parfum', true, 'published', true,
 array['Pink pepper','saffron'], array['Rose','incense'], array['Oud accord','patchouli','amber'],
 '2026-02-03T10:00:00Z'),
('prd-amber-atelier', 'amber-atelier', 'Amber Atelier',
 'A demonstration amber-wood fragrance: labdanum, cedar, and a quiet vanilla warmth.',
 'EllzLuxe Fragranz', 'Eau de Parfum', 'cat-eau-de-parfum', true, 'published', true,
 array['Cardamom','bergamot'], array['Cistus','cedar'], array['Amber','vanilla','leather accord'],
 '2026-02-20T10:00:00Z'),
('prd-white-petal', 'white-petal', 'White Petal',
 'A demonstration white-floral built around jasmine, tuberose, and a soapy musk.',
 'EllzLuxe Fragranz', 'Eau de Parfum', 'cat-eau-de-parfum', true, 'published', true,
 array['Pear','green leaf'], array['Jasmine','tuberose'], array['Sandalwood','musk'],
 '2026-03-08T10:00:00Z'),
('prd-sea-linen', 'sea-linen', 'Sea Linen',
 'A demonstration marine-linen accord: salt air, crushed herbs, and clean cotton musk.',
 'EllzLuxe Fragranz', 'Eau de Parfum', 'cat-eau-de-parfum', false, 'published', true,
 array['Lemon','sea accord'], array['Mate','rosemary'], array['Driftwood','musk'],
 '2026-03-22T10:00:00Z'),
('prd-velvet-ember', 'velvet-ember', 'Velvet Ember',
 'A demonstration smoky-wood scent with guaiac, vetiver, and a dry ember accord.',
 'EllzLuxe Fragranz', 'Eau de Parfum', 'cat-eau-de-parfum', false, 'published', true,
 array['Black pepper','bergamot'], array['Guaiac','iris'], array['Vetiver','smoked woods'],
 '2026-04-02T10:00:00Z'),
('prd-garden-quiet', 'garden-quiet', 'Garden Quiet',
 'A demonstration green-floral: crushed stems, peony, and a cool earthy base.',
 'EllzLuxe Fragranz', 'Eau de Parfum', 'cat-eau-de-parfum', false, 'published', true,
 array['Dewy greens','mandarin'], array['Peony','rose'], array['Moss','cedar'],
 '2026-04-18T10:00:00Z'),
('prd-smoke-cedar', 'smoke-cedar', 'Smoke Cedar',
 'A demonstration cedar composition with incense smoke and dry spices.',
 'EllzLuxe Fragranz', 'Eau de Parfum', 'cat-eau-de-parfum', true, 'published', true,
 array['Elemi','nutmeg'], array['Cedar','incense'], array['Oakmoss accord','amber'],
 '2026-05-01T10:00:00Z'),
('prd-gold-resin', 'gold-resin', 'Gold Resin',
 'A demonstration resinous oriental with benzoin, myrrh, and a honeyed warmth.',
 'EllzLuxe Fragranz', 'Eau de Parfum', 'cat-eau-de-parfum', false, 'published', true,
 array['Orange','cinnamon'], array['Myrrh','rose'], array['Benzoin','tonka','labdanum'],
 '2026-05-19T10:00:00Z'),
('prd-linen-musk', 'linen-musk', 'Linen Musk',
 'A demonstration skin-musk with iris powder and airy aldehydes.',
 'EllzLuxe Fragranz', 'Eau de Parfum', 'cat-eau-de-parfum', false, 'published', true,
 array['Aldehydes','bergamot'], array['Iris','heliotrope'], array['White musk','sandalwood'],
 '2026-06-04T10:00:00Z'),
('prd-orchid-smoke', 'orchid-smoke', 'Orchid Smoke',
 'A demonstration floral-oriental: orchid accord, incense, and a soft vanilla trail.',
 'EllzLuxe Fragranz', 'Eau de Parfum', 'cat-eau-de-parfum', false, 'published', true,
 array['Pink pepper','plum'], array['Orchid','incense'], array['Vanilla','benzoin'],
 '2026-06-21T10:00:00Z'),
('prd-discovery-set', 'atelier-discovery-set', 'Atelier Discovery Set',
 'A demonstration discovery set of 8 × 2 ml vials drawn from this sample catalog.',
 'EllzLuxe Fragranz', null, 'cat-discovery', true, 'published', true,
 array['Citrus','florals'], array['Woods','resins'], array['Musks','amber'],
 '2026-07-01T10:00:00Z');

insert into public.product_variants (id, product_id, sku, label, size_ml, price_minor, compare_at_minor, stock) values
('var-citrus-50', 'prd-citrus-veil', 'ELF-CV-50', '50 ml', 50, 42000, null, 18),
('var-citrus-100', 'prd-citrus-veil', 'ELF-CV-100', '100 ml', 100, 68000, 74000, 9),
('var-oud-50', 'prd-night-oud', 'ELF-NO-50', '50 ml', 50, 78000, null, 7),
('var-oud-100', 'prd-night-oud', 'ELF-NO-100', '100 ml', 100, 118000, null, 4),
('var-amber-50', 'prd-amber-atelier', 'ELF-AA-50', '50 ml', 50, 56000, null, 12),
('var-amber-100', 'prd-amber-atelier', 'ELF-AA-100', '100 ml', 100, 89000, null, 6),
('var-petal-50', 'prd-white-petal', 'ELF-WP-50', '50 ml', 50, 48000, null, 14),
('var-sea-50', 'prd-sea-linen', 'ELF-SL-50', '50 ml', 50, 39000, null, 20),
('var-sea-100', 'prd-sea-linen', 'ELF-SL-100', '100 ml', 100, 62000, null, 11),
('var-ember-50', 'prd-velvet-ember', 'ELF-VE-50', '50 ml', 50, 54000, null, 10),
('var-garden-50', 'prd-garden-quiet', 'ELF-GQ-50', '50 ml', 50, 45000, null, 16),
('var-cedar-50', 'prd-smoke-cedar', 'ELF-SC-50', '50 ml', 50, 51000, null, 8),
('var-cedar-100', 'prd-smoke-cedar', 'ELF-SC-100', '100 ml', 100, 82000, null, 5),
('var-resin-50', 'prd-gold-resin', 'ELF-GR-50', '50 ml', 50, 72000, null, 6),
('var-linen-50', 'prd-linen-musk', 'ELF-LM-50', '50 ml', 50, 43000, null, 22),
('var-orchid-50', 'prd-orchid-smoke', 'ELF-OS-50', '50 ml', 50, 64000, null, 9),
('var-set-8', 'prd-discovery-set', 'ELF-DS-8', '8 × 2 ml', 16, 28000, null, 30);

insert into public.product_images (id, product_id, url, alt, position) values
('img-citrus', 'prd-citrus-veil', '/images/products/citrus.jpg', 'Citrus Veil demonstration bottle', 0),
('img-oud', 'prd-night-oud', '/images/products/oud.jpg', 'Night Oud demonstration bottle', 0),
('img-amber', 'prd-amber-atelier', '/images/products/amber.jpg', 'Amber Atelier demonstration bottle', 0),
('img-floral', 'prd-white-petal', '/images/products/floral.jpg', 'White Petal demonstration bottle', 0),
('img-fresh', 'prd-sea-linen', '/images/products/fresh.jpg', 'Sea Linen demonstration bottle', 0),
('img-woody', 'prd-velvet-ember', '/images/products/woody.jpg', 'Velvet Ember demonstration bottle', 0),
('img-garden', 'prd-garden-quiet', '/images/products/floral.jpg', 'Garden Quiet demonstration bottle', 0),
('img-cedar', 'prd-smoke-cedar', '/images/products/woody.jpg', 'Smoke Cedar demonstration bottle', 0),
('img-resin', 'prd-gold-resin', '/images/products/resin.jpg', 'Gold Resin demonstration bottle', 0),
('img-linen', 'prd-linen-musk', '/images/products/linen.jpg', 'Linen Musk demonstration bottle', 0),
('img-orchid', 'prd-orchid-smoke', '/images/products/orchid.jpg', 'Orchid Smoke demonstration bottle', 0),
('img-gift', 'prd-discovery-set', '/images/products/gift.jpg', 'Atelier Discovery Set demonstration packaging', 0);

insert into public.collection_products (collection_id, product_id) values
('col-women', 'prd-citrus-veil'), ('col-fresh', 'prd-citrus-veil'),
('col-unisex', 'prd-night-oud'), ('col-oud', 'prd-night-oud'),
('col-men', 'prd-amber-atelier'), ('col-woody', 'prd-amber-atelier'),
('col-women', 'prd-white-petal'), ('col-floral', 'prd-white-petal'),
('col-unisex', 'prd-sea-linen'), ('col-fresh', 'prd-sea-linen'),
('col-men', 'prd-velvet-ember'), ('col-woody', 'prd-velvet-ember'),
('col-women', 'prd-garden-quiet'), ('col-floral', 'prd-garden-quiet'),
('col-men', 'prd-smoke-cedar'), ('col-woody', 'prd-smoke-cedar'),
('col-unisex', 'prd-gold-resin'), ('col-oud', 'prd-gold-resin'),
('col-unisex', 'prd-linen-musk'), ('col-fresh', 'prd-linen-musk'),
('col-women', 'prd-orchid-smoke'), ('col-floral', 'prd-orchid-smoke'), ('col-oud', 'prd-orchid-smoke'),
('col-gifts', 'prd-discovery-set');

insert into public.faq_items (id, question, answer, requires_owner_review, position) values
('faq-order', 'How do I place an order?', 'Add a fragrance to your cart, proceed to checkout, and complete delivery details. Payment is processed by Paystack when those credentials are configured.', false, 1),
('faq-delivery', 'Where do you deliver?', 'The storefront is built for Ghana-first delivery. Exact service areas must be confirmed by the business before launch.', true, 2),
('faq-payment', 'Which payment methods are accepted?', 'The intended processor is Paystack. The store never stores card numbers.', false, 3),
('faq-select', 'How should I choose a fragrance?', 'Use collections by family, then read the listed notes. Notes in this catalog describe demonstration formulas.', false, 4),
('faq-returns', 'What is the returns policy?', 'A returns policy has not been approved yet.', true, 5);

-- ===== 0003_storage.sql =====
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "public_read_product_images" on storage.objects;
create policy "public_read_product_images"
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "no_public_uploads" on storage.objects;
-- Uploads are performed with the service role from the server.
create policy "no_public_uploads"
on storage.objects for insert
with check (false);

-- ===== 0006_house_brands.sql =====
update public.products set brand = 'Amaran' where id = 'prd-citrus-veil';
update public.products set brand = 'Armaf' where id = 'prd-night-oud';
update public.products set brand = 'Fragrance World' where id = 'prd-amber-atelier';
update public.products set brand = 'Giorgio Armani' where id = 'prd-white-petal';
update public.products set brand = 'Khadlaj' where id = 'prd-sea-linen';
update public.products set brand = 'L''affair' where id = 'prd-velvet-ember';
update public.products set brand = 'Lattafa' where id in ('prd-garden-quiet', 'prd-orchid-smoke');
update public.products set brand = 'Maison Alhambra' where id = 'prd-smoke-cedar';
update public.products set brand = 'Parfum De Mirage' where id = 'prd-gold-resin';
update public.products set brand = 'Versace' where id = 'prd-linen-musk';

-- ===== 0007_store_contact.sql =====
insert into public.store_settings (key, value) values
  ('announcement', '"Ells Luxe Annex · Call or WhatsApp 0593634512"'),
  ('contact_email', '""'),
  ('contact_phone', '"0593634512"'),
  ('location', '"Ells Luxe Annex"'),
  ('instagram_url', '"https://www.instagram.com/ellzLuxe_fragranz.gh/"'),
  ('tiktok_url', '"https://www.tiktok.com/@ellzluxefragranz.gh"'),
  ('snapchat_handle', '"ama_candy90"'),
  ('momo_number', '"0593634512"'),
  ('momo_merchant_id', '"949805"'),
  ('bank_name', '"Fidelity Bank"'),
  ('bank_account', '"2400454612819"'),
  ('shipping_note', '"Delivery is available across Ghana. Pickup is at Ells Luxe Annex. Call or WhatsApp 0593634512 to confirm timing and rates for your area."'),
  ('about_story', '"EllzLuxe Fragranz is a Ghana-based fragrance boutique at Ells Luxe Annex. We carry houses including Lattafa, Armaf, Maison Alhambra, and others listed on the Brands page."'),
  ('delivery_methods', '[{"id":"accra","label":"Greater Accra delivery","amountMinor":3000,"description":"Delivery within Greater Accra. Confirm timing on WhatsApp 0593634512."},{"id":"national","label":"Rest of Ghana","amountMinor":5000,"description":"Nationwide dispatch. Confirm carrier and timeline on WhatsApp 0593634512."},{"id":"pickup","label":"Pickup at Ells Luxe Annex","amountMinor":0,"description":"Collect your order at Ells Luxe Annex. Message 0593634512 to schedule."}]')
on conflict (key) do update
set value = excluded.value, updated_at = now();

update public.faq_items
set answer = 'Add a fragrance to your cart, proceed to checkout, and complete delivery details. Confirm payment on WhatsApp 0593634512.',
    requires_owner_review = false
where id = 'faq-order';

update public.faq_items
set answer = 'We deliver across Ghana and offer pickup at Ells Luxe Annex. Message 0593634512 to confirm timing for your area.',
    requires_owner_review = false
where id = 'faq-delivery';

update public.faq_items
set answer = 'Message the house on WhatsApp 0593634512 after you place an order to confirm how to pay.',
    requires_owner_review = false
where id = 'faq-payment';
