-- scripts/seed.sql
-- Insert demo users and accounts (MANUALLY copy user_id to Supabase auth.user if you want)
insert into users(user_id, email) values (gen_random_uuid(), 'alice@example.com');
insert into users(user_id, email) values (gen_random_uuid(), 'bob@example.com');

-- create accounts with starting balances (replace user_id with actual ones from above)
-- Example: run `select user_id,email from users;` to copy ids and then:
-- insert into accounts(user_id,balance) values ('<alice-id>', 1000.00);
-- insert into accounts(user_id,balance) values ('<bob-id>', 500.00);
