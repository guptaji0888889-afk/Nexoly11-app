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


## NEXOLY11 social engagement and creator dashboard update
1. Open Supabase Dashboard → SQL Editor.
2. Run `SUPABASE_SETUP.sql` first if this is a fresh project.
3. Run `PRIVACY_SOCIAL_MIGRATION.sql` after the base setup. This migration creates the missing `likes` and `comments` tables, post-view analytics and story highlights, enables row-level security, and asks PostgREST to reload its schema cache.
4. Confirm the Storage bucket named `nexoly-media` exists and is public for this static MVP, or replace public URLs with signed URLs before using private media.
5. Test with two separate accounts: publish, like, comment, share, download, follow, send a message, and create a story highlight.

The upload path now resizes large images to a maximum 1920px edge and JPEG-optimizes them before upload. Videos are not transcoded in-browser; large video upload speed still depends on the user's network and Supabase Storage region. The NEXOLY11 AI panel currently provides local in-app help responses; it is not connected to a hosted generative-AI model.


## Profile, highlights and view-count repair
After the base `SUPABASE_SETUP.sql` is already installed, run the complete `PRIVACY_SOCIAL_MIGRATION.sql` once in Supabase SQL Editor. It creates the `story_highlights` table/policies and post-view table/policies/index required by profile highlights and view counts. Confirm the `nexoly-media` bucket exists and that authenticated users can upload only into their own `<user-id>/...` folder. Never paste a service-role key into `js/config.js`.

## Login on a second phone / loading repair notes
- The browser client stores a separate session on each phone/browser. The same email and password can be used on more than one device; signing in on one device does not invalidate another device.
- In Supabase → Authentication → Providers → Email, keep Email enabled. If Confirm email is enabled, each new account must verify its email before password login succeeds.
- In Supabase → Authentication → URL Configuration, add the deployed GitHub Pages base URL and `https://guptaji0888889-afk.github.io/Nexoly11-app/login.html` to Redirect URLs.
- Never put a service-role/secret key in either config file. Keep only the publishable/anon key in browser code and protect tables with RLS.
- The updated app applies a 20-second network timeout and loads the home feed and stories independently so a slow/failing Stories request does not hold the feed in a permanent Loading state.
- If a specific screen still shows `permission denied` or `row-level security`, copy the exact message and the screen name. Login credentials are checked by Supabase Auth; table/storage permission errors are fixed in the corresponding table/storage RLS policy, not by disabling RLS.


## Nexoly11 AI — hosted AI connection
The AI chat calls the Supabase Edge Function `nexoly-ai`. The browser does not contain an OpenAI API key. To activate it:

1. Install the Supabase CLI and sign in: `supabase login`.
2. From this project folder, link the project: `supabase link --project-ref qaexwsxxprvtkzidmwbx`.
3. Add the secret (use your own OpenAI API key; never send it in chat or commit it): `supabase secrets set OPENAI_API_KEY=your_key_here`.
4. Deploy the function: `supabase functions deploy nexoly-ai`. Keep JWT verification enabled (the default).
5. In the deployed website, sign in and open Messages → Chat with AI.

The function checks the caller's Supabase access token and calls OpenAI server-side. If it reports missing API key, invalid API key, quota, or billing errors, the project owner must correct the OpenAI API account/secret. AI responses may incur API charges.
