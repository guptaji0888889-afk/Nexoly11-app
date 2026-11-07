-- NEXOLY11 MVP schema. Run once in Supabase SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 username text unique not null check (char_length(username) between 3 and 24),
 full_name text not null default '', bio text not null default '', avatar_url text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.posts (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 media_url text not null, media_path text not null, media_type text not null check(media_type in ('image','video')),
 caption text not null default '', category text not null default 'Other', created_at timestamptz not null default now()
);
create table if not exists public.stories (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 media_url text not null, media_path text not null, media_type text not null check(media_type in ('image','video')),
 caption text not null default '', created_at timestamptz not null default now(), expires_at timestamptz not null default (now()+interval '24 hours')
);
create table if not exists public.likes (
 post_id uuid not null references public.posts(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(post_id,user_id)
);
create table if not exists public.comments (
 id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade, body text not null check(char_length(body) between 1 and 2000), created_at timestamptz not null default now()
);
create table if not exists public.follows (
 follower_id uuid not null references auth.users(id) on delete cascade, following_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(follower_id,following_id), check(follower_id<>following_id)
);
create table if not exists public.messages (
 id uuid primary key default gen_random_uuid(), sender_id uuid not null references auth.users(id) on delete cascade,
 recipient_id uuid not null references auth.users(id) on delete cascade, body text not null check(char_length(body) between 1 and 2000),
 created_at timestamptz not null default now(), check(sender_id<>recipient_id)
);
create index if not exists posts_created_idx on public.posts(created_at desc);
create index if not exists stories_expiry_idx on public.stories(expires_at desc);
create index if not exists comments_post_idx on public.comments(post_id,created_at);
create index if not exists messages_pair_idx on public.messages(sender_id,recipient_id,created_at desc);
create index if not exists messages_recipient_idx on public.messages(recipient_id,created_at desc);
create index if not exists follows_following_idx on public.follows(following_id);
-- Create profile after email signup; client upsert also supports profile edits.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.profiles(id,username,full_name)
 values(new.id, coalesce(nullif(new.raw_user_meta_data->>'username',''), 'user_'||substr(new.id::text,1,8)), coalesce(new.raw_user_meta_data->>'full_name',''))
 on conflict(id) do nothing;
 return new;
end; $$;
drop trigger if exists on_auth_user_created_nexoly on auth.users;
create trigger on_auth_user_created_nexoly after insert on auth.users for each row execute procedure public.handle_new_user();
-- RLS
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.stories enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;
alter table public.messages enable row level security;
drop policy if exists profiles_read on public.profiles; create policy profiles_read on public.profiles for select using(true);
drop policy if exists profiles_insert_self on public.profiles; create policy profiles_insert_self on public.profiles for insert to authenticated with check(id=auth.uid());
drop policy if exists profiles_update_self on public.profiles; create policy profiles_update_self on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
drop policy if exists posts_read on public.posts; create policy posts_read on public.posts for select using(true);
drop policy if exists posts_insert_self on public.posts; create policy posts_insert_self on public.posts for insert to authenticated with check(user_id=auth.uid());
drop policy if exists posts_delete_self on public.posts; create policy posts_delete_self on public.posts for delete to authenticated using(user_id=auth.uid());
drop policy if exists stories_read on public.stories; create policy stories_read on public.stories for select using(expires_at>now());
drop policy if exists stories_insert_self on public.stories; create policy stories_insert_self on public.stories for insert to authenticated with check(user_id=auth.uid());
drop policy if exists stories_delete_self on public.stories; create policy stories_delete_self on public.stories for delete to authenticated using(user_id=auth.uid());
drop policy if exists likes_read on public.likes; create policy likes_read on public.likes for select using(true);
drop policy if exists likes_insert_self on public.likes; create policy likes_insert_self on public.likes for insert to authenticated with check(user_id=auth.uid());
drop policy if exists likes_delete_self on public.likes; create policy likes_delete_self on public.likes for delete to authenticated using(user_id=auth.uid());
drop policy if exists comments_read on public.comments; create policy comments_read on public.comments for select using(true);
drop policy if exists comments_insert_self on public.comments; create policy comments_insert_self on public.comments for insert to authenticated with check(user_id=auth.uid());
drop policy if exists comments_delete_self on public.comments; create policy comments_delete_self on public.comments for delete to authenticated using(user_id=auth.uid());
drop policy if exists follows_read on public.follows; create policy follows_read on public.follows for select using(true);
drop policy if exists follows_insert_self on public.follows; create policy follows_insert_self on public.follows for insert to authenticated with check(follower_id=auth.uid());
drop policy if exists follows_delete_self on public.follows; create policy follows_delete_self on public.follows for delete to authenticated using(follower_id=auth.uid());
drop policy if exists messages_read_participant on public.messages; create policy messages_read_participant on public.messages for select to authenticated using(sender_id=auth.uid() or recipient_id=auth.uid());
drop policy if exists messages_insert_sender on public.messages; create policy messages_insert_sender on public.messages for insert to authenticated with check(sender_id=auth.uid());
drop policy if exists messages_delete_sender on public.messages; create policy messages_delete_sender on public.messages for delete to authenticated using(sender_id=auth.uid());
-- Public media for this prototype. Use private buckets + signed URLs before sensitive content/production.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('nexoly-media','nexoly-media',true,52428800,array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm']) on conflict(id) do update set public=true,file_size_limit=52428800,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists nexoly_media_public_read on storage.objects; create policy nexoly_media_public_read on storage.objects for select using(bucket_id='nexoly-media');
drop policy if exists nexoly_media_insert_own on storage.objects; create policy nexoly_media_insert_own on storage.objects for insert to authenticated with check(bucket_id='nexoly-media' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists nexoly_media_delete_own on storage.objects; create policy nexoly_media_delete_own on storage.objects for delete to authenticated using(bucket_id='nexoly-media' and (storage.foldername(name))[1]=auth.uid()::text);
