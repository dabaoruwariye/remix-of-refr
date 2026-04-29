-- ============================================================
-- Refr — RLS Policies
-- Run this in the Supabase SQL Editor after schema.sql
-- ============================================================

-- ── users ────────────────────────────────────────────────────
alter table public.users enable row level security;

-- Authenticated users can insert their own row (id must match auth.uid())
create policy "users: insert own row"
  on public.users for insert
  to authenticated
  with check (auth.uid() = id);

-- Users can read their own row
create policy "users: select own row"
  on public.users for select
  to authenticated
  using (auth.uid() = id);

-- Users can update their own row
create policy "users: update own row"
  on public.users for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);


-- ── looker_profiles ──────────────────────────────────────────
alter table public.looker_profiles enable row level security;

-- Lookers can insert/read/update their own profile
create policy "looker_profiles: insert own"
  on public.looker_profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "looker_profiles: select own"
  on public.looker_profiles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "looker_profiles: update own"
  on public.looker_profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Referrers can read looker profiles that are visible
-- (needed for the network/discovery features)
create policy "looker_profiles: referrers can read visible"
  on public.looker_profiles for select
  to authenticated
  using (visible = true);


-- ── referrer_profiles ────────────────────────────────────────
alter table public.referrer_profiles enable row level security;

create policy "referrer_profiles: insert own"
  on public.referrer_profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "referrer_profiles: select own"
  on public.referrer_profiles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "referrer_profiles: update own"
  on public.referrer_profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ── work_history ─────────────────────────────────────────────
alter table public.work_history enable row level security;

create policy "work_history: manage own"
  on public.work_history for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ── education ────────────────────────────────────────────────
alter table public.education enable row level security;

create policy "education: manage own"
  on public.education for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ── relationships ────────────────────────────────────────────
alter table public.relationships enable row level security;

-- Both parties in a relationship can read it
create policy "relationships: read own"
  on public.relationships for select
  to authenticated
  using (auth.uid() = referrer_id or auth.uid() = looker_id);

-- The looker can confirm (update) a relationship they're part of
create policy "relationships: looker can update"
  on public.relationships for update
  to authenticated
  using (auth.uid() = looker_id)
  with check (auth.uid() = looker_id);


-- ── referrals ────────────────────────────────────────────────
alter table public.referrals enable row level security;

-- Both referrer and looker can read referrals they're part of
create policy "referrals: read own"
  on public.referrals for select
  to authenticated
  using (auth.uid() = referrer_id or auth.uid() = looker_id);

-- Only the referrer can insert/update referrals they own
create policy "referrals: referrer insert"
  on public.referrals for insert
  to authenticated
  with check (auth.uid() = referrer_id);

create policy "referrals: referrer update"
  on public.referrals for update
  to authenticated
  using (auth.uid() = referrer_id)
  with check (auth.uid() = referrer_id);


-- ── invites ──────────────────────────────────────────────────
alter table public.invites enable row level security;

-- Inviters can manage their own invites
create policy "invites: manage own"
  on public.invites for all
  to authenticated
  using (auth.uid() = inviter_id)
  with check (auth.uid() = inviter_id);

-- Anyone (including anon) can read an invite by id — needed for invite link signup
create policy "invites: public read by id"
  on public.invites for select
  to anon, authenticated
  using (true);
