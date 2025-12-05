// src/supabaseClient.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const URL = (typeof window !== 'undefined') ? (window._env?.NEXT_PUBLIC_SUPABASE_URL || window.location.origin.includes('localhost') ? '' : '') : '';
// Use environment-injected values (Vercel) in production; local dev set NEXT_PUBLIC_SUPABASE_URL / ANON_KEY
export const supabase = createClient(
  // prefer values injected by Vercel at runtime
  (window && window.__env && window.__env.NEXT_PUBLIC_SUPABASE_URL) || (window && window.NEXT_PUBLIC_SUPABASE_URL) || (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL) || '',
  (window && window.__env && window.__env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || (window && window.NEXT_PUBLIC_SUPABASE_ANON_KEY) || (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || ''
);
