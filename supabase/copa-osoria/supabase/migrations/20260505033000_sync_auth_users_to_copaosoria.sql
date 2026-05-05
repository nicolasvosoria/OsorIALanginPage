-- Keep Copa Osoria profile rows aligned with Supabase Auth users.
-- user_prediction.user_id has an FK to copaosoria.users(id), so predictions fail
-- for Auth users that do not yet have a Copa profile row.

insert into copaosoria.users (id, email, username, register_code)
select
  au.id,
  case
    when au.email is null or au.email = '' then au.id::text || '@copaosoria.local'
    when exists (
      select 1 from copaosoria.users existing
      where existing.email = au.email and existing.id <> au.id
    ) then au.id::text || '@copaosoria.local'
    else au.email
  end as email,
  coalesce(
    nullif(au.raw_user_meta_data->>'username', ''),
    nullif(au.raw_user_meta_data->>'full_name', ''),
    split_part(coalesce(nullif(au.email, ''), au.id::text), '@', 1),
    'Usuario'
  ) as username,
  nullif(au.raw_user_meta_data->>'register_code', '') as register_code
from auth.users au
where not exists (
  select 1 from copaosoria.users cu where cu.id = au.id
);

create or replace function copaosoria.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = copaosoria, public
as $$
declare
  target_email text;
begin
  target_email := coalesce(nullif(new.email, ''), new.id::text || '@copaosoria.local');

  if exists (
    select 1 from copaosoria.users existing
    where existing.email = target_email and existing.id <> new.id
  ) then
    target_email := new.id::text || '@copaosoria.local';
  end if;

  insert into copaosoria.users (id, email, username, register_code)
  values (
    new.id,
    target_email,
    coalesce(
      nullif(new.raw_user_meta_data->>'username', ''),
      nullif(new.raw_user_meta_data->>'full_name', ''),
      split_part(coalesce(nullif(new.email, ''), new.id::text), '@', 1),
      'Usuario'
    ),
    nullif(new.raw_user_meta_data->>'register_code', '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    username = excluded.username,
    register_code = excluded.register_code;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_copaosoria on auth.users;
create trigger on_auth_user_created_copaosoria
after insert on auth.users
for each row execute function copaosoria.handle_auth_user_created();
