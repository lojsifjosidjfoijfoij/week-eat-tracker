-- ============================================================================
-- dinrr — security & backend overhaul (2026-10-10)
--
-- Paste this WHOLE file into Supabase → SQL Editor → Run. It is one
-- transaction: either everything is applied or nothing is.
-- It is safe to run more than once.
--
-- What it does
--   1. Adds missing columns, de-duplicates rows and adds unique constraints
--      (one family per user, one meal per day per family).
--   2. Drops EVERY existing policy on the dinrr tables and recreates a clean,
--      minimal set (members can only see their own family).
--   3. Moves create / join / leave / kick / rename family into server
--      functions so the client can no longer read other families' codes or
--      add itself to random families.
--   4. Adds server-side premium (public.entitlements), filled by the
--      sync-premium and revenuecat-webhook edge functions. Family members
--      get dinrr+ only while a member of that family has an active
--      subscription.
--   5. Atomic AI rate limiting + a small AI suggestion cache.
--   6. Turns on Realtime for meal_plans / ingredients / family_members.
--   7. Re-creates the nightly cleanup job so it uses updated_at (the old job
--      could delete a meal that was edited yesterday because it was first
--      created 5+ weeks ago).
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 0. Sanity check: the core tables must exist
-- ----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['families','family_members','meal_plans','ingredients'] loop
    if to_regclass('public.' || t) is null then
      raise exception 'dinrr migration: table public.% does not exist — is this the right project?', t;
    end if;
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- 1. Columns
-- ----------------------------------------------------------------------------
alter table public.families       add column if not exists created_at timestamptz not null default now();
alter table public.family_members add column if not exists email      text;
alter table public.family_members add column if not exists created_at timestamptz not null default now();
alter table public.meal_plans     add column if not exists created_at timestamptz not null default now();
alter table public.meal_plans     add column if not exists updated_at timestamptz not null default now();
alter table public.ingredients    add column if not exists created_at timestamptz not null default now();
alter table public.ingredients    add column if not exists updated_at timestamptz not null default now();
alter table public.ingredients    alter column checked set default false;
alter table public.meal_plans     alter column meal set default '';

-- Ingredient ids: give the column a default whatever its type (text or uuid)
do $$
declare v_type text;
begin
  select data_type into v_type from information_schema.columns
   where table_schema = 'public' and table_name = 'ingredients' and column_name = 'id';
  if v_type = 'uuid' then
    execute 'alter table public.ingredients alter column id set default gen_random_uuid()';
  elsif v_type in ('text', 'character varying') then
    execute 'alter table public.ingredients alter column id set default gen_random_uuid()::text';
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 2. Clean up duplicates, then add the constraints the app relies on
-- ----------------------------------------------------------------------------

-- 2a. One family per user. If someone ended up in several, keep the family
--     they own, otherwise the most recent membership.
delete from public.family_members fm
using (
  select m.ctid as row_ctid,
         row_number() over (
           partition by m.user_id
           order by (f.owner_id = m.user_id) desc nulls last, m.created_at desc nulls last, m.ctid desc
         ) as rn
  from public.family_members m
  left join public.families f on f.id = m.family_id
) d
where fm.ctid = d.row_ctid and d.rn > 1;

create unique index if not exists family_members_one_family_per_user
  on public.family_members (user_id);

-- 2b. One meal row per family per day. The old client could create several
--     while typing; keep the most recently written one.
delete from public.meal_plans mp
using (
  select ctid as row_ctid,
         row_number() over (
           partition by family_id, day_index
           order by updated_at desc nulls last, created_at desc nulls last, ctid desc
         ) as rn
  from public.meal_plans
) d
where mp.ctid = d.row_ctid and d.rn > 1;

create unique index if not exists meal_plans_family_day_key
  on public.meal_plans (family_id, day_index);

-- 2c. Family codes must be unique (re-code any accidental duplicates first)
update public.families f
set code = upper(substr(md5(random()::text || f.id::text), 1, 8))
where f.code is null or f.code = '' or exists (
  select 1 from public.families g
  where g.code = f.code and g.ctid < f.ctid
);

do $$
begin
  if not exists (
    select 1 from pg_index i
    join pg_attribute a on a.attrelid = i.indrelid and a.attnum = any(i.indkey)
    where i.indrelid = 'public.families'::regclass and i.indisunique and a.attname = 'code'
      and i.indnatts = 1
  ) then
    create unique index families_code_key_idx on public.families (code);
  end if;
