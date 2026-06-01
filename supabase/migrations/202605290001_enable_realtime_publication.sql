do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'families',
    'family_members',
    'family_memberships',
    'family_invites',
    'health_logs',
    'medicine_logs',
    'temperature_logs',
    'doctor_visits',
    'documents',
    'reminders',
    'ai_chats',
    'ai_messages',
    'children',
    'caregiver_child_access',
    'sharing_permissions',
    'care_instructions',
    'activity_logs',
    'activity_photos',
    'notifications',
    'calendar_events',
    'event_responses',
    'emergency_contacts',
    'medications',
    'conditions',
    'appointments'
  ] loop
    if to_regclass(format('public.%I', table_name)) is not null
      and not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = table_name
      )
    then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end $$;
