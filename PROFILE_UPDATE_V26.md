NEXOLY11 Profile UI update v26
- Redesigned profile page with Instagram-inspired avatar, posts/followers/following counts, edit/share/settings actions, highlights row, discovery section and 3-column media grid.
- Moved edit, privacy, saved posts, follow requests, blocked users, theme, notification, autoplay, data saver, activity status, language and logout controls into a dedicated Settings and activity overlay.
- Preserved existing Supabase profile/follow/post queries and existing IDs used by privacy/theme/settings scripts.
- Added profile avatar fallback and profile post grid loading.
- This is a frontend UI update. Backend capabilities still depend on the existing Supabase schema, RLS policies and storage setup; verify on two test accounts before public launch.
