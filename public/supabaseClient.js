// public/supabaseClient.js

// NOTE: We no longer need the import because 'supabase.js' is loaded
// as a standard script tag in index.html, making 'createClient' global.

const SUPABASE_URL = 'https://fbgihalnvblcktfpavcj.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiZ2loYWxudmJsY2t0ZnBhdmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NDc4NDUsImV4cCI6MjA4MDMyMzg0NX0.z_Dc3nk1piYLah73541DVN3ZaL_3lpqQAUxx6agUf3o'; 

// The createClient function is now available globally
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
