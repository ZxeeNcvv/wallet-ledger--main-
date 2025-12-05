// public/supabaseClient.js
import { createClient } from './supabase.js'; // Assuming local file import is working

const SUPABASE_URL = 'https://fbgihalnvblcktfpavcj.supabase.co'; 
const SUPABASE_ANON_KEY = 'YOUR_FRESHLY_COPIED_KEY_HERE'; // <--- PASTE THE NEW KEY HERE

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
