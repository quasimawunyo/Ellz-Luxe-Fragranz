-- Daily sales figures for the admin overview. Counts are paid, not a test,
-- and not cancelled. Day boundaries use Africa/Accra.

alter table public.orders
  add column if not exists sales_channel text not null default 'online';

alter table public.orders
  drop constraint if exists orders_sales_channel_check;

alter table public.orders
  add constraint orders_sales_channel_check
  check (sales_channel in ('online', 'in_store'));

alter table public.payments
  add column if not exists payer_network text;

alter table public.payments
  drop constraint if exists payments_payer_network_check;

alter table public.payments
  add constraint payments_payer_network_check
  check (payer_network is null or payer_network in ('mtn', 'telecel', 'at', 'card'));

alter table public.product_variants
  add column if not exists cost_price_minor integer;

alter table public.product_variants
  drop constraint if exists product_variants_cost_price_minor_check;

alter table public.product_variants
  add constraint product_variants_cost_price_minor_check
  check (cost_price_minor is null or cost_price_minor >= 0);

create or replace function public.admin_sales_summary(
  p_preset text default '7d',
  p_from date default null,
  p_to date default null
)
returns jsonb
language sql
volatile
security definer
set search_path = public
as $$
with clock as (
  select (timezone('Africa/Accra', now()))::date as today
),
raw_bounds as (
  select
    case
      when p_preset = 'today' then today
      when p_preset = '30d' then today - 29
      when p_preset = 'month' then date_trunc('month', today::timestamp)::date
      when p_preset = 'custom' then least(coalesce(p_from, today - 6), coalesce(p_to, today))
      else today - 6
    end as range_start,
    case
      when p_preset = 'today' then today
      when p_preset = '30d' then today
      when p_preset = 'month' then today
      when p_preset = 'custom' then greatest(coalesce(p_from, today - 6), coalesce(p_to, today))
      else today
    end as range_end
  from clock
),
periods as (
  select
    case
      when range_end - range_start > 366 then range_end - 366
      else range_start
    end as range_start,
    range_end,
    (
      case
        when range_end - range_start > 366 then range_end - 366
        else range_start
      end
    ) - 1 - (
      range_end - case
        when range_end - range_start > 366 then range_end - 366
        else range_start
      end
    ) as previous_start,
    (
      case
        when range_end - range_start > 366 then range_end - 366
        else range_start
      end
    ) - 1 as previous_end
  from raw_bounds
),
eligible as (
  select *
  from public.orders
  where payment_status = 'paid'
    and is_test = false
    and fulfillment_status <> 'cancelled'
),
current_orders as (
  select o.*
  from eligible o
  cross join periods p
  where (timezone('Africa/Accra', o.created_at))::date between p.range_start and p.range_end
),
previous_orders as (
  select o.*
  from eligible o
  cross join periods p
  where (timezone('Africa/Accra', o.created_at))::date between p.previous_start and p.previous_end
),
current_totals as (
  select
    coalesce(sum(total_minor), 0)::bigint as revenue_minor,
    coalesce(sum(subtotal_minor), 0)::bigint as goods_minor,
    coalesce(sum(shipping_minor), 0)::bigint as delivery_minor,
    count(*)::int as orders
  from current_orders
),
previous_totals as (
  select
    coalesce(sum(total_minor), 0)::bigint as revenue_minor,
    coalesce(sum(subtotal_minor), 0)::bigint as goods_minor,
    coalesce(sum(shipping_minor), 0)::bigint as delivery_minor,
    count(*)::int as orders
  from previous_orders
),
paid_lines as (
  select
    case
      when pay.payer_network in ('mtn', 'telecel', 'at') then pay.payer_network
      when pay.method = 'card' or pay.provider = 'paystack' or pay.payer_network = 'card' then 'card'
      when pay.method = 'cash' then 'cash'
      when pay.method = 'mobile_money' or pay.method = 'moolre' or pay.provider = 'moolre' then 'momo'
      else 'unclassified'
    end as bucket,
    pay.amount_minor
  from public.payments pay
  join current_orders o on o.id = pay.order_id
  where pay.status = 'paid'
),
payment_split as (
  select
    coalesce(sum(amount_minor) filter (where bucket in ('mtn', 'telecel', 'at', 'momo')), 0)::bigint as mobile_money_minor,
    coalesce(sum(amount_minor) filter (where bucket = 'mtn'), 0)::bigint as mtn_minor,
    coalesce(sum(amount_minor) filter (where bucket = 'telecel'), 0)::bigint as telecel_minor,
    coalesce(sum(amount_minor) filter (where bucket = 'at'), 0)::bigint as at_minor,
    coalesce(sum(amount_minor) filter (where bucket = 'card'), 0)::bigint as card_minor,
    coalesce(sum(amount_minor) filter (where bucket = 'cash'), 0)::bigint as cash_minor,
    coalesce(sum(amount_minor) filter (where bucket = 'unclassified'), 0)::bigint as unclassified_minor
  from paid_lines
),
channel_split as (
  select
    coalesce(sum(total_minor) filter (where sales_channel = 'online'), 0)::bigint as online_minor,
    count(*) filter (where sales_channel = 'online')::int as online_orders,
    coalesce(sum(total_minor) filter (where sales_channel = 'in_store'), 0)::bigint as in_store_minor,
    count(*) filter (where sales_channel = 'in_store')::int as in_store_orders
  from current_orders
),
profit_row as (
  select
    case
      when count(*) = 0 then null
      when bool_and(v.cost_price_minor is not null) then sum((oi.unit_price_minor - v.cost_price_minor) * oi.quantity)::bigint
      else null
    end as profit_minor
  from public.order_items oi
  join current_orders o on o.id = oi.order_id
  left join public.product_variants v on v.id = oi.variant_id
)
select jsonb_build_object(
  'range', (
    select jsonb_build_object(
      'preset', case when p_preset in ('today', '7d', '30d', 'month', 'custom') then p_preset else '7d' end,
      'from', to_char(range_start, 'YYYY-MM-DD'),
      'to', to_char(range_end, 'YYYY-MM-DD'),
      'previousFrom', to_char(previous_start, 'YYYY-MM-DD'),
      'previousTo', to_char(previous_end, 'YYYY-MM-DD')
    )
    from periods
  ),
  'current', (
    select jsonb_build_object(
      'revenueMinor', revenue_minor,
      'goodsMinor', goods_minor,
      'deliveryMinor', delivery_minor,
      'orders', orders,
      'averageMinor', case when orders = 0 then 0 else round(revenue_minor::numeric / orders)::bigint end
    )
    from current_totals
  ),
  'previous', (
    select jsonb_build_object(
      'revenueMinor', revenue_minor,
      'goodsMinor', goods_minor,
      'deliveryMinor', delivery_minor,
      'orders', orders,
      'averageMinor', case when orders = 0 then 0 else round(revenue_minor::numeric / orders)::bigint end
    )
    from previous_totals
  ),
  'days', coalesce((
    select jsonb_agg(item order by day)
    from (
      select
        d::date as day,
        jsonb_build_object(
          'day', to_char(d::date, 'YYYY-MM-DD'),
          'revenueMinor', coalesce(sum(o.total_minor), 0)
        ) as item
      from periods p
      cross join generate_series(p.range_start, p.range_end, interval '1 day') as d
      left join current_orders o
        on (timezone('Africa/Accra', o.created_at))::date = d::date
      group by d
    ) day_rows
  ), '[]'::jsonb),
  'topUnits', coalesce((
    select jsonb_agg(item order by units desc, revenue desc, name)
    from (
      select
        oi.product_name as name,
        sum(oi.quantity)::int as units,
        sum(oi.quantity * oi.unit_price_minor)::bigint as revenue,
        jsonb_build_object(
          'name', oi.product_name,
          'units', sum(oi.quantity)::int,
          'revenueMinor', sum(oi.quantity * oi.unit_price_minor)::bigint
        ) as item
      from public.order_items oi
      join current_orders o on o.id = oi.order_id
      group by oi.product_name
      order by sum(oi.quantity) desc, sum(oi.quantity * oi.unit_price_minor) desc, oi.product_name
      limit 5
    ) ranked
  ), '[]'::jsonb),
  'topRevenue', coalesce((
    select jsonb_agg(item order by revenue desc, units desc, name)
    from (
      select
        oi.product_name as name,
        sum(oi.quantity)::int as units,
        sum(oi.quantity * oi.unit_price_minor)::bigint as revenue,
        jsonb_build_object(
          'name', oi.product_name,
          'units', sum(oi.quantity)::int,
          'revenueMinor', sum(oi.quantity * oi.unit_price_minor)::bigint
        ) as item
      from public.order_items oi
      join current_orders o on o.id = oi.order_id
      group by oi.product_name
      order by sum(oi.quantity * oi.unit_price_minor) desc, sum(oi.quantity) desc, oi.product_name
      limit 5
    ) ranked
  ), '[]'::jsonb),
  'payments', (select jsonb_build_object(
    'mobileMoneyMinor', mobile_money_minor,
    'mtnMinor', mtn_minor,
    'telecelMinor', telecel_minor,
    'atMinor', at_minor,
    'cardMinor', card_minor,
    'cashMinor', cash_minor,
    'unclassifiedMinor', unclassified_minor
  ) from payment_split),
  'channel', (select jsonb_build_object(
    'onlineMinor', online_minor,
    'onlineOrders', online_orders,
    'inStoreMinor', in_store_minor,
    'inStoreOrders', in_store_orders
  ) from channel_split),
  'profitMinor', (select profit_minor from profit_row),
  'action', jsonb_build_object(
    'toPack', (
      select count(*)::int
      from public.orders
      where is_test = false
        and payment_status = 'paid'
        and fulfillment_status = 'new'
    ),
    'needsFee', (
      select count(*)::int
      from public.orders
      where is_test = false
        and fulfillment_status in ('new', 'packed', 'out_for_delivery', 'ready_for_pickup')
        and shipping_minor = 0
        and delivery_method not ilike '%pickup%'
    ),
    'outForDelivery', (
      select count(*)::int
      from public.orders
      where is_test = false
        and fulfillment_status = 'out_for_delivery'
    ),
    'needsAttention', (
      select count(*)::int
      from public.orders
      where is_test = false
        and needs_attention = true
        and fulfillment_status <> 'cancelled'
    ),
    'review', (
      select count(*)::int
      from public.orders
      where is_test = false
        and awaiting_review = true
    )
  ),
  'stock', jsonb_build_object(
    'sizes', (select count(*)::int from public.product_variants),
    'inStock', (
      select count(*)::int
      from public.product_variants
      where track_stock
        and stock_quantity > coalesce(low_stock_threshold, 3)
    ),
    'lowStock', (
      select count(*)::int
      from public.product_variants
      where track_stock
        and stock_quantity > 0
        and stock_quantity <= coalesce(low_stock_threshold, 3)
    ),
    'outOfStock', (
      select count(*)::int
      from public.product_variants
      where track_stock
        and stock_quantity <= 0
    ),
    'low', coalesce((
      select jsonb_agg(item order by quantity, name)
      from (
        select
          v.stock_quantity as quantity,
          p.name as name,
          jsonb_build_object(
            'variantId', v.id,
            'productName', p.name,
            'label', v.label,
            'quantity', v.stock_quantity
          ) as item
        from public.product_variants v
        join public.products p on p.id = v.product_id
        where v.track_stock
          and v.stock_quantity > 0
          and v.stock_quantity <= coalesce(v.low_stock_threshold, 3)
        order by v.stock_quantity, p.name, v.label
        limit 12
      ) low_rows
    ), '[]'::jsonb),
    'noPhotoCount', (
      select count(*)::int
      from public.products p
      where p.status <> 'archived'
        and not exists (
          select 1 from public.product_images i where i.product_id = p.id
        )
    ),
    'noPhoto', coalesce((
      select jsonb_agg(item order by name)
      from (
        select
          p.name,
          jsonb_build_object('id', p.id, 'name', p.name) as item
        from public.products p
        where p.status <> 'archived'
          and not exists (
            select 1 from public.product_images i where i.product_id = p.id
          )
        order by p.name
        limit 12
      ) photo_rows
    ), '[]'::jsonb)
  )
);
$$;

revoke all on function public.admin_sales_summary(text, date, date) from public;
revoke all on function public.admin_sales_summary(text, date, date) from anon, authenticated;
grant execute on function public.admin_sales_summary(text, date, date) to service_role;
