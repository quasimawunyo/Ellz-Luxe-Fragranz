-- House owner role, first signup, and service-role staff changes.

alter table public.profiles drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('customer', 'admin', 'super_admin'));

alter table public.profiles disable trigger profiles_no_self_admin;

update public.profiles
set role = 'super_admin', updated_at = now()
where role = 'admin';

alter table public.profiles enable trigger profiles_no_self_admin;

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
    case when not exists (select 1 from public.profiles) then 'super_admin' else 'customer' end
  );
  return new;
end;
$$;

create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Role changes are not permitted from this client';
  end if;
  return new;
end;
$$;
