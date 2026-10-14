update store_settings
set value = to_jsonb('EllzLuxe Fragranz · WhatsApp 0593634512'::text)
where key = 'announcement';

update store_settings
set value = to_jsonb('We deliver across Ghana and offer pickup at Ells Luxe Annex. Delivery is quoted from your region and locality on WhatsApp 0593634512. Pickup is free.'::text)
where key = 'shipping_note';

update store_settings
set value = to_jsonb('Prices are in Ghana cedis. An order is a request to buy. It is not paid until we confirm payment. Delivery, pickup, and fees are on the Shipping page. Ghana law applies. Questions: WhatsApp 0593634512 or ellzluxefragranz@gmail.com.'::text)
where key = 'terms_note';
