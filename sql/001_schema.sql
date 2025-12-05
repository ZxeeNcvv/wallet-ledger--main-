-- 001_schema.sql
-- Enable extensions
create extension if not exists "pgcrypto";

-- Users mirror (optional; Supabase Auth also exists)
create table if not exists users (
  user_id uuid primary key default gen_random_uuid(),
  email text unique,
  created_at timestamptz default now()
);

-- Accounts
create table if not exists accounts (
  account_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(user_id) on delete cascade,
  balance numeric(20,2) not null default 0 check (balance >= 0),
  currency text not null default 'PHP',
  created_at timestamptz default now()
);

-- Transactions (logical grouping)
create table if not exists transactions (
  transaction_id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('topup','transfer','purchase','refund','reverse')),
  requested_by uuid references users(user_id),
  status text not null default 'pending',
  amount numeric(20,2) not null check (amount >= 0),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Ledger entries (double-entry approach)
create table if not exists ledger_entries (
  entry_id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references transactions(transaction_id) on delete cascade,
  account_id uuid not null references accounts(account_id) on delete cascade,
  debit numeric(20,2) default 0 check (debit >= 0),
  credit numeric(20,2) default 0 check (credit >= 0),
  balance_after numeric(20,2) not null check (balance_after >= 0),
  created_at timestamptz default now(),
  check ( (debit > 0 and credit = 0) or (credit > 0 and debit = 0) )
);

-- Audit logs
create table if not exists audit_logs (
  id serial primary key,
  who text,
  action text,
  details jsonb,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_accounts_user on accounts(user_id);
create index if not exists idx_ledger_account on ledger_entries(account_id);
create index if not exists idx_transactions_requested_by on transactions(requested_by);
