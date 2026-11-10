# NEXOLY11 project audit — 8 Nov 2026

## Changes in this package
- Added account-level block/unblock, private-account follow requests with accept/reject, feed category preferences, persistent notification centre and notification triggers, plus story view/reaction tables in `PRIVACY_SOCIAL_MIGRATION.sql`.
- Added missing `js/privacy-controls.js` and `js/profile-settings.js` referenced by the profile page, plus `js/notifications.js`; previously those referenced files were absent.
- Added 7 appearance choices (Classic Dark, Clean Light, Auto, Ocean, Forest, Sunset, AMOLED), persistent device settings, and a feed media download control (browser/storage permissions may still restrict downloads).
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


## Profile repair follow-up (10 Nov 2026)
- Removed the duplicate profile-save click handler so profile edits are handled in one place and missing profile rows are reported instead of showing a false success.
- Expanded creator suggestions to sample the newest 100 profiles before filtering followed accounts.
- Added one-view-per-signed-in-user tracking for feed posts and displayed view counts on the home feed as well as the profile grid.
- Added a unique `(post_id, viewer_id)` index and compatibility column migration for post view upserts.
- Backend changes still require running `PRIVACY_SOCIAL_MIGRATION.sql` in the connected Supabase project; frontend ZIP alone cannot change the live database or Storage policies.

## Emergency code validation — 10 Nov 2026
- Fixed a JavaScript syntax error in `js/profile-ui.js` (`async let highlightGroups=[]` changed to `let highlightGroups=[]`). This error prevented the entire profile UI script from loading, including profile highlights and related controls.
- Ran `node --check` against every active file in `js/`; all passed after the fix.
- This frontend correction does not apply the required Supabase SQL migration, configure Storage/RLS, or publish the site. Those remain separate deployment steps.
