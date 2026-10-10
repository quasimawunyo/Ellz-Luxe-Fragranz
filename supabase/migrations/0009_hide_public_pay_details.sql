-- Stop publishing MoMo and bank account numbers in public FAQ copy.

update public.faq_items
set answer = 'Add a fragrance to your cart, proceed to checkout, and complete delivery details. Confirm payment on WhatsApp 0593634512.',
    requires_owner_review = false
where id = 'faq-order';

update public.faq_items
set answer = 'Message the house on WhatsApp 0593634512 after you place an order to confirm how to pay.',
    requires_owner_review = false
where id = 'faq-payment';
