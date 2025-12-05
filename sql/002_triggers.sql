-- 002_triggers.sql
create or replace function fn_audit_transaction() returns trigger language plpgsql as $$
begin
  insert into audit_logs(who, action, details)
  values (coalesce((select email from users where user_id = NEW.requested_by), 'system'),
          'transaction_created',
          jsonb_build_object('transaction_id', NEW.transaction_id, 'type', NEW.type, 'amount', NEW.amount));
  return NEW;
end;
$$;

drop trigger if exists trg_audit_transaction on transactions;
create trigger trg_audit_transaction
after insert on transactions
for each row execute function fn_audit_transaction();

create or replace function fn_audit_ledger() returns trigger language plpgsql as $$
begin
  insert into audit_logs(who, action, details)
  values ('system', 'ledger_entry', jsonb_build_object(
    'entry_id', NEW.entry_id,
    'transaction_id', NEW.transaction_id,
    'account_id', NEW.account_id,
    'debit', NEW.debit,
    'credit', NEW.credit,
    'balance_after', NEW.balance_after
  ));
  return NEW;
end;
$$;

drop trigger if exists trg_audit_ledger on ledger_entries;
create trigger trg_audit_ledger
after insert on ledger_entries
for each row execute function fn_audit_ledger();
