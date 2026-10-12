update store_settings
set value = to_jsonb('Ells Luxe Annex, Pantang'::text)
where key = 'location';
