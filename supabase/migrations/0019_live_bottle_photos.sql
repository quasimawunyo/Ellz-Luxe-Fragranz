-- Replace demonstration juices with photographed house bottles.

update public.collections set image_url = '/images/products/yara.jpg' where id = 'col-women';
update public.collections set image_url = '/images/products/club-de-nuit.jpg' where id = 'col-men';
update public.collections set image_url = '/images/products/extremely-unique.jpg' where id = 'col-unisex';
update public.collections set image_url = '/images/products/oud-noir.jpg' where id = 'col-oud';
update public.collections set image_url = '/images/products/island-sun.jpg' where id = 'col-fresh';
update public.collections set image_url = '/images/products/kaly-vardy.jpg' where id = 'col-floral';
update public.collections set image_url = '/images/products/night-club.jpg' where id = 'col-woody';
update public.collections set image_url = '/images/products/aventos-blue.jpg' where id = 'col-gifts';

update public.products set
  slug = 'silverado-21', name = 'Silverado 21', brand = 'Amaran',
  description = 'Amaran Silverado 21 eau de parfum, 100 ml. Photographed from the house bottle.',
  is_demonstration = false, featured = true, new_arrival = false,
  top_notes = array[]::text[], heart_notes = array[]::text[], base_notes = array[]::text[]
where id = 'prd-citrus-veil';

update public.products set
  slug = 'club-de-nuit-intense-man', name = 'Club de Nuit Intense Man', brand = 'Armaf',
  description = 'Armaf Club de Nuit Intense Man eau de parfum. Notes on the house image: apple, bergamot, blackcurrant, pineapple, and lemon; rose, birch, and jasmine; musk, ambergris, patchouli, and vanilla.',
  is_demonstration = false, featured = true, new_arrival = false,
  top_notes = array['Apple','bergamot','blackcurrant','pineapple','lemon'],
  heart_notes = array['Rose','birch','jasmine'],
  base_notes = array['Musk','ambergris','patchouli','vanilla']
where id = 'prd-night-oud';

update public.products set
  slug = 'aventos-blue-for-him', name = 'Aventos Blue For Him', brand = 'Fragrance World',
  description = 'Fragrance World Aventos Blue For Him eau de parfum. Photographed from the house bottle and matching spray.',
  is_demonstration = false, featured = true, new_arrival = false,
  top_notes = array[]::text[], heart_notes = array[]::text[], base_notes = array[]::text[]
where id = 'prd-amber-atelier';

update public.products set
  slug = 'yara', name = 'Yara', brand = 'Lattafa',
  description = 'Lattafa Yara eau de parfum. Photographed from the house bottle.',
  is_demonstration = false, featured = true, new_arrival = true,
  top_notes = array[]::text[], heart_notes = array[]::text[], base_notes = array[]::text[]
where id = 'prd-white-petal';

update public.products set
  slug = 'island-sun', name = 'Island Sun', brand = 'Khadlaj',
  description = 'Khadlaj Island Sun. Photographed from the house bottle.',
  is_demonstration = false, featured = false, new_arrival = true,
  top_notes = array[]::text[], heart_notes = array[]::text[], base_notes = array[]::text[]
where id = 'prd-sea-linen';

update public.products set
  slug = 'pure-spirit', name = 'Pure Spirit', brand = 'L''affair',
  description = 'L''affair Pure Spirit eau de parfum. Photographed from the house bottle.',
  is_demonstration = false, featured = false, new_arrival = false,
  top_notes = array[]::text[], heart_notes = array[]::text[], base_notes = array[]::text[]
where id = 'prd-velvet-ember';

update public.products set
  slug = 'fire-on-ice', name = 'Fire on Ice', brand = 'Lattafa',
  description = 'Lattafa Fire on Ice eau de parfum. Photographed from the house bottle.',
  is_demonstration = false, featured = false, new_arrival = true,
  top_notes = array[]::text[], heart_notes = array[]::text[], base_notes = array[]::text[]
where id = 'prd-garden-quiet';

update public.products set
  slug = 'night-club', name = 'Night Club', brand = 'Fragrance World',
  description = 'Fragrance World Night Club eau de parfum, 100 ml. Photographed from the house bottle.',
  is_demonstration = false, featured = false, new_arrival = false,
  top_notes = array[]::text[], heart_notes = array[]::text[], base_notes = array[]::text[]
where id = 'prd-smoke-cedar';

