-- Rename the pickup location to Ells Luxe Annex.

update public.store_settings
set value = replace(value::text, 'Ellz Luxe Annex', 'Ells Luxe Annex')::jsonb,
    updated_at = now()
where value::text like '%Ellz Luxe Annex%';

update public.faq_items
set answer = replace(answer, 'Ellz Luxe Annex', 'Ells Luxe Annex')
where answer like '%Ellz Luxe Annex%';
