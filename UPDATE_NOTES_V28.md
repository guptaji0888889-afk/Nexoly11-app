NEXOLY11 v28 — Profile & Settings UI

- Removed always-visible Delete controls from profile media tiles.
- Added per-post three-dot menu: View, Share, Save, Edit caption, Delete. Delete is owner-scoped and asks for confirmation.
- Reworked Settings and activity into a single vertical list with individual panels.
- Preserved Supabase configuration, SQL files, existing app pages and user data schema.

Deployment: replace project files with this ZIP while retaining your existing Supabase project and data. Do not rerun SQL migrations just for this frontend update. Test the menu and each setting while logged in before public rollout.
