-- First registered account becomes admin; later signups remain customers.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case when not exists (select 1 from public.profiles) then 'admin' else 'customer' end
  );
  return new;
end;
$$;
