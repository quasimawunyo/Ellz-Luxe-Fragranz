-- Rename the house from "Ellz Luxe Fragranz" to "EllzLuxe Fragranz".

update public.products
set brand = 'EllzLuxe Fragranz'
where brand = 'Ellz Luxe Fragranz';

update public.products
set description = replace(description, 'Ellz Luxe Fragranz', 'EllzLuxe Fragranz')
where description like '%Ellz Luxe Fragranz%';

update public.store_settings
set value = to_jsonb(replace(value #>> '{}', 'Ellz Luxe Fragranz', 'EllzLuxe Fragranz'))
where (value #>> '{}') like '%Ellz Luxe Fragranz%';