end $$;

-- 2d. day_index: 0–6 = Monday–Sunday, 7 = "extras" on the shopping list
--     (toilet paper etc.), which are now shared with the family too.
do $$
declare r record;
begin
  for r in
    select c.conname from pg_constraint c
    where c.conrelid = 'public.ingredients'::regclass and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%day_index%'
  loop
    execute format('alter table public.ingredients drop constraint %I', r.conname);
  end loop;
end $$;
alter table public.ingredients add constraint ingredients_day_index_range check (day_index between 0 and 7) not valid;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'meal_plans_day_index_range') then
    alter table public.meal_plans add constraint meal_plans_day_index_range check (day_index between 0 and 6) not valid;
  end if;
  -- Size limits so nobody can store megabytes in a meal name
  if not exists (select 1 from pg_constraint where conname = 'meal_plans_meal_length') then
    alter table public.meal_plans add constraint meal_plans_meal_length check (char_length(meal) <= 200) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ingredients_name_length') then
    alter table public.ingredients add constraint ingredients_name_length check (char_length(name) <= 120) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'families_name_length') then
    alter table public.families add constraint families_name_length check (char_length(name) <= 60) not valid;
  end if;
end $$;

create index if not exists ingredients_family_idx on public.ingredients (family_id);

-- ----------------------------------------------------------------------------
-- 3. updated_at triggers
-- ----------------------------------------------------------------------------
create or replace function public.dinrr_touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists dinrr_meal_plans_touch on public.meal_plans;
create trigger dinrr_meal_plans_touch before update on public.meal_plans
  for each row execute function public.dinrr_touch_updated_at();

drop trigger if exists dinrr_ingredients_touch on public.ingredients;
create trigger dinrr_ingredients_touch before update on public.ingredients
  for each row execute function public.dinrr_touch_updated_at();

-- ----------------------------------------------------------------------------
-- 4. New tables
-- ----------------------------------------------------------------------------

-- Premium status per user. Written ONLY by edge functions (service role).
create table if not exists public.entitlements (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  is_active    boolean not null default false,
  expires_at   timestamptz,
  product_id   text,
  manual_grant boolean not null default false,   -- set by hand for testers / friends
  updated_at   timestamptz not null default now()
);

-- Failed join-code attempts (rate limiting / brute-force protection)
create table if not exists public.family_join_attempts (
  user_id      uuid not null references auth.users(id) on delete cascade,
  attempted_at timestamptz not null default now()
);
create index if not exists family_join_attempts_user_time on public.family_join_attempts (user_id, attempted_at);

-- AI usage (may already exist from 20260610_ai_usage.sql)
create table if not exists public.ai_usage (
  user_id    uuid not null references auth.users(id) on delete cascade,
  usage_date date not null,
  count      integer not null default 0,
  primary key (user_id, usage_date)
);

-- Shared cache for AI ingredient suggestions (same dish + language → same answer)
create table if not exists public.ai_suggestion_cache (
  cache_key   text primary key,
  ingredients jsonb not null,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5. Helper functions used by policies (SECURITY DEFINER avoids RLS recursion)
-- ----------------------------------------------------------------------------
create or replace function public.is_family_member(p_family_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.family_members
    where family_id = p_family_id and user_id = auth.uid()
  );
$$;

create or replace function public.has_active_premium(p_user_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.entitlements e
    where e.user_id = p_user_id
      and (e.manual_grant or (e.is_active and (e.expires_at is null or e.expires_at > now())))
  );
$$;

create or replace function public.family_has_premium(p_family_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.family_members m
    where m.family_id = p_family_id and public.has_active_premium(m.user_id)
  );
$$;

-- ----------------------------------------------------------------------------
-- 6. Row Level Security — drop everything, recreate a clean set
-- ----------------------------------------------------------------------------
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles','families','family_members','family_invites','meal_plans',
                        'ingredients','ai_usage','entitlements','family_join_attempts','ai_suggestion_cache')
  loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

alter table public.families             enable row level security;
alter table public.family_members       enable row level security;
alter table public.meal_plans           enable row level security;
alter table public.ingredients          enable row level security;
alter table public.ai_usage             enable row level security;
alter table public.entitlements         enable row level security;
alter table public.family_join_attempts enable row level security;
alter table public.ai_suggestion_cache  enable row level security;

