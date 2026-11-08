# NEXOLY11 project audit — 8 Nov 2026

## Changes in this package
- Added account-level block/unblock, private-account follow requests with accept/reject, feed category preferences, persistent notification centre and notification triggers, plus story view/reaction tables in `PRIVACY_SOCIAL_MIGRATION.sql`.
- Added `js/privacy-controls.js`, `js/profile-settings.js`, `js/notifications.js`, and `js/nexoly-ai.js` to implement the page references for privacy controls, follow-request decisions, unblock actions, local settings, notification rendering, and in-app help.
- Added 7 appearance choices (Classic Dark, Clean Light, Auto, Ocean, Forest, Sunset, AMOLED) with palette application and persistent device settings.
- Added backend notification events for likes, comments, follows, follow requests and messages.
- Promoted the newer Camera Studio page to the live `upload.html` route. It includes the timer, grid, mirror, beauty-softening, brightness, warmth, zoom, and multi-select post controls.
- Removed stale duplicate root-level `app.js`, `config.js`, `Upload.html`, and the now-promoted `upload (1).html`. The active JavaScript/configuration remain in `js/` and all page references use those paths.
- Kept the existing Supabase MVP and SQL setup; no schema was silently changed.

## Important implementation status
Working only when Supabase schema, Storage bucket, Auth settings, and RLS are correctly configured: signup/login, profile basics, feed, image/video upload, stories, likes, comments, basic messages, and follows where the follow table/policies exist.

Device-local/demo only: saved-post list, not-interested post hiding, theme preference, and creator-studio preview controls. Block/unblock, private-account visibility, follow requests and notification records now use backend tables after the privacy migration is applied.

Still not complete as production features: push notifications, full story viewer/reply UI (tables are prepared but UI is pending), report/restrict workflows, guaranteed downloads across all browsers, video-call, true AI/AR face filters, permanent video filter/audio rendering, moderation, and production-scale infrastructure.

## Before publishing
1. Upload the contents of this folder to the GitHub repository root (not the enclosing folder).
2. Run `SUPABASE_SETUP.sql` only if the setup has not already been run successfully; do not rerun blindly.
3. Verify Supabase Auth redirect URLs and the `nexoly-media` Storage bucket.
4. Test with two separate accounts on two devices/browsers. Verify RLS before inviting public users.

This is still an early MVP, not a production-ready or load-tested service. Never expose a Supabase service-role key in frontend code.


## Required backend step for this update
After confirming the base setup is already applied, run `PRIVACY_SOCIAL_MIGRATION.sql` once in the Supabase SQL Editor. Do not rerun the base setup blindly. Test private follow requests, block visibility, notifications, and account access using two separate test accounts.
