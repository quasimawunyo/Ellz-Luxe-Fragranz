update public.store_settings
set value = '[
  {"id":"accra","label":"Greater Accra delivery","amountMinor":0,"description":"Fee depends on your locality in Greater Accra. Quoted on WhatsApp after you order."},
  {"id":"national","label":"Rest of Ghana","amountMinor":0,"description":"Fee depends on your town. Quoted on WhatsApp after you order."},
  {"id":"pickup","label":"Pickup at Ells Luxe Annex","amountMinor":0,"description":"Collect your order at Ells Luxe Annex. Message 0593634512 to schedule."}
]'::jsonb
where key = 'delivery_methods';

update public.store_settings
set value = to_jsonb(
  'We deliver across Ghana and offer pickup at Ells Luxe Annex. Delivery is quoted from your region and locality on WhatsApp 0593634512. It is not a fixed checkout price. Pickup is free.'::text
)
where key = 'shipping_note';

update public.faq_items
set answer = 'We deliver across Ghana and offer pickup at Ells Luxe Annex. Delivery is quoted from your location on WhatsApp 0593634512.'
where id = 'faq-delivery';
