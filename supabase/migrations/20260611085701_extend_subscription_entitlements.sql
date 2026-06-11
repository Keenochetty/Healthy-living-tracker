-- Subscription entitlements are written only by trusted billing verification
-- services. Authenticated clients can read their accessible family status.
alter table public.subscriptions
  add column if not exists platform text,
  add column if not exists product_id text,
  add column if not exists entitlement_tier text not null default 'free',
  add column if not exists trial_end timestamptz,
  add column if not exists will_renew boolean,
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists last_verified_at timestamptz;

update public.subscriptions
set entitlement_tier = coalesce(nullif(plan, ''), 'free')
where entitlement_tier = 'free' and plan <> 'free';

alter table public.subscriptions enable row level security;

drop policy if exists "Users can create own subscriptions" on public.subscriptions;
drop policy if exists "Users can update own subscriptions" on public.subscriptions;
drop policy if exists "Users can create accessible subscriptions" on public.subscriptions;
drop policy if exists "Users can update own accessible subscriptions" on public.subscriptions;
drop policy if exists "Users can delete own accessible subscriptions" on public.subscriptions;

revoke insert, update, delete on public.subscriptions from authenticated;
grant select on public.subscriptions to authenticated;
