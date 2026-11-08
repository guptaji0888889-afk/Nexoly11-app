# Nexoly11 MVP setup

1. Open Supabase project `qaexwsxxprvtkzidmwbx`.
2. SQL Editor → New query → paste all of `SUPABASE_SETUP.sql` → Run.
3. Authentication → URL Configuration: add `https://guptaji0888889-afk.github.io/Nexoly11-app/` to Site URL / Redirect URLs.
4. Upload the complete contents of this folder to the repository root (not the enclosing folder). Keep filenames exactly lowercase: `upload.html`, `index.html`, etc.
5. Enable email/password in Supabase Authentication. Email confirmation can be turned off temporarily for testing, or verify signup emails.
6. Open `signup.html`, create two test accounts, sign in, publish a photo/video, test feed/reels/stories/comments/likes/messages.

## Included in this MVP
- Supabase email/password signup and login
- Profile creation and editing
- Photo/video uploads to Supabase Storage
- Public feed and video-only Reels feed
- 24-hour stories
- Likes and comments
- Basic one-to-one text messages

## Honest limits
This is a functional early MVP, not a production Instagram-scale system. It has not been security-reviewed or load-tested for 100,000 active users. The media bucket is public for this prototype. Before public launch, add moderation/reporting, rate limits, account recovery, signed/private media where appropriate, video transcoding to 480p, CDN, pagination, observability, backups, abuse prevention, and load testing. Do not promise earnings/rewards or video calling; those are not implemented.

## Privacy / Block / Feed Preferences (required)
Run `PRIVACY_SOCIAL_MIGRATION.sql` in Supabase SQL Editor AFTER `SUPABASE_SETUP.sql`. It adds private-account visibility rules, block lists, follow-request storage, and interested/not-interested category preferences. The dashboard privacy controls and block/unblock list require this migration. Private account protects post/story reads at the database policy level. Follow-request approval UI and workflow still need to be connected before treating private follow requests as fully production-ready.
