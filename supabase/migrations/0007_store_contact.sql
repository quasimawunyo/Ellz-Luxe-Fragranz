-- Publish the boutique's live contact, social, and payment details.

insert into public.store_settings (key, value) values
  ('announcement', '"Ellz Luxe Annex · Call or WhatsApp 0593634512"'),
  ('contact_email', '""'),
  ('contact_phone', '"0593634512"'),
  ('location', '"Ellz Luxe Annex"'),
  ('instagram_url', '"https://www.instagram.com/ellzLuxe_fragranz.gh/"'),
  ('tiktok_url', '"https://www.tiktok.com/@ellzluxefragranz.gh"'),
  ('snapchat_handle', '"ama_candy90"'),
  ('momo_number', '"0593634512"'),
  ('momo_merchant_id', '"949805"'),
  ('bank_name', '"Fidelity Bank"'),
  ('bank_account', '"2400454612819"'),
  ('shipping_note', '"Delivery is available across Ghana. Pickup is at Ellz Luxe Annex. Call or WhatsApp 0593634512 to confirm timing and rates for your area."'),
  ('about_story', '"EllzLuxe Fragranz is a Ghana-based fragrance boutique at Ellz Luxe Annex. We carry houses including Lattafa, Armaf, Maison Alhambra, and others listed on the Brands page."'),
  ('delivery_methods', '[{"id":"accra","label":"Greater Accra delivery","amountMinor":3000,"description":"Delivery within Greater Accra. Confirm timing on WhatsApp 0593634512."},{"id":"national","label":"Rest of Ghana","amountMinor":5000,"description":"Nationwide dispatch. Confirm carrier and timeline on WhatsApp 0593634512."},{"id":"pickup","label":"Pickup at Ellz Luxe Annex","amountMinor":0,"description":"Collect your order at Ellz Luxe Annex. Message 0593634512 to schedule."}]')
on conflict (key) do update
set value = excluded.value, updated_at = now();

update public.faq_items
set answer = 'Add a fragrance to your cart, proceed to checkout, and complete delivery details. Pay by MTN MoMo (0593634512, merchant ID 949805) or Fidelity Bank 2400454612819, then send the receipt on WhatsApp.',
    requires_owner_review = false
where id = 'faq-order';

update public.faq_items
set answer = 'We deliver across Ghana and offer pickup at Ellz Luxe Annex. Message 0593634512 to confirm timing for your area.',
    requires_owner_review = false
where id = 'faq-delivery';

update public.faq_items
set answer = 'Pay with MTN Mobile Money on 0593634512 (merchant ID 949805) or transfer to Fidelity Bank account 2400454612819. Use your name as the reference and send the receipt on WhatsApp.',
    requires_owner_review = false
where id = 'faq-payment';
