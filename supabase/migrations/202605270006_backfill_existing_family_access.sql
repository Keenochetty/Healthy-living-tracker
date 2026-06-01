insert into public.family_memberships (family_id, user_id, role)
select id, owner_id, 'owner'::public.family_role
from public.families
on conflict (family_id, user_id) do nothing;

update public.profiles p
set default_family_id = f.id
from public.families f
where f.owner_id = p.id
  and p.default_family_id is null;

insert into public.subscriptions (family_id, user_id, plan, status)
select id, owner_id, 'free', 'active'
from public.families
on conflict (family_id, user_id) do nothing;
