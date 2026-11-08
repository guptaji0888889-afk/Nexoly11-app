-- NEXOLY11 privacy, block and feed preference migration. Run AFTER SUPABASE_SETUP.sql.
alter table public.profiles add column if not exists is_private boolean not null default false;
-- Create engagement tables before notification triggers reference them.
create table if not exists public.likes (post_id uuid not null references public.posts(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,created_at timestamptz not null default now(),primary key(post_id,user_id));
create table if not exists public.comments (id uuid primary key default gen_random_uuid(),post_id uuid not null references public.posts(id) on delete cascade,user_id uuid not null references auth.users(id) on delete cascade,body text not null check(char_length(body) between 1 and 2000),created_at timestamptz not null default now());

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

-- Notifications, story insights and safe private-follow workflow.
create table if not exists public.notifications (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 actor_id uuid references auth.users(id) on delete set null, type text not null check(type in ('like','comment','follow','follow_request','message','story_view','story_reply','mention')),
 entity_id uuid, body text not null default '', is_read boolean not null default false, created_at timestamptz not null default now()
);
create index if not exists notifications_user_created_idx on public.notifications(user_id,created_at desc);
alter table public.notifications enable row level security;
drop policy if exists notifications_read_own on public.notifications;
create policy notifications_read_own on public.notifications for select to authenticated using(user_id=auth.uid());
drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists notifications_insert_actor on public.notifications;
create policy notifications_insert_actor on public.notifications for insert to authenticated with check(actor_id=auth.uid());
create table if not exists public.story_views (
 story_id uuid not null references public.stories(id) on delete cascade, viewer_id uuid not null references auth.users(id) on delete cascade,
 viewed_at timestamptz not null default now(), primary key(story_id,viewer_id)
);
create table if not exists public.story_reactions (
 story_id uuid not null references public.stories(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade,
 reaction text not null default '❤️', created_at timestamptz not null default now(), primary key(story_id,user_id)
);
alter table public.story_views enable row level security;
alter table public.story_reactions enable row level security;
drop policy if exists story_views_read_related on public.story_views;
create policy story_views_read_related on public.story_views for select to authenticated using(viewer_id=auth.uid() or exists(select 1 from public.stories s where s.id=story_id and s.user_id=auth.uid()));
drop policy if exists story_views_insert_self on public.story_views;
create policy story_views_insert_self on public.story_views for insert to authenticated with check(viewer_id=auth.uid());
drop policy if exists story_reactions_read on public.story_reactions;
create policy story_reactions_read on public.story_reactions for select to authenticated using(true);
drop policy if exists story_reactions_write_self on public.story_reactions;
create policy story_reactions_write_self on public.story_reactions for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());

create or replace function public.n11_notify_activity() returns trigger language plpgsql security definer set search_path=public as $$
declare target uuid; actor uuid; kind text; entity uuid; bodytext text;
begin
 actor := auth.uid();
 if tg_table_name='likes' then select user_id into target from posts where id=new.post_id; kind:='like'; entity:=new.post_id; bodytext:='liked your post';
 elsif tg_table_name='comments' then select user_id into target from posts where id=new.post_id; kind:='comment'; entity:=new.post_id; bodytext:='commented on your post';
 elsif tg_table_name='follows' then target:=new.following_id; actor:=new.follower_id; kind:='follow'; entity:=new.following_id; bodytext:='started following you';
 elsif tg_table_name='follow_requests' then target:=new.target_id; actor:=new.requester_id; kind:='follow_request'; entity:=new.requester_id; bodytext:='requested to follow you';
 elsif tg_table_name='messages' then target:=new.recipient_id; actor:=new.sender_id; kind:='message'; entity:=new.id; bodytext:='sent you a message';
 end if;
 if target is not null and actor is distinct from target then insert into notifications(user_id,actor_id,type,entity_id,body) values(target,actor,kind,entity,bodytext); end if;
 return new;
end; $$;
drop trigger if exists n11_like_notify on public.likes;
create trigger n11_like_notify after insert on public.likes for each row execute function public.n11_notify_activity();
drop trigger if exists n11_comment_notify on public.comments;
create trigger n11_comment_notify after insert on public.comments for each row execute function public.n11_notify_activity();
drop trigger if exists n11_follow_notify on public.follows;
create trigger n11_follow_notify after insert on public.follows for each row execute function public.n11_notify_activity();
drop trigger if exists n11_request_notify on public.follow_requests;
create trigger n11_request_notify after insert on public.follow_requests for each row execute function public.n11_notify_activity();
drop trigger if exists n11_message_notify on public.messages;
create trigger n11_message_notify after insert on public.messages for each row execute function public.n11_notify_activity();

-- Accepting a private follow request creates the actual follow relationship.
create or replace function public.n11_accept_follow_request() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.status='accepted' and old.status is distinct from 'accepted' then
  insert into public.follows(follower_id,following_id) values(new.requester_id,new.target_id) on conflict do nothing;
 end if;
 return new;
end; $$;
drop trigger if exists n11_accept_request_follow on public.follow_requests;
create trigger n11_accept_request_follow after update of status on public.follow_requests for each row execute function public.n11_accept_follow_request();

-- Core engagement tables: required by the Like and Comment buttons.
create table if not exists public.likes (
 post_id uuid not null references public.posts(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(post_id,user_id)
);
create table if not exists public.comments (
 id uuid primary key default gen_random_uuid(),
 post_id uuid not null references public.posts(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 body text not null check(char_length(body) between 1 and 2000),
 created_at timestamptz not null default now()
);
create index if not exists comments_post_created_idx on public.comments(post_id,created_at);
alter table public.likes enable row level security;
alter table public.comments enable row level security;
drop policy if exists likes_read_all on public.likes;
create policy likes_read_all on public.likes for select to authenticated using(true);
drop policy if exists likes_insert_self on public.likes;
create policy likes_insert_self on public.likes for insert to authenticated with check(user_id=auth.uid());
drop policy if exists likes_delete_self on public.likes;
create policy likes_delete_self on public.likes for delete to authenticated using(user_id=auth.uid());
drop policy if exists comments_read_all on public.comments;
create policy comments_read_all on public.comments for select to authenticated using(true);
drop policy if exists comments_insert_self on public.comments;
create policy comments_insert_self on public.comments for insert to authenticated with check(user_id=auth.uid());
drop policy if exists comments_delete_self on public.comments;
create policy comments_delete_self on public.comments for delete to authenticated using(user_id=auth.uid());

-- Post view analytics and permanent creator highlights.
create table if not exists public.post_views (
 post_id uuid not null references public.posts(id) on delete cascade,
 viewer_id uuid references auth.users(id) on delete set null,
 viewed_at timestamptz not null default now()
);
create index if not exists post_views_post_idx on public.post_views(post_id);
alter table public.post_views enable row level security;
drop policy if exists post_views_insert_viewer on public.post_views;
create policy post_views_insert_viewer on public.post_views for insert to authenticated with check(viewer_id=auth.uid());
drop policy if exists post_views_read_owner on public.post_views;
create policy post_views_read_owner on public.post_views for select to authenticated using(exists(select 1 from public.posts p where p.id=post_id and p.user_id=auth.uid()));
create table if not exists public.story_highlights (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 story_id uuid references public.stories(id) on delete set null,
 title text not null default 'Highlights',
 media_url text not null,
 media_type text not null default 'image',
 created_at timestamptz not null default now()
);
alter table public.story_highlights enable row level security;
drop policy if exists highlights_read_all on public.story_highlights;
create policy highlights_read_all on public.story_highlights for select to authenticated using(true);
drop policy if exists highlights_manage_own on public.story_highlights;
create policy highlights_manage_own on public.story_highlights for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());

-- Refresh PostgREST's schema cache so newly-created tables are immediately visible.
notify pgrst, 'reload schema';
