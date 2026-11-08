# NEXOLY11 project audit — 8 Nov 2026

## Changes in this package
- Promoted the newer Camera Studio page to the live `upload.html` route. It includes the timer, grid, mirror, beauty-softening, brightness, warmth, zoom, and multi-select post controls.
- Removed stale duplicate root-level `app.js`, `config.js`, `Upload.html`, and the now-promoted `upload (1).html`. The active JavaScript/configuration remain in `js/` and all page references use those paths.
- Kept the existing Supabase MVP and SQL setup; no schema was silently changed.

## Important implementation status
Working only when Supabase schema, Storage bucket, Auth settings, and RLS are correctly configured: signup/login, profile basics, feed, image/video upload, stories, likes, comments, basic messages, and follows where the follow table/policies exist.

Device-local/demo only: saved-post list, not-interested preferences, block list, private-account toggle, theme preference, and creator-studio preview controls. These are not secure cross-device social features.

Not implemented as production features: server-enforced private accounts, follow request accept/reject, story viewer/like/reply tracking, notification centre/push notifications, report/restrict workflows, reliable post downloads, video-call, AR face filters, video filter/audio rendering, moderation, and production-scale infrastructure.

## Before publishing
1. Upload the contents of this folder to the GitHub repository root (not the enclosing folder).
2. Run `SUPABASE_SETUP.sql` only if the setup has not already been run successfully; do not rerun blindly.
3. Verify Supabase Auth redirect URLs and the `nexoly-media` Storage bucket.
4. Test with two separate accounts on two devices/browsers. Verify RLS before inviting public users.

This is still an early MVP, not a production-ready or load-tested service. Never expose a Supabase service-role key in frontend code.
