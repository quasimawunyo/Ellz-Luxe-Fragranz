-- First paid order for an email, counted on the Accra day that order was placed.

create or replace function public.admin_new_customer_count(p_from date, p_to date)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from (
    select lower(email) as email, min((timezone('Africa/Accra', created_at))::date) as first_day
    from public.orders
    where payment_status = 'paid'
      and is_test = false
      and fulfillment_status <> 'cancelled'
      and coalesce(email, '') <> ''
    group by lower(email)
  ) firsts
  where first_day between p_from and p_to;
$$;

revoke all on function public.admin_new_customer_count(date, date) from public;
revoke all on function public.admin_new_customer_count(date, date) from anon, authenticated;
grant execute on function public.admin_new_customer_count(date, date) to service_role;
