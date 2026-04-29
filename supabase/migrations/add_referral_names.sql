-- Add denormalized name columns to referrals so both sides can display
-- names without cross-user RLS joins.
-- Run in Supabase SQL Editor.

alter table public.referrals
  add column if not exists looker_name   text,
  add column if not exists referrer_name text;
