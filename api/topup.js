// api/topup.js (serverless)
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const svc = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Missing token' });

    const { data: userData, error: userErr } = await authClient.auth.getUser(token);
    if (userErr || !userData?.user) return res.status(401).json({ error: 'Invalid token' });
    const actor = userData.user.id;

    const { account_id, amount } = req.body;
    if (!account_id || !amount) return res.status(400).json({ error: 'Missing fields' });

    const { data, error } = await svc.rpc('topup_account', { p_account: account_id, p_amount: amount, p_actor: actor });
    if (error) return res.status(400).json({ error: error.message || error });
    return res.status(200).json({ transaction_id: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal_error' });
  }
}