-- Nobody who isn't logged in needs any table
revoke all on public.families, public.family_members, public.meal_plans, public.ingredients,
              public.ai_usage, public.entitlements, public.family_join_attempts, public.ai_suggestion_cache
  from anon;

-- families: members can read their own family. All writes go through functions.
revoke insert, update, delete, truncate on public.families from authenticated;
grant select on public.families to authenticated;
create policy families_select_member on public.families
  for select to authenticated using (public.is_family_member(id));

-- family_members: members can see who else is in their family. Writes via functions.
revoke insert, update, delete, truncate on public.family_members from authenticated;
grant select on public.family_members to authenticated;
create policy family_members_select_same_family on public.family_members
  for select to authenticated using (public.is_family_member(family_id));

-- meal_plans / ingredients: full access, but only inside your own family
revoke truncate on public.meal_plans, public.ingredients from authenticated;
grant select, insert, update, delete on public.meal_plans, public.ingredients to authenticated;
create policy meal_plans_member_all on public.meal_plans
  for all to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));
create policy ingredients_member_all on public.ingredients
  for all to authenticated
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

-- ai_usage / entitlements: read your own row only, never write
revoke insert, update, delete, truncate on public.ai_usage, public.entitlements from authenticated;
grant select on public.ai_usage, public.entitlements to authenticated;
create policy ai_usage_select_own on public.ai_usage
  for select to authenticated using (user_id = auth.uid());
create policy entitlements_select_own on public.entitlements
  for select to authenticated using (user_id = auth.uid());

-- internal tables: no client access at all
revoke all on public.family_join_attempts, public.ai_suggestion_cache from authenticated;

-- profiles (optional table, column name may be id or user_id)
do $$
declare v_col text;
begin
  if to_regclass('public.profiles') is null then return; end if;
  select column_name into v_col from information_schema.columns
   where table_schema = 'public' and table_name = 'profiles' and column_name in ('id','user_id')
   order by case column_name when 'id' then 0 else 1 end limit 1;
  execute 'alter table public.profiles enable row level security';
  execute 'revoke all on public.profiles from anon';
  execute 'revoke delete, truncate on public.profiles from authenticated';
  execute 'grant select, insert, update on public.profiles to authenticated';
  if v_col is not null then
    execute format('create policy profiles_select_own on public.profiles for select to authenticated using (%I = auth.uid())', v_col);
    execute format('create policy profiles_insert_own on public.profiles for insert to authenticated with check (%I = auth.uid())', v_col);
    execute format('create policy profiles_update_own on public.profiles for update to authenticated using (%I = auth.uid()) with check (%I = auth.uid())', v_col, v_col);
  end if;
end $$;

-- family_invites (unused by the app): lock it down completely
do $$
begin
  if to_regclass('public.family_invites') is null then return; end if;
  execute 'alter table public.family_invites enable row level security';
  execute 'revoke all on public.family_invites from anon, authenticated';
end $$;

-- ----------------------------------------------------------------------------
-- 7. Family functions (the only way to create / join / leave a family)
--    They return json { ok: bool, error?: text, ... } instead of raising,
--    so the app can show a friendly message.
-- ----------------------------------------------------------------------------

create or replace function public.dinrr_new_family_code()
returns text language plpgsql volatile security definer set search_path = '' as $$
declare
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  -- no 0/O/1/I
  v_bytes bytea;
  v_code  text;
  i int;
begin
  loop
    v_bytes := uuid_send(gen_random_uuid()) || uuid_send(gen_random_uuid());
    v_code := '';
    for i in 0..7 loop
      v_code := v_code || substr(v_alphabet, (get_byte(v_bytes, i) % 32) + 1, 1);
    end loop;
    exit when not exists (select 1 from public.families where code = v_code);
  end loop;
  return v_code;
end $$;

