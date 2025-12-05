-- 003_functions.sql
-- Top-up (credit)
create or replace function topup_account(
  p_account uuid,
  p_amount numeric,
  p_actor uuid
) returns uuid language plpgsql as $$
declare
  v_txn_id uuid := gen_random_uuid();
  v_balance numeric;
begin
  if p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;

  select balance into v_balance from accounts where account_id = p_account for update;
  if not found then raise exception 'account not found'; end if;

  insert into transactions(transaction_id, type, requested_by, status, amount, metadata)
  values (v_txn_id, 'topup', p_actor, 'pending', p_amount, jsonb_build_object('account', p_account));

  insert into ledger_entries(transaction_id, account_id, debit, credit, balance_after)
  values (v_txn_id, p_account, 0, p_amount, v_balance + p_amount);

  update accounts set balance = balance + p_amount where account_id = p_account;

  update transactions set status = 'succeeded' where transaction_id = v_txn_id;

  return v_txn_id;
exception when others then
  begin
    update transactions set status = 'failed' where transaction_id = v_txn_id;
  exception when others then null;
  end;
  raise;
end;
$$;

-- Transfer between two accounts (atomic)
create or replace function transfer_funds(
  p_from_account uuid,
  p_to_account uuid,
  p_amount numeric,
  p_actor uuid
) returns uuid language plpgsql as $$
declare
  v_txn_id uuid := gen_random_uuid();
  v_from_balance numeric;
  v_to_balance numeric;
begin
  if p_amount <= 0 then raise exception 'amount must be positive'; end if;
  if p_from_account = p_to_account then raise exception 'cannot transfer to same account'; end if;

  -- deterministic locking order to avoid deadlocks
  if p_from_account < p_to_account then
    select balance into v_from_balance from accounts where account_id = p_from_account for update;
    select balance into v_to_balance from accounts where account_id = p_to_account for update;
  else
    select balance into v_to_balance from accounts where account_id = p_to_account for update;
    select balance into v_from_balance from accounts where account_id = p_from_account for update;
  end if;

  if v_from_balance is null or v_to_balance is null then
    raise exception 'account not found';
  end if;

  if v_from_balance < p_amount then
    raise exception 'insufficient funds';
  end if;

  insert into transactions(transaction_id, type, requested_by, status, amount, metadata)
  values (v_txn_id, 'transfer', p_actor, 'pending', p_amount, jsonb_build_object('from', p_from_account, 'to', p_to_account));

  insert into ledger_entries(transaction_id, account_id, debit, credit, balance_after)
  values (v_txn_id, p_from_account, p_amount, 0, v_from_balance - p_amount);

  insert into ledger_entries(transaction_id, account_id, debit, credit, balance_after)
  values (v_txn_id, p_to_account, 0, p_amount, v_to_balance + p_amount);

  update accounts set balance = balance - p_amount where account_id = p_from_account;
  update accounts set balance = balance + p_amount where account_id = p_to_account;

  update transactions set status = 'succeeded' where transaction_id = v_txn_id;

  return v_txn_id;
exception when others then
  begin
    update transactions set status = 'failed' where transaction_id = v_txn_id;
  exception when others then null;
  end;
  raise;
end;
$$;

-- Merchant purchase (alias for transfer, kept separate for clarity)
create or replace function merchant_purchase(
  p_buyer_account uuid,
  p_merchant_account uuid,
  p_amount numeric,
  p_actor uuid
) returns uuid language plpgsql as $$
begin
  return transfer_funds(p_buyer_account, p_merchant_account, p_amount, p_actor);
end;
$$;
