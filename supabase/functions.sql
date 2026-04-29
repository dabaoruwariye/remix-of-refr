-- ============================================================
-- Refr — Database Functions
-- Run this in the Supabase SQL Editor after schema.sql and rls_policies.sql
-- ============================================================

-- create_user_profile
-- Called from the client immediately after supabase.auth.signUp().
-- SECURITY DEFINER means it runs with the privileges of its owner (postgres),
-- bypassing RLS entirely — no service role key needed in the browser.
create or replace function public.create_user_profile(
  p_user_id   uuid,
  p_email     text,
  p_name      text,
  p_user_type text,
  p_invite_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite      record;
  v_referrer_id uuid;
  v_looker_id   uuid;
begin
  -- Insert the base user row
  insert into public.users (id, email, name, user_type)
  values (p_user_id, p_email, p_name, p_user_type);

  -- Insert a blank profile for the correct role
  if p_user_type = 'looker' then
    insert into public.looker_profiles (user_id) values (p_user_id);
  elsif p_user_type = 'referrer' then
    insert into public.referrer_profiles (user_id) values (p_user_id);
  else
    raise exception 'Invalid user_type: %', p_user_type;
  end if;

  -- Handle invite link flow (optional)
  if p_invite_id is not null then
    select * into v_invite
    from public.invites
    where id = p_invite_id;

    if found then
      update public.invites
      set status = 'joined'
      where id = p_invite_id;

      if p_user_type = 'looker' then
        v_referrer_id := v_invite.inviter_id;
        v_looker_id   := p_user_id;
      else
        v_referrer_id := p_user_id;
        v_looker_id   := v_invite.inviter_id;
      end if;

      insert into public.relationships (referrer_id, looker_id, confirmed_by_looker)
      values (v_referrer_id, v_looker_id, false);
    end if;
  end if;
end;
$$;

-- Grant execute to both roles:
-- - authenticated: normal case (Supabase returns session immediately after signUp)
-- - anon: fallback when email confirmation is enabled and session isn't issued yet
grant execute on function public.create_user_profile(uuid, text, text, text, uuid)
  to authenticated, anon;

-- ============================================================
-- get_user_histories
-- Returns raw work_history and education rows for two users.
-- SECURITY DEFINER so a referrer can fetch a looker's records
-- without needing cross-user RLS policies.
-- ============================================================
create or replace function public.get_user_histories(
  p_user_id_a uuid,
  p_user_id_b uuid
)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'user_a_work', coalesce((
      select jsonb_agg(jsonb_build_object(
        'company_name', company_name,
        'start_date',   start_date,
        'end_date',     end_date
      ))
      from work_history where user_id = p_user_id_a
    ), '[]'::jsonb),
    'user_b_work', coalesce((
      select jsonb_agg(jsonb_build_object(
        'company_name', company_name,
        'start_date',   start_date,
        'end_date',     end_date
      ))
      from work_history where user_id = p_user_id_b
    ), '[]'::jsonb),
    'user_a_edu', coalesce((
      select jsonb_agg(jsonb_build_object('school_name', school_name))
      from education where user_id = p_user_id_a
    ), '[]'::jsonb),
    'user_b_edu', coalesce((
      select jsonb_agg(jsonb_build_object('school_name', school_name))
      from education where user_id = p_user_id_b
    ), '[]'::jsonb)
  )
$$;

grant execute on function public.get_user_histories(uuid, uuid) to authenticated;

-- ============================================================
-- get_referrer_lookers
-- Returns all confirmed-connection lookers for a referrer,
-- with their looker_profile, name, and most recent work entry.
-- SECURITY DEFINER for the same cross-user RLS reason.
-- ============================================================
create or replace function public.get_referrer_lookers(p_referrer_id uuid)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(jsonb_agg(row_data), '[]'::jsonb)
  from (
    select jsonb_build_object(
      'looker_id',   r.looker_id,
      'name',        u.name,
      'email',       u.email,
      'profile', jsonb_build_object(
        'user_id',     lp.user_id,
        'target_role', lp.target_role,
        'seniority',   lp.seniority,
        'industries',  to_jsonb(coalesce(lp.industries, '{}'::text[])),
        'visible',     lp.visible
      ),
      'recent_work', (
        select to_jsonb(w)
        from (
          select company_name, job_title, start_date, end_date, description
          from work_history
          where user_id = r.looker_id
          order by start_date desc nulls last
          limit 1
        ) w
      )
    ) as row_data
    from relationships r
    join users u on u.id = r.looker_id
    left join looker_profiles lp on lp.user_id = r.looker_id
    where r.referrer_id = p_referrer_id
      and r.confirmed_by_looker = true
  ) t
$$;

grant execute on function public.get_referrer_lookers(uuid) to authenticated;
