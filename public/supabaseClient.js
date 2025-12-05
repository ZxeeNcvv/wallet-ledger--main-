// public/supabaseClient.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Ensure these two lines contain your ACTUAL string values inside quotes
const SUPABASE_URL = 'https://fbgihalnvblcktfpavcj.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiZ2loYWxudmJsY2t0ZnBhdmNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NDc4NDUsImV4cCI6MjA4MDMzMjg0NX0.z_Dc3nk1piYLah73541DVN3ZaL_3lpqQAUxx6agUf3o'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