update public.products set
  slug = 'oud-noir', name = 'Oud Noir', brand = 'Khadlaj',
  description = 'Khadlaj Oud Noir eau de parfum. Photographed from the house bottle.',
  is_demonstration = false, featured = false, new_arrival = false,
  top_notes = array[]::text[], heart_notes = array[]::text[], base_notes = array[]::text[]
where id = 'prd-gold-resin';

update public.products set
  slug = 'proud-of-you', name = 'Proud of You', brand = 'Fragrance World',
  description = 'Fragrance World Proud of You parfum. Photographed from the house bottle.',
  is_demonstration = false, featured = false, new_arrival = false,
  top_notes = array[]::text[], heart_notes = array[]::text[], base_notes = array[]::text[]
where id = 'prd-linen-musk';

update public.products set
  slug = 'extremely-unique', name = 'Extremely Unique', brand = 'Fragrance World',
  description = 'Fragrance World Extremely Unique eau de parfum, also shown as Oudyssia. Photographed from the house bottle.',
  is_demonstration = false, featured = true, new_arrival = false,
  top_notes = array[]::text[], heart_notes = array[]::text[], base_notes = array[]::text[]
where id = 'prd-orchid-smoke';

update public.products set
  slug = 'hawas-black', name = 'Hawas Black', brand = 'Rasasi',
  description = 'Rasasi Hawas Black for him eau de parfum, 100 ml. Photographed from the house bottle.',
  concentration = 'Eau de Parfum', category_id = 'cat-eau-de-parfum',
  is_demonstration = false, featured = true, new_arrival = false,
  top_notes = array[]::text[], heart_notes = array[]::text[], base_notes = array[]::text[]
where id = 'prd-discovery-set';

update public.product_images set url = '/images/products/silverado-21.jpg', alt = 'Amaran Silverado 21 eau de parfum' where id = 'img-citrus';
update public.product_images set url = '/images/products/club-de-nuit.jpg', alt = 'Armaf Club de Nuit Intense Man' where id = 'img-oud';
update public.product_images set url = '/images/products/aventos-blue.jpg', alt = 'Fragrance World Aventos Blue For Him' where id = 'img-amber';
update public.product_images set url = '/images/products/yara.jpg', alt = 'Lattafa Yara eau de parfum' where product_id = 'prd-white-petal';
update public.product_images set url = '/images/products/island-sun.jpg', alt = 'Khadlaj Island Sun' where product_id = 'prd-sea-linen';
update public.product_images set url = '/images/products/pure-spirit.jpg', alt = 'L''affair Pure Spirit eau de parfum' where product_id = 'prd-velvet-ember';
update public.product_images set url = '/images/products/fire-on-ice.jpg', alt = 'Lattafa Fire on Ice eau de parfum' where id = 'img-garden';
update public.product_images set url = '/images/products/night-club.jpg', alt = 'Fragrance World Night Club eau de parfum' where id = 'img-cedar';
update public.product_images set url = '/images/products/oud-noir.jpg', alt = 'Khadlaj Oud Noir eau de parfum' where id = 'img-resin';
update public.product_images set url = '/images/products/proud-of-you.jpg', alt = 'Fragrance World Proud of You parfum' where id = 'img-linen';
update public.product_images set url = '/images/products/extremely-unique.jpg', alt = 'Fragrance World Extremely Unique eau de parfum' where id = 'img-orchid';
update public.product_images set url = '/images/products/hawas-black.jpg', alt = 'Rasasi Hawas Black for him' where id = 'img-gift';

update public.product_variants set compare_at_minor = null where compare_at_minor is not null;
update public.product_variants set label = '100 ml', size_ml = 100, price_minor = 98000, stock = 10 where id = 'var-set-8';

insert into public.products (
  id, slug, name, description, brand, concentration, category_id, featured, status, is_demonstration, new_arrival,
  top_notes, heart_notes, base_notes, created_at
) values
('prd-kaly-vardy', 'kaly-vardy', 'Kaly Vardy',
 'Kaly Vardy eau de parfum, 50 ml. Photographed from the house bottle.',
 'Kaly', 'Eau de Parfum', 'cat-eau-de-parfum', false, 'published', false, false,
 array[]::text[], array[]::text[], array[]::text[], '2026-08-02T10:00:00Z'),
