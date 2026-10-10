-- Tag demonstration products with the houses the boutique carries.

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
