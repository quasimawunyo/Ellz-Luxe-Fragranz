update public.store_settings
set value = to_jsonb('Ells Luxe Annex · WhatsApp 0593634512 · Confirm the bottle before you pay'::text)
where key = 'announcement';

update public.store_settings
set value = to_jsonb('ellzluxefragranz@gmail.com'::text)
where key = 'contact_email';

update public.store_settings
set value = to_jsonb(
  'Message WhatsApp 0593634512 before returning anything. We replace or make right a bottle we sent in error or that arrived damaged. Opened fragrance is not refunded except for a packing or sending error on our side. Pickup and delivery disputes are handled from Ells Luxe Annex.'::text
)
where key = 'returns_note';

update public.store_settings
set value = to_jsonb(
  'EllzLuxe Fragranz at Ells Luxe Annex uses your name, email, phone, delivery area, and order contents to fulfill orders, answer messages, and send restock or email updates you asked for. Payment confirmation is by WhatsApp, or by Moolre when card checkout is on. We do not sell your details. Email ellzluxefragranz@gmail.com or WhatsApp 0593634512 to ask what we hold.'::text
)
where key = 'privacy_note';

update public.store_settings
set value = to_jsonb(
  'Prices are in Ghana cedis. An order is a request to buy. It is not paid until we confirm payment. Delivery, pickup, and fees are on the Shipping page. Testers are marked Tester. Ghana law applies. Questions: WhatsApp 0593634512 or ellzluxefragranz@gmail.com.'::text
)
where key = 'terms_note';

update public.faq_items
set
  answer = 'Read the notes on each bottle. Collections group citrus, floral, woody, and oud. WhatsApp 0593634512 if you want help choosing at the annex.',
  requires_owner_review = false
where id = 'faq-select';

update public.faq_items
set
  answer = 'Message WhatsApp 0593634512 before returning anything. Wrong or damaged bottles from us will be made right. Opened fragrance is not refunded except for a packing error on our side.',
  requires_owner_review = false
where id = 'faq-returns';
