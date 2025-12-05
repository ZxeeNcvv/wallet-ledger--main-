// src/ui.js
export function renderAccounts(accounts) {
  const list = document.getElementById('accounts-list');
  list.innerHTML = '';
  for (const a of accounts) {
    const li = document.createElement('li');
    li.textContent = `${a.account_id.slice(0,8)} — ${Number(a.balance).toFixed(2)} ${a.currency}`;
    list.appendChild(li);
  }
}

export function renderLedger(entries) {
  const list = document.getElementById('ledger-list');
  list.innerHTML = '';
  for (const e of entries) {
    const li = document.createElement('li');
    const ts = new Date(e.created_at).toLocaleString();
    li.textContent = `${ts} | ${e.account_id.slice(0,8)} | debit:${Number(e.debit).toFixed(2)} credit:${Number(e.credit).toFixed(2)} bal:${Number(e.balance_after).toFixed(2)}`;
    list.appendChild(li);
  }
}
