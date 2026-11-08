# NEXOLY11 Master Update v25

This package retains the supplied project and adds the missing scripts referenced by its pages:
- `js/privacy-controls.js`: private-account toggle, follow-request accept/reject, block-list unblock, feed preference persistence.
- `js/profile-settings.js`: device-local preference storage and theme selection wiring.
- `js/notifications.js`: notification list and mark-as-read.
- `js/nexoly-ai.js`: local in-app help panel (not a hosted generative AI service).

Validation performed:
- JavaScript syntax checked with Node.js.
- Local HTML script/style/page references checked.

Important limitations:
- This is a static frontend MVP. Live behavior still depends on the Supabase project schema, RLS policies, Auth redirect configuration and `nexoly-media` Storage bucket.
- The supplied SQL migration has overlapping story table definitions/policies and must be reviewed against the actual live database before rerunning. Do not rerun SQL blindly.
- The app has not been browser-tested against the live Supabase project because no authenticated test accounts/database access were provided.
- True hosted AI, push notifications, full story interactions, video calling, real AR face filters, video transcoding and production security/load testing are not implemented.
- Never put a Supabase service-role key in frontend code.

Upload the CONTENTS of `Nexoly11-app-main` to the GitHub repository root, not the enclosing folder. Keep the existing Supabase URL and publishable key. Back up the repository and database before replacing files.
