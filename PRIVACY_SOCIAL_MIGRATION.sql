-- NEXOLY11 privacy, block and feed preference migration. Run AFTER SUPABASE_SETUP.sql.
alter table public.profiles add column if not exists is_private boolean not null default false;
create table if not exists public.user_blocks (
 blocker_id uuid not null references auth.users(id) on delete cascade,
 blocked_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(blocker_id,blocked_id), check(blocker_id<>blocked_id)
);
create table if not exists public.feed_preferences (
 user_id uuid primary key references auth.users(id) on delete cascade,
 interested_categories text[] not null default '{}',
 hidden_categories text[] not null default '{}',
 updated_at timestamptz not null default now()
);
create table if not exists public.follow_requests (
 requester_id uuid not null references auth.users(id) on delete cascade,
 target_id uuid not null references auth.users(id) on delete cascade,
 status text not null default 'pending' check(status in ('pending','accepted','rejected')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 primary key(requester_id,target_id), check(requester_id<>target_id)
);
alter table public.user_blocks enable row level security;
alter table public.feed_preferences enable row level security;
alter table public.follow_requests enable row level security;
drop policy if exists blocks_read_own on public.user_blocks;
create policy blocks_read_own on public.user_blocks for select to authenticated using(blocker_id=auth.uid());
drop policy if exists blocks_insert_own on public.user_blocks;
create policy blocks_insert_own on public.user_blocks for insert to authenticated with check(blocker_id=auth.uid());
drop policy if exists blocks_delete_own on public.user_blocks;
create policy blocks_delete_own on public.user_blocks for delete to authenticated using(blocker_id=auth.uid());
drop policy if exists prefs_read_own on public.feed_preferences;
create policy prefs_read_own on public.feed_preferences for select to authenticated using(user_id=auth.uid());
drop policy if exists prefs_write_own on public.feed_preferences;
create policy prefs_write_own on public.feed_preferences for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists requests_read_participant on public.follow_requests;
create policy requests_read_participant on public.follow_requests for select to authenticated using(requester_id=auth.uid() or target_id=auth.uid());
drop policy if exists requests_create_self on public.follow_requests;
create policy requests_create_self on public.follow_requests for insert to authenticated with check(requester_id=auth.uid() and status='pending');
drop policy if exists requests_update_target on public.follow_requests;
create policy requests_update_target on public.follow_requests for update to authenticated using(target_id=auth.uid()) with check(target_id=auth.uid());
drop policy if exists requests_delete_participant on public.follow_requests;
create policy requests_delete_participant on public.follow_requests for delete to authenticated using(requester_id=auth.uid() or target_id=auth.uid());
-- Hide posts/stories from blocked users and require an accepted follow for private accounts.
drop policy if exists posts_read on public.posts;
create policy posts_read on public.posts for select using (
 not exists(select 1 from public.user_blocks b where (b.blocker_id=auth.uid() and b.blocked_id=posts.user_id) or (b.blocker_id=posts.user_id and b.blocked_id=auth.uid()))
 and (auth.uid()=posts.user_id or coalesce((select p.is_private from public.profiles p where p.id=posts.user_id),false)=false
 or exists(select 1 from public.follows f where f.follower_id=auth.uid() and f.following_id=posts.user_id))
);
drop policy if exists stories_read on public.stories;
create policy stories_read on public.stories for select using (expires_at>now() and
 not exists(select 1 from public.user_blocks b where (b.blocker_id=auth.uid() and b.blocked_id=stories.user_id) or (b.blocker_id=stories.user_id and b.blocked_id=auth.uid()))
 and (auth.uid()=stories.user_id or coalesce((select p.is_private from public.profiles p where p.id=stories.user_id),false)=false
 or exists(select 1 from public.follows f where f.follower_id=auth.uid() and f.following_id=stories.user_id))
);
