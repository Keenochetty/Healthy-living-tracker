drop policy if exists "Owners can manage families" on public.families;
drop policy if exists "Owners can manage family members" on public.family_members;

drop policy if exists "Users can read accessible family members" on public.family_members;

drop policy if exists "Admins can manage memberships" on public.family_memberships;
drop policy if exists "Admins can insert memberships" on public.family_memberships;
create policy "Admins can insert memberships" on public.family_memberships for insert
to authenticated with check ((select private.user_can_admin_family(family_id)));
drop policy if exists "Admins can update memberships" on public.family_memberships;
create policy "Admins can update memberships" on public.family_memberships for update
to authenticated using ((select private.user_can_admin_family(family_id)))
with check ((select private.user_can_admin_family(family_id)));
drop policy if exists "Admins can delete memberships" on public.family_memberships;
create policy "Admins can delete memberships" on public.family_memberships for delete
to authenticated using ((select private.user_can_admin_family(family_id)));

drop policy if exists "Admins can manage family invites" on public.family_invites;
drop policy if exists "Admins can insert family invites" on public.family_invites;
create policy "Admins can insert family invites" on public.family_invites for insert
to authenticated with check ((select private.user_can_admin_family(family_id)) and invited_by_user_id = (select auth.uid()));
drop policy if exists "Admins can update family invites" on public.family_invites;
create policy "Admins can update family invites" on public.family_invites for update
to authenticated using ((select private.user_can_admin_family(family_id)))
with check ((select private.user_can_admin_family(family_id)));
drop policy if exists "Admins can delete family invites" on public.family_invites;
create policy "Admins can delete family invites" on public.family_invites for delete
to authenticated using ((select private.user_can_admin_family(family_id)));

drop policy if exists "Users can read own invites" on public.family_invites;
create policy "Users can read own invites" on public.family_invites for select
to authenticated using (
  lower(invited_email) = lower(coalesce((select auth.jwt())->>'email', ''))
  or (select private.user_has_family_access(family_id))
);

create index if not exists ai_chats_created_by_user_id_idx on public.ai_chats(created_by_user_id);
create index if not exists ai_chats_family_member_id_idx on public.ai_chats(family_member_id);
create index if not exists ai_messages_attachment_document_id_idx on public.ai_messages(attachment_document_id);
create index if not exists ai_messages_created_by_user_id_idx on public.ai_messages(created_by_user_id);
create index if not exists ai_messages_family_id_idx on public.ai_messages(family_id);
create index if not exists ai_messages_family_member_id_idx on public.ai_messages(family_member_id);
create index if not exists doctor_visits_created_by_user_id_idx on public.doctor_visits(created_by_user_id);
create index if not exists doctor_visits_family_member_id_idx on public.doctor_visits(family_member_id);
create index if not exists documents_created_by_user_id_idx on public.documents(created_by_user_id);
create index if not exists documents_family_member_id_idx on public.documents(family_member_id);
create index if not exists documents_uploaded_by_user_id_idx on public.documents(uploaded_by_user_id);
create index if not exists family_invites_accepted_by_user_id_idx on public.family_invites(accepted_by_user_id);
create index if not exists family_invites_invited_by_user_id_idx on public.family_invites(invited_by_user_id);
create index if not exists health_logs_family_member_id_idx on public.health_logs(family_member_id);
create index if not exists medicine_logs_created_by_user_id_idx on public.medicine_logs(created_by_user_id);
create index if not exists medicine_logs_family_member_id_idx on public.medicine_logs(family_member_id);
create index if not exists reminders_created_by_user_id_idx on public.reminders(created_by_user_id);
create index if not exists reminders_family_member_id_idx on public.reminders(family_member_id);
create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists temperature_logs_created_by_user_id_idx on public.temperature_logs(created_by_user_id);
create index if not exists temperature_logs_family_member_id_idx on public.temperature_logs(family_member_id);
