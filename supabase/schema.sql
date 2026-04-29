-- ============================================================
-- Refr — Database Schema
-- Run this in the Supabase SQL Editor (supabase.com → project → SQL Editor → New query)
-- ============================================================

-- users
create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  name        text,
  user_type   text check (user_type in ('looker', 'referrer')),
  created_at  timestamp default now()
);

-- looker_profiles
create table if not exists looker_profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references users(id) on delete cascade,
  target_role text,
  seniority   text check (seniority in ('junior', 'mid', 'senior', 'lead', 'executive')),
  industries  text[],
  visible     boolean default true,
  created_at  timestamp default now()
);

-- referrer_profiles
create table if not exists referrer_profiles (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references users(id) on delete cascade,
  industries          text[],
  network_description text,
  created_at          timestamp default now()
);

-- work_history
create table if not exists work_history (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references users(id) on delete cascade,
  company_name text,
  job_title    text,
  start_date   text,
  end_date     text,
  description  text,
  created_at   timestamp default now()
);

-- education
create table if not exists education (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references users(id) on delete cascade,
  school_name     text,
  degree_type     text,
  field_of_study  text,
  graduation_year text,
  created_at      timestamp default now()
);

-- relationships
create table if not exists relationships (
  id                  uuid primary key default gen_random_uuid(),
  referrer_id         uuid references users(id) on delete cascade,
  looker_id           uuid references users(id) on delete cascade,
  context             text check (context in ('worked_together', 'same_company', 'same_school', 'professional_community')),
  overlap_company     text,
  overlap_school      text,
  confirmed_by_looker boolean default false,
  created_at          timestamp default now()
);

-- referrals
create table if not exists referrals (
  id                    uuid primary key default gen_random_uuid(),
  referrer_id           uuid references users(id) on delete cascade,
  looker_id             uuid references users(id) on delete cascade,
  company_name          text,
  role_signal           text,
  hiring_manager_email  text,
  email_body            text,
  vouch_text            text,
  status                text check (status in ('sent', 'in_process', 'hired', 'not_progressed')) default 'sent',
  created_at            timestamp default now(),
  updated_at            timestamp default now()
);

-- invites
create table if not exists invites (
  id            uuid primary key default gen_random_uuid(),
  inviter_id    uuid references users(id) on delete cascade,
  inviter_type  text check (inviter_type in ('looker', 'referrer')),
  invitee_email text,
  invitee_name  text,
  status        text check (status in ('invited', 'joined')) default 'invited',
  created_at    timestamp default now()
);

-- ============================================================
-- Indexes for common query patterns
-- ============================================================
create index if not exists looker_profiles_user_id_idx  on looker_profiles(user_id);
create index if not exists referrer_profiles_user_id_idx on referrer_profiles(user_id);
create index if not exists work_history_user_id_idx      on work_history(user_id);
create index if not exists education_user_id_idx         on education(user_id);
create index if not exists relationships_referrer_idx    on relationships(referrer_id);
create index if not exists relationships_looker_idx      on relationships(looker_id);
create index if not exists referrals_referrer_idx        on referrals(referrer_id);
create index if not exists referrals_looker_idx          on referrals(looker_id);
create index if not exists invites_inviter_idx           on invites(inviter_id);

-- ============================================================
-- Auto-update updated_at on referrals
-- ============================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists referrals_set_updated_at on referrals;
create trigger referrals_set_updated_at
  before update on referrals
  for each row execute function set_updated_at();
