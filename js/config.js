// Public Supabase project settings. This publishable key is safe for browser use;
// database access must still be protected by Row Level Security policies.
window.NEXOLY_CONFIG={
  url:'https://qaexwsxxprvtkzidmwbx.supabase.co',
  key:'sb_publishable_LEvFzFYhxnenoBkPSwL1sA_EI-u9Htb',
  bucket:'nexoly-media'
};
// Each phone/browser stores its own session. The same account can sign in on
// multiple devices independently; signing in on one device does not log out another.
window.NEXOLY_AUTH_OPTIONS={
  auth:{
    persistSession:true,
    autoRefreshToken:true,
    detectSessionInUrl:true,
    flowType:'pkce',
    storage:window.localStorage
  }
};
