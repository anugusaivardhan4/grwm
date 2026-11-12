-- GRWM: wardrobe items + private photo storage.
-- Run once in Supabase: SQL Editor → New query → paste all of this → Run.
-- Safe to run again: it skips anything that already exists.

-- 1. The table that stores each clothing item -------------------------------
create table if not exists public.wardrobe_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 80),
  category    text not null check (category in ('top','bottom','dress','outerwear','shoes','accessory')),
  colour      text check (colour is null or char_length(colour) <= 30),
  season      text not null default 'all' check (season in ('all','spring','summer','autumn','winter')),
  image_path  text not null,
  created_at  timestamptz not null default now()
);

create index if not exists wardrobe_items_user_created_idx
  on public.wardrobe_items (user_id, created_at desc);

-- 2. Row Level Security: everyone only ever sees and changes their own clothes
alter table public.wardrobe_items enable row level security;

drop policy if exists "Users read own items"   on public.wardrobe_items;
drop policy if exists "Users add own items"    on public.wardrobe_items;
drop policy if exists "Users update own items" on public.wardrobe_items;
drop policy if exists "Users delete own items" on public.wardrobe_items;

create policy "Users read own items" on public.wardrobe_items
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "Users add own items" on public.wardrobe_items
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "Users update own items" on public.wardrobe_items
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Users delete own items" on public.wardrobe_items
  for delete to authenticated using ((select auth.uid()) = user_id);

-- 3. A private bucket for photos (max 5 MB, images only) --------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wardrobe', 'wardrobe', false, 5242880,
        array['image/jpeg','image/png','image/webp','image/heic','image/heif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Photos live in a folder named after the user's id: wardrobe/<user id>/<file>.
-- These rules only let people touch files inside their own folder.
drop policy if exists "Users read own photos"   on storage.objects;
drop policy if exists "Users upload own photos" on storage.objects;
drop policy if exists "Users delete own photos" on storage.objects;

create policy "Users read own photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'wardrobe' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users upload own photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'wardrobe' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users delete own photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'wardrobe' and (storage.foldername(name))[1] = (select auth.uid())::text);