('prd-intenso', 'intenso', 'Intenso',
 'Dolce & Gabbana Intenso pour homme eau de parfum. Photographed from the house bottle.',
 'Dolce & Gabbana', 'Eau de Parfum', 'cat-eau-de-parfum', false, 'published', false, false,
 array[]::text[], array[]::text[], array[]::text[], '2026-08-08T10:00:00Z'),
('prd-sehr-al-oud', 'sehr-al-oud', 'Sehr Al Oud',
 'Jean Antoine Sehr Al Oud. Photographed from the house bottle.',
 'Jean Antoine', 'Eau de Parfum', 'cat-eau-de-parfum', false, 'published', false, false,
 array[]::text[], array[]::text[], array[]::text[], '2026-08-14T10:00:00Z'),
('prd-badee-al-oud', 'badee-al-oud-sublime', 'Bade''e Al Oud Sublime',
 'Lattafa Bade''e Al Oud Sublime eau de parfum. Photographed from the house bottle.',
 'Lattafa', 'Eau de Parfum', 'cat-eau-de-parfum', false, 'published', false, true,
 array[]::text[], array[]::text[], array[]::text[], '2026-08-20T10:00:00Z')
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  brand = excluded.brand,
  is_demonstration = excluded.is_demonstration,
  new_arrival = excluded.new_arrival;

insert into public.product_variants (id, product_id, sku, label, size_ml, price_minor, compare_at_minor, stock) values
('var-kaly-50', 'prd-kaly-vardy', 'ELF-KV-50', '50 ml', 50, 48000, null, 12),
('var-intenso-125', 'prd-intenso', 'ELF-DI-125', '125 ml', 125, 148000, null, 4),
('var-sehr-100', 'prd-sehr-al-oud', 'ELF-SAO-100', '100 ml', 100, 86000, null, 6),
('var-badee-100', 'prd-badee-al-oud', 'ELF-BAO-100', '100 ml', 100, 72000, null, 8)
on conflict (id) do nothing;

insert into public.product_images (id, product_id, url, alt, position) values
('img-kaly', 'prd-kaly-vardy', '/images/products/kaly-vardy.jpg', 'Kaly Vardy eau de parfum', 0),
('img-intenso', 'prd-intenso', '/images/products/intenso.jpg', 'Dolce & Gabbana Intenso pour homme', 0),
('img-sehr', 'prd-sehr-al-oud', '/images/products/sehr-al-oud.jpg', 'Jean Antoine Sehr Al Oud', 0),
('img-badee', 'prd-badee-al-oud', '/images/products/badee-al-oud.jpg', 'Lattafa Bade''e Al Oud Sublime', 0)
on conflict (id) do update set url = excluded.url, alt = excluded.alt;

delete from public.collection_products;
insert into public.collection_products (collection_id, product_id) values
('col-unisex', 'prd-citrus-veil'), ('col-woody', 'prd-citrus-veil'),
('col-men', 'prd-night-oud'), ('col-woody', 'prd-night-oud'),
('col-men', 'prd-amber-atelier'), ('col-woody', 'prd-amber-atelier'), ('col-gifts', 'prd-amber-atelier'),
('col-women', 'prd-white-petal'), ('col-floral', 'prd-white-petal'),
('col-unisex', 'prd-sea-linen'), ('col-fresh', 'prd-sea-linen'),
('col-unisex', 'prd-velvet-ember'), ('col-woody', 'prd-velvet-ember'),
('col-unisex', 'prd-garden-quiet'), ('col-fresh', 'prd-garden-quiet'),
('col-men', 'prd-smoke-cedar'), ('col-woody', 'prd-smoke-cedar'),
('col-unisex', 'prd-gold-resin'), ('col-oud', 'prd-gold-resin'),
('col-women', 'prd-linen-musk'), ('col-floral', 'prd-linen-musk'),
('col-unisex', 'prd-orchid-smoke'), ('col-fresh', 'prd-orchid-smoke'),
('col-men', 'prd-discovery-set'), ('col-woody', 'prd-discovery-set'),
('col-women', 'prd-kaly-vardy'), ('col-floral', 'prd-kaly-vardy'),
('col-men', 'prd-intenso'), ('col-woody', 'prd-intenso'),
('col-unisex', 'prd-sehr-al-oud'), ('col-oud', 'prd-sehr-al-oud'),
('col-unisex', 'prd-badee-al-oud'), ('col-oud', 'prd-badee-al-oud');
