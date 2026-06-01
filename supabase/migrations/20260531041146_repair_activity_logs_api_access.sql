-- Ensure caregiver/calendar tables are visible to the Supabase Data API.
-- RLS policies on these tables still control which rows each role can access.

grant usage on schema public to anon, authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'care_instructions',
    'activity_logs',
    'activity_photos',
    'notifications',
    'calendar_events',
    'event_responses',
    'emergency_contacts',
    'medications',
    'conditions',
    'appointments',
    'audit_logs'
  ] loop
    if to_regclass(format('public.%I', table_name)) is not null then
      execute format('alter table public.%I enable row level security', table_name);
      execute format('grant select, insert, update, delete on public.%I to anon, authenticated', table_name);
    end if;
  end loop;
end $$;

notify pgrst, 'reload schema';
