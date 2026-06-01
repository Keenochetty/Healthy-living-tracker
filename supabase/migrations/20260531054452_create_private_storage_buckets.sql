insert into storage.buckets (id, name, public)
values
  ('profile-photos', 'profile-photos', false),
  ('activity-photos', 'activity-photos', false),
  ('documents', 'documents', false),
  ('caregiver-uploads', 'caregiver-uploads', false),
  ('medical-documents', 'medical-documents', false)
on conflict (id) do update
set
  name = excluded.name,
  public = false;
