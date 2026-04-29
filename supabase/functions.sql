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
