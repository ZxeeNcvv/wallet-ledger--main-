// src/app.js
import { supabase } from './supabaseClient.js';
import * as auth from './auth.js';
import { renderAccounts, renderLedger } from './ui.js';

const $ = id => document.getElementById(id);

// elements
const emailEl = $('email'), passwordEl = $('password');
const btnSignup = $('btn-signup'), btnSignin = $('btn-signin'), btnSignout = $('btn-signout');
const userInfo = $('user-info'), dashboard = $('dashboard');

const accountsListEl = $('accounts-list');
const selTopup = $('topup-account'), topupAmt = $('topup-amount'), btnTopup = $('btn-topup');
const selFrom = $('transfer-from'), selTo = $('transfer-to'), transferAmt = $('transfer-amount'), btnTransfer = $('btn-transfer');
const selBuyer = $('purchase-buyer'), selMerchant = $('purchase-merchant'), purchaseAmt = $('purchase-amount'), btnPurchase = $('btn-purchase');
const ledgerList = $('ledger-list');

btnSignup.onclick = async () => {
  try {
    await auth.signUp(emailEl.value, passwordEl.value);
    alert('Sign-up successful. Check your email if confirmation is required.');
  } catch (e) { alert(e.message || e); }
};

btnSignin.onclick = async () => {
  try {
    await auth.signIn(emailEl.value, passwordEl.value);
    await setupUI();
  } catch (e) { alert(e.message || e); }
};

btnSignout.onclick = async () => {
  try {
    await auth.signOut();
    await setupUI();
  } catch (e) { console.error(e); }
};

auth.onAuthStateChange(() => setupUI());
window.addEventListener('load', () => setupUI());

async function setupUI() {
  const s = await supabase.auth.getSession();
  const session = s?.data?.session;
  if (!session) {
    userInfo.textContent = 'Not signed in';
    btnSignout.style.display = 'none';
    document.getElementById('dashboard').style.display = 'none';
    return;
  }

  const user = session.user;
  userInfo.textContent = `Signed in: ${user.email || user.id}`;
  btnSignout.style.display = 'inline-block';
  document.getElementById('dashboard').style.display = 'block';

  await refreshAccountsAndLedger();
}

async function refreshAccountsAndLedger() {
  const { data: accounts, error: aerr } = await supabase.from('accounts').select('account_id,user_id,balance,currency').order('created_at', { ascending: true });
  if (aerr) return alert(aerr.message || JSON.stringify(aerr));
  renderAccounts(accounts);

  // populate selectors
  [selTopup, selFrom, selTo, selBuyer, selMerchant].forEach(s => s.innerHTML = '');
  for (const a of accounts) {
    const opt = v => { const o = document.createElement('option'); o.value = v.account_id; o.textContent = `${v.account_id.slice(0,8)} — ${Number(v.balance).toFixed(2)}`; return o; };
    for (const sel of [selTopup, selFrom, selTo, selBuyer, selMerchant]) sel.appendChild(opt(a));
  }

  // ledger: last 50 entries
  const { data: ledger, error: lerr } = await supabase.from('ledger_entries').select('entry_id,transaction_id,account_id,debit,credit,balance_after,created_at').order('created_at', { ascending: false }).limit(50);
  if (lerr) return alert(lerr.message || JSON.stringify(lerr));
  renderLedger(ledger);
}

// helpers to get token
async function getAccessToken() {
  const s = await supabase.auth.getSession();
  return s?.data?.session?.access_token || '';
}

// Topup -> call serverless /api/topup
btnTopup.onclick = async () => {
  const account_id = selTopup.value;
  const amount = parseFloat(topupAmt.value);
  if (!amount || amount <= 0) return alert('Enter amount > 0');
  const token = await getAccessToken();

  const resp = await fetch('/api/topup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ account_id, amount })
  });
  const j = await resp.json();
  if (!resp.ok) return alert(j.error || JSON.stringify(j));
  alert('Topup successful: ' + (j.transaction_id || j.data || 'ok'));
  await refreshAccountsAndLedger();
};

// Transfer
btnTransfer.onclick = async () => {
  const from_account = selFrom.value, to_account = selTo.value;
  const amount = parseFloat(transferAmt.value);
  if (!amount || amount <= 0) return alert('Enter amount > 0');
  const token = await getAccessToken();

  if (from_account === to_account) return alert('Choose different accounts');

  const resp = await fetch('/api/transfer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ from: from_account, to: to_account, amount })
  });
  const j = await resp.json();
  if (!resp.ok) return alert(j.error || JSON.stringify(j));
  alert('Transfer succeeded: ' + (j.transaction_id || j.data || 'ok'));
  await refreshAccountsAndLedger();
};

// Purchase (merchant)
btnPurchase.onclick = async () => {
  const buyer = selBuyer.value, merchant = selMerchant.value;
  const amount = parseFloat(purchaseAmt.value);
  if (!amount || amount <= 0) return alert('Enter amount > 0');
  if (buyer === merchant) return alert('Buyer and merchant must differ');
  const token = await getAccessToken();

  const resp = await fetch('/api/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ buyer_account: buyer, merchant_account: merchant, amount })
  });
  const j = await resp.json();
  if (!resp.ok) return alert(j.error || JSON.stringify(j));
  alert('Purchase succeeded: ' + (j.transaction_id || j.data || 'ok'));
  await refreshAccountsAndLedger();
};
