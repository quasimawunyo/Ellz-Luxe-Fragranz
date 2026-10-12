update public.store_settings
set value = to_jsonb('Ells Luxe Annex, Pantang, Ghana'::text)
where key = 'location';

update public.store_settings
set value = to_jsonb(
  'EllzLuxe Fragranz is a Ghana-based fragrance boutique at Ells Luxe Annex, Pantang. We carry houses including Lattafa, Armaf, Maison Alhambra, and others listed on the Brands page.'::text
)
where key = 'about_story';
