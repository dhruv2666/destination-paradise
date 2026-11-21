-- Customer identity documents (driving licence, NIC / passport) uploaded with a booking.
--
-- How it stays private:
--   * Files live in the private "id-documents" bucket. Only admins can view, add or delete them.
--   * Customers have no storage or table access at all. The website's server gives them a
--     one-time signed upload link, and only for the booking they sent in the last hour
--     (see src/lib/id-documents.functions.ts), then records the files here.
--   * Files are deleted automatically 90 days after the car is returned (30 days after a
--     booking is rejected or cancelled). See purgeExpiredIdDocuments in src/lib/id-documents.ts.
--   * Deleting a booking deletes these rows; the admin app also removes the files.

create table if not exists public.booking_id_documents (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  kind text not null check (kind in ('licence_front', 'licence_back', 'id_passport', 'other')),
  path text not null unique,
  name text not null default '',
  content_type text not null default '',
  size_bytes integer not null default 0,
  uploaded_at timestamptz not null default now(),
  unique (booking_id, kind)
);
create index if not exists booking_id_documents_booking on public.booking_id_documents (booking_id);

alter table public.booking_id_documents enable row level security;

drop policy if exists "admin reads id document records" on public.booking_id_documents;
create policy "admin reads id document records" on public.booking_id_documents for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
drop policy if exists "admin adds id document records" on public.booking_id_documents;
create policy "admin adds id document records" on public.booking_id_documents for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));
drop policy if exists "admin deletes id document records" on public.booking_id_documents;
create policy "admin deletes id document records" on public.booking_id_documents for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Private bucket: 10 MB per file, photos and PDFs only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('id-documents', 'id-documents', false, 10485760,
   array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admin reads id documents" on storage.objects;
create policy "admin reads id documents" on storage.objects for select to authenticated
  using (bucket_id = 'id-documents' and public.has_role(auth.uid(), 'admin'));
drop policy if exists "admin uploads id documents" on storage.objects;
create policy "admin uploads id documents" on storage.objects for insert to authenticated
  with check (bucket_id = 'id-documents' and public.has_role(auth.uid(), 'admin'));
drop policy if exists "admin deletes id documents" on storage.objects;
create policy "admin deletes id documents" on storage.objects for delete to authenticated
  using (bucket_id = 'id-documents' and public.has_role(auth.uid(), 'admin'));