-- Internal: remove a user from their family. If they owned it, hand it to the
-- longest-standing member, or delete the family (and its plan) if empty.
create or replace function public.dinrr_leave_family_for(p_user_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_family_id uuid;
  v_owner uuid;
  v_next uuid;
begin
  select m.family_id, f.owner_id into v_family_id, v_owner
  from public.family_members m join public.families f on f.id = m.family_id
  where m.user_id = p_user_id;

  if v_family_id is null then
    delete from public.family_members where user_id = p_user_id;
    return;
  end if;

  delete from public.family_members where family_id = v_family_id and user_id = p_user_id;

  if v_owner = p_user_id then
    select user_id into v_next from public.family_members
     where family_id = v_family_id order by created_at asc nulls last limit 1;
    if v_next is null then
      delete from public.ingredients where family_id = v_family_id;
      delete from public.meal_plans  where family_id = v_family_id;
      delete from public.families    where id = v_family_id;
    else
      update public.families set owner_id = v_next where id = v_family_id;
    end if;
  end if;
end $$;

create or replace function public.get_my_family()
returns json language plpgsql stable security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_family public.families;
begin
  if v_uid is null then return json_build_object('ok', false, 'error', 'not_authenticated'); end if;

  select f.* into v_family
  from public.families f join public.family_members m on m.family_id = f.id
  where m.user_id = v_uid;

  return json_build_object(
    'ok', true,
    'family', case when v_family.id is null then null else json_build_object(
      'id', v_family.id, 'name', v_family.name, 'code', v_family.code, 'owner_id', v_family.owner_id) end,
    'members', coalesce((
      select json_agg(json_build_object(
               'user_id', m.user_id,
               'email', coalesce(m.email, u.email),
               'name', nullif(u.raw_user_meta_data ->> 'full_name', ''),
               'is_owner', m.user_id = v_family.owner_id)
             order by (m.user_id = v_family.owner_id) desc, m.created_at)
      from public.family_members m left join auth.users u on u.id = m.user_id
      where m.family_id = v_family.id), '[]'::json),
    'premium', json_build_object(
      'self', public.has_active_premium(v_uid),
      'family', coalesce(public.family_has_premium(v_family.id), false))
  );
end $$;

create or replace function public.create_family(p_name text)
returns json language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_name text := left(btrim(coalesce(p_name, '')), 60);
  v_family public.families;
begin
  if v_uid is null then return json_build_object('ok', false, 'error', 'not_authenticated'); end if;
  if v_name = '' then return json_build_object('ok', false, 'error', 'name_required'); end if;
  if exists (select 1 from public.family_members where user_id = v_uid) then
    return json_build_object('ok', false, 'error', 'already_in_family');
  end if;
  if not public.has_active_premium(v_uid) then
    return json_build_object('ok', false, 'error', 'premium_required');
  end if;

  insert into public.families (name, code, owner_id)
  values (v_name, public.dinrr_new_family_code(), v_uid)
  returning * into v_family;

  insert into public.family_members (family_id, user_id, email)
  values (v_family.id, v_uid, (select email from auth.users where id = v_uid));

  return json_build_object('ok', true, 'family', json_build_object(
    'id', v_family.id, 'name', v_family.name, 'code', v_family.code, 'owner_id', v_family.owner_id));
end $$;

create or replace function public.join_family(p_code text)
returns json language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  v_family public.families;
  v_current uuid;
begin
  if v_uid is null then return json_build_object('ok', false, 'error', 'not_authenticated'); end if;

  -- Max 8 wrong codes per hour per user
  if (select count(*) from public.family_join_attempts
       where user_id = v_uid and attempted_at > now() - interval '1 hour') >= 8 then
    return json_build_object('ok', false, 'error', 'rate_limited');
  end if;

  select * into v_family from public.families where code = v_code;
  if v_family.id is null or v_code = '' then
    insert into public.family_join_attempts (user_id) values (v_uid);
    return json_build_object('ok', false, 'error', 'invalid_code');
  end if;

  select family_id into v_current from public.family_members where user_id = v_uid;
  if v_current = v_family.id then
    return json_build_object('ok', true, 'family', json_build_object(
      'id', v_family.id, 'name', v_family.name, 'code', v_family.code, 'owner_id', v_family.owner_id));
  end if;

  if (select count(*) from public.family_members where family_id = v_family.id) >= 12 then
    return json_build_object('ok', false, 'error', 'family_full');
  end if;

  if v_current is not null then
    perform public.dinrr_leave_family_for(v_uid);
  end if;

  insert into public.family_members (family_id, user_id, email)
  values (v_family.id, v_uid, (select email from auth.users where id = v_uid));

  return json_build_object('ok', true, 'family', json_build_object(
    'id', v_family.id, 'name', v_family.name, 'code', v_family.code, 'owner_id', v_family.owner_id));
end $$;

create or replace function public.leave_family()
returns json language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then return json_build_object('ok', false, 'error', 'not_authenticated'); end if;
  perform public.dinrr_leave_family_for(auth.uid());
  return json_build_object('ok', true);
end $$;

create or replace function public.remove_family_member(p_user_id uuid)
returns json language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_family_id uuid;
begin
  if v_uid is null then return json_build_object('ok', false, 'error', 'not_authenticated'); end if;
  if p_user_id is null or p_user_id = v_uid then return json_build_object('ok', false, 'error', 'invalid_member'); end if;

  select id into v_family_id from public.families where owner_id = v_uid;
  if v_family_id is null then return json_build_object('ok', false, 'error', 'not_owner'); end if;

  delete from public.family_members where family_id = v_family_id and user_id = p_user_id;
  return json_build_object('ok', true);
end $$;

create or replace function public.rename_family(p_name text)
returns json language plpgsql security definer set search_path = '' as $$
declare v_name text := left(btrim(coalesce(p_name, '')), 60);
begin
  if auth.uid() is null then return json_build_object('ok', false, 'error', 'not_authenticated'); end if;
  if v_name = '' then return json_build_object('ok', false, 'error', 'name_required'); end if;
  update public.families set name = v_name where owner_id = auth.uid();
  if not found then return json_build_object('ok', false, 'error', 'not_owner'); end if;
  return json_build_object('ok', true);
end $$;

create or replace function public.regenerate_family_code()
returns json language plpgsql security definer set search_path = '' as $$
declare v_code text;
begin
  if auth.uid() is null then return json_build_object('ok', false, 'error', 'not_authenticated'); end if;
  v_code := public.dinrr_new_family_code();
  update public.families set code = v_code where owner_id = auth.uid();
  if not found then return json_build_object('ok', false, 'error', 'not_owner'); end if;
  return json_build_object('ok', true, 'code', v_code);
end $$;

-- Clears Monday–Sunday for the whole family in one go (extras are kept)
create or replace function public.reset_family_week()
returns json language plpgsql security definer set search_path = '' as $$
declare v_family_id uuid;
begin
  select family_id into v_family_id from public.family_members where user_id = auth.uid();
  if v_family_id is null then return json_build_object('ok', false, 'error', 'no_family'); end if;
  delete from public.ingredients where family_id = v_family_id and day_index between 0 and 6;
  delete from public.meal_plans  where family_id = v_family_id;
  return json_build_object('ok', true);
end $$;

create or replace function public.get_premium_status()
returns json language sql stable security definer set search_path = '' as $$
  select json_build_object(
    'self', public.has_active_premium(auth.uid()),
    'family', coalesce((select public.family_has_premium(m.family_id)
                        from public.family_members m where m.user_id = auth.uid()), false));
$$;

-- ----------------------------------------------------------------------------
-- 8. Service-role-only functions (used by edge functions)
-- ----------------------------------------------------------------------------

-- Atomically uses one AI credit. Returns false when the daily limit is hit.
create or replace function public.consume_ai_credit(p_user_id uuid, p_limit int)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_count int;
begin
  insert into public.ai_usage as u (user_id, usage_date, count)
  values (p_user_id, current_date, 1)
  on conflict (user_id, usage_date) do update set count = u.count + 1
    where u.count < p_limit
  returning u.count into v_count;
  return v_count is not null;
end $$;

-- Everything except the auth user itself (the edge function deletes that)
create or replace function public.delete_user_data(p_user_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_col text;
begin
  perform public.dinrr_leave_family_for(p_user_id);
  delete from public.entitlements where user_id = p_user_id;
  delete from public.ai_usage where user_id = p_user_id;
  delete from public.family_join_attempts where user_id = p_user_id;
  if to_regclass('public.profiles') is not null then
    select column_name into v_col from information_schema.columns
     where table_schema = 'public' and table_name = 'profiles' and column_name in ('id','user_id')
     order by case column_name when 'id' then 0 else 1 end limit 1;
    if v_col is not null then
      execute format('delete from public.profiles where %I = $1', v_col) using p_user_id;
    end if;
  end if;
  if to_regclass('public.family_invites') is not null and exists (
       select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'family_invites' and column_name = 'invited_by') then
    execute 'delete from public.family_invites where invited_by = $1' using p_user_id;
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 9. Function permissions (Supabase grants EXECUTE to everyone by default)
-- ----------------------------------------------------------------------------
revoke all on function public.dinrr_touch_updated_at()          from public, anon, authenticated;
revoke all on function public.dinrr_new_family_code()           from public, anon, authenticated;
revoke all on function public.dinrr_leave_family_for(uuid)      from public, anon, authenticated;
revoke all on function public.consume_ai_credit(uuid, int)      from public, anon, authenticated;
revoke all on function public.delete_user_data(uuid)            from public, anon, authenticated;
revoke all on function public.has_active_premium(uuid)          from public, anon;
revoke all on function public.family_has_premium(uuid)          from public, anon;
revoke all on function public.is_family_member(uuid)            from public, anon;
revoke all on function public.get_my_family()                   from public, anon;
revoke all on function public.create_family(text)               from public, anon;
revoke all on function public.join_family(text)                 from public, anon;
revoke all on function public.leave_family()                    from public, anon;
revoke all on function public.remove_family_member(uuid)        from public, anon;
revoke all on function public.rename_family(text)               from public, anon;
revoke all on function public.regenerate_family_code()          from public, anon;
revoke all on function public.reset_family_week()               from public, anon;
revoke all on function public.get_premium_status()              from public, anon;

grant execute on function public.is_family_member(uuid), public.has_active_premium(uuid),
  public.family_has_premium(uuid), public.get_my_family(), public.create_family(text),
  public.join_family(text), public.leave_family(), public.remove_family_member(uuid),
  public.rename_family(text), public.regenerate_family_code(), public.reset_family_week(),
  public.get_premium_status()
  to authenticated;

grant execute on function public.consume_ai_credit(uuid, int), public.delete_user_data(uuid),
  public.dinrr_leave_family_for(uuid), public.has_active_premium(uuid), public.family_has_premium(uuid)
  to service_role;
grant all on public.entitlements, public.ai_usage, public.ai_suggestion_cache, public.family_join_attempts
  to service_role;

-- ----------------------------------------------------------------------------
-- 10. Realtime (live family sync)
-- ----------------------------------------------------------------------------
do $$
declare t text;
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    raise notice 'dinrr: supabase_realtime publication not found — skipping realtime setup';
    return;
  end if;
  foreach t in array array['meal_plans','ingredients','family_members','families'] loop
    if not exists (select 1 from pg_publication_tables
                   where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- 11. Nightly cleanup (pg_cron) — replaces the old job
-- ----------------------------------------------------------------------------
do $$
declare
  r record;
  v_cmd text;
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise notice 'dinrr: pg_cron not installed — skipping cleanup job';
    return;
  end if;

  for r in execute $q$
      select jobid from cron.job
      where command ilike '%meal_plans%' or command ilike '%ingredients%'
         or command ilike '%family_invites%' or jobname = 'dinrr-nightly-cleanup'
    $q$
  loop
    perform cron.unschedule(r.jobid);
  end loop;

  v_cmd := 'delete from public.meal_plans where updated_at < now() - interval ''5 weeks''; '
        || 'delete from public.ingredients where updated_at < now() - interval ''5 weeks''; '
        || 'delete from public.family_join_attempts where attempted_at < now() - interval ''1 day''; '
        || 'delete from public.ai_suggestion_cache where created_at < now() - interval ''30 days''; '
        || 'delete from public.ai_usage where usage_date < current_date - 7;';
  if to_regclass('public.family_invites') is not null and exists (
       select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'family_invites' and column_name = 'created_at') then
    v_cmd := v_cmd || ' delete from public.family_invites where created_at < now() - interval ''2 weeks'';';
  end if;

  perform cron.schedule('dinrr-nightly-cleanup', '17 3 * * *', v_cmd);
exception when others then
  raise notice 'dinrr: could not (re)create the cleanup job: %', sqlerrm;
end $$;

commit;

-- ============================================================================
-- Handy snippets (NOT run automatically)
--
-- Give yourself / a tester dinrr+ for free (survives RevenueCat syncs):
--   insert into public.entitlements (user_id, manual_grant)
--   select id, true from auth.users where email = 'you@example.com'
--   on conflict (user_id) do update set manual_grant = true;
--
-- Take it away again:
--   update public.entitlements set manual_grant = false
--   where user_id = (select id from auth.users where email = 'you@example.com');
-- ============================================================================
