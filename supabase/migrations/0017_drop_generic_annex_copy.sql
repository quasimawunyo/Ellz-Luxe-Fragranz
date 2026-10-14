update store_settings
set value = to_jsonb('EllzLuxe Fragranz · WhatsApp 0593634512 · Confirm the bottle before you pay'::text)
where key = 'announcement';

update faq_items
set answer = 'Read the notes on each bottle. Collections group citrus, floral, woody, and oud. WhatsApp 0593634512 if you want help choosing a bottle.'
where id = 'faq-select';
