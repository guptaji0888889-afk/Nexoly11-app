# NEXOLY11 🇮🇳 — consolidated Supabase MVP

This package removes the old localStorage/demo home page and the duplicate capitalized `Upload.html`. The root `index.html` now loads the Supabase-backed feed and stories from `js/app.js`.

## Pages
- `signup.html`, `login.html`: Supabase email/password authentication
- `index.html`: persistent feed + 24-hour stories
- `reels.html`: video feed
- `upload.html`: photo/video/story upload, preview filters, local audio preview
- `dashboard.html`: profile and logout
- `messages.html`: basic one-to-one text messages

## Deploy
Upload the **contents** of this folder to the GitHub repository root, preserving folder structure and lowercase filenames. Then open the deployed `signup.html` or `login.html`.

Supabase project URL and browser publishable key are in `js/config.js`. A publishable/anon key is intended for browser use; never put a service-role key in frontend files.

If the database/storage setup has not been run, follow `BACKEND_SETUP.md` and run `SUPABASE_SETUP.sql` in the Supabase SQL Editor. If it was already run successfully, do not repeat setup just for this code update.

## Honest feature limits
- Feed, auth, photo/video posts, stories, likes, comments, basic messages and profile depend on the Supabase schema, RLS policies and Storage bucket being configured correctly.
- The filter controls and selected audio currently affect local preview only. They are **not** rendered into the uploaded video and audio is **not** attached to the published post.
- This is an early MVP, not a production or 100,000-active-user-ready service. No load test, security audit, video transcoding, licensed music catalog, push notifications, content moderation/reporting, or production observability is included.


## Creator Studio update
- Create tabs: Post, Reel, Story
- Camera capture for photo and video recording (HTTPS required)
- Front/back camera switch
- Gallery media selection
- Preview filters, emoji stickers and text overlay
- Stories expire after 24 hours using the existing stories table
- Reels publish as video posts and appear in the Reels feed

Note: advanced face-tracking AR filters and permanently baking video filters/watermarks into exported video require a dedicated video/AR processing pipeline.
