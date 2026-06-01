insert into storage.buckets (id, name, public)
values ('medical-documents', 'medical-documents', false)
on conflict (id) do update set public = false;

drop policy if exists "Users can read own medical document objects" on storage.objects;
create policy "Users can read own medical document objects" on storage.objects for select
to authenticated
using (
  bucket_id = 'medical-documents'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can upload own medical document objects" on storage.objects;
create policy "Users can upload own medical document objects" on storage.objects for insert
to authenticated
with check (
  bucket_id = 'medical-documents'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can update own medical document objects" on storage.objects;
create policy "Users can update own medical document objects" on storage.objects for update
to authenticated
using (
  bucket_id = 'medical-documents'
  and (select auth.uid())::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'medical-documents'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can delete own medical document objects" on storage.objects;
create policy "Users can delete own medical document objects" on storage.objects for delete
to authenticated
using (
  bucket_id = 'medical-documents'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);
