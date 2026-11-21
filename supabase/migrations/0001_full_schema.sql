-- Destination Paradise Mauritius Car Rental: full schema (no data)
create extension if not exists pgcrypto;

-- ENUMS / SEQUENCES
create type public.app_role as enum ('admin');
create sequence public.booking_doc_seq start with 1001 minvalue 1;

-- TABLES
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);

create table public.cars (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plate text not null default '',
  daily_price numeric not null default 0,
  photo_url text,
  seats integer not null default 5,
  transmission text not null default 'Manual',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  price_1_day numeric, price_2_3_days numeric, price_4_15_days numeric, price_16_plus_days numeric,
  photos jsonb not null default '[]'::jsonb,
  price_ranges jsonb not null default '[]'::jsonb,
  currency text not null default 'MUR' check (currency in ('MUR','EUR')),
  mileage integer, service_due_date date, service_due_km integer,
  insurance_expiry date, road_tax_expiry date, fitness_expiry date, fleet_notes text,
  constraint car_price_ranges_array check (jsonb_typeof(price_ranges)='array' and jsonb_array_length(price_ranges)<=20),
  constraint car_tier_prices_valid check (price_1_day>=0 and price_2_3_days>=0 and price_4_15_days>=0 and price_16_plus_days>=0),
  constraint cars_fleet_nonnegative check ((mileage is null or mileage>=0) and (service_due_km is null or service_due_km>=0)),
  constraint cars_photos_max_4 check (jsonb_typeof(photos)='array' and jsonb_array_length(photos)<=4)
);

create table public.settings (
  id integer primary key default 1 check (id = 1),
  company_name text not null default 'Destination Paradise Mauritius Car Rental',
  logo_url text,
  address text not null default 'Royal road, Grand baie , Port Louis, Mauritius',
  phone text not null default '+230 5922 4353',
  company_email text not null default '',
  currency text not null default 'Rs',
  owner_email text not null default '',
  terms_html text not null default '',
  whatsapp_template text not null default 'Hello {name}, your booking for {car} from {from} to {to} is confirmed. Total: {total}. Invoice and terms: {link}',
  updated_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  doc_number bigint not null unique default nextval('public.booking_doc_seq'),
  status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
  source text not null default 'online',
  full_name text not null,
  phone text not null,
  email text not null default '',
  id_number text not null default '',
  licence_number text not null default '',
  car_id uuid not null references public.cars(id),
  pickup_at timestamptz not null,
  return_at timestamptz not null,
  notes text not null default '',
  days integer not null default 1,
  price_per_day numeric not null default null,
  total_price numeric not null default 0,
  deposit numeric not null default 0,
  terms_html text, rejection_reason text, pdf_path text, pdf_generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  pickup_location text check (pickup_location is null or pickup_location in ('airport','other')),
  location_details text,
  currency text check (currency in ('MUR','EUR')),
  extras jsonb default '[]'::jsonb,
  constraint bookings_extras_allowed check (extras is null or (jsonb_typeof(extras)='array' and extras <@ '["Baby seat","Booster seat","Additional driver","GPS"]'::jsonb))
);
alter sequence public.booking_doc_seq owned by public.bookings.doc_number;
create index bookings_availability_lookup on public.bookings (car_id, pickup_at, return_at) where status in ('approved','confirmed');

create table public.car_date_blocks (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text not null default 'maintenance',
  created_at timestamptz not null default now()
);
create index car_date_blocks_lookup on public.car_date_blocks (car_id, start_at, end_at);

create table public.pending_signup_deletions (
  user_id uuid primary key,
  requested_by uuid not null,
  created_at timestamptz not null default now()
);

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  service text not null check (service in ('wedding','transfer')),
  status text not null default 'new' check (status in ('new','quoted','confirmed')),
  request_date date not null,
  request_time time not null,
  name text not null check (length(trim(name)) between 2 and 120),
  phone text not null check (length(trim(phone)) between 5 and 40),
  pickup_location text not null check (length(trim(pickup_location)) between 1 and 300),
  dropoff_location text not null check (length(trim(dropoff_location)) between 1 and 300),
  car_choice text check (car_choice in ('BMW X5','BMW 7 Series')),
  hours numeric check (hours > 0),
  passengers integer check (passengers > 0),
  luggage integer check (luggage >= 0),
  flight_number text not null default '' check (length(flight_number) <= 80),
  notes text not null default '' check (length(notes) <= 2000),
  created_at timestamptz not null default now()
);
create index service_requests_date_idx on public.service_requests (request_date, created_at desc);

create table public.wedding_media (
  slot text primary key check (slot in ('hero','x5','7series','gallery')),
  image_url text not null,
  thumb_url text,
  placeholder boolean not null default true
);

-- GRANTS
grant select on public.user_roles to authenticated;
grant select on public.cars to anon, authenticated;
grant insert, update, delete on public.cars to authenticated;
grant select, insert, update on public.settings to authenticated;
grant insert on public.bookings to anon, authenticated;
grant select, update, delete on public.bookings to authenticated;
grant usage on sequence public.booking_doc_seq to anon, authenticated;
grant select, insert, update, delete on public.car_date_blocks to authenticated;
grant insert on public.service_requests to anon, authenticated;
grant select, update, delete on public.service_requests to authenticated;
grant select on public.wedding_media to anon, authenticated;
grant insert, update, delete on public.wedding_media to authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
-- Keep internal fleet notes private from public reads
revoke select (fleet_notes) on public.cars from anon;

-- FUNCTIONS
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path to 'public' as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.admin_exists()
returns boolean language sql stable security definer set search_path to 'public' as $$
  select exists (select 1 from public.user_roles where role = 'admin')
$$;

create or replace function public.claim_admin()
returns boolean language sql stable security definer set search_path to 'public' as $$
  select public.has_role(auth.uid(), 'admin');
$$;

create or replace function public.car_range_price(_ranges jsonb, _days integer)
returns numeric language sql immutable set search_path to 'public' as $$
 select (r->>'price')::numeric from jsonb_array_elements(coalesce(_ranges,'[]'::jsonb)) with ordinality as t(r, i)
 where (r->>'min')::int <= _days and (r->>'max' is null or (r->>'max')::int >= _days)
 order by i limit 1
$$;

create or replace function public.available_car_ids(requested_from date, requested_to date)
returns table(car_id uuid) language plpgsql stable security definer set search_path to 'public' as $$
DECLARE requested_start timestamptz; requested_end timestamptz;
BEGIN
 IF requested_from IS NULL OR requested_to IS NULL OR requested_to <= requested_from THEN RAISE EXCEPTION 'Return date must be after pickup date (minimum 1 day)'; END IF;
 IF requested_from < (now() AT TIME ZONE 'Indian/Mauritius')::date THEN RAISE EXCEPTION 'Pickup date cannot be in the past'; END IF;
 requested_start := requested_from::timestamp AT TIME ZONE 'Indian/Mauritius';
 requested_end := requested_to::timestamp AT TIME ZONE 'Indian/Mauritius';
 RETURN QUERY SELECT c.id FROM public.cars c WHERE c.active
 AND NOT EXISTS (SELECT 1 FROM public.bookings b WHERE b.car_id=c.id AND b.status IN ('approved','confirmed') AND b.pickup_at<requested_end AND b.return_at>requested_start)
 AND NOT EXISTS (SELECT 1 FROM public.car_date_blocks d WHERE d.car_id=c.id AND d.start_at<requested_end AND d.end_at>requested_start);
END $$;

create or replace function public.car_unavailable(_car_id uuid)
returns table(pickup_at timestamptz, return_at timestamptz) language sql stable security definer set search_path to 'public' as $$
  select pickup_at, return_at from public.bookings
  where car_id = _car_id and status = 'approved' and return_at > now() - interval '1 day'
$$;

create or replace function public.public_settings()
returns table(company_name text, logo_url text, address text, phone text, company_email text, currency text, terms_html text)
language sql stable security definer set search_path to 'public' as $$
  select company_name, logo_url, address, phone, company_email, currency, terms_html from public.settings where id = 1
$$;

create or replace function public.owner_fleet_cars()
returns setof public.cars language plpgsql stable security definer set search_path to 'public' as $$
BEGIN IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN RAISE EXCEPTION 'Owner access required'; END IF;
RETURN QUERY SELECT * FROM public.cars ORDER BY active DESC, name; END $$;

create or replace function public.bookings_prepare()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare is_admin boolean := public.has_role(auth.uid(), 'admin'); car_price numeric; car_currency text;
begin
 if new.return_at <= new.pickup_at then raise exception 'Return must be after pickup'; end if;
 if new.pickup_location is null or new.pickup_location not in ('airport','other') then raise exception 'Pickup location is required'; end if;
 if new.pickup_location='other' and coalesce(trim(new.location_details),'')='' then raise exception 'Please say where the car will be picked up'; end if;
 if tg_op='INSERT' then
  if not is_admin then new.status:='pending'; new.source:='online'; new.deposit:=0; new.price_per_day:=null; new.terms_html:=null; new.pdf_path:=null; end if;
  if new.terms_html is null then select terms_html into new.terms_html from public.settings where id=1; end if;
 else new.doc_number:=old.doc_number; new.updated_at:=now(); end if;
 new.days:=greatest(1,ceil(extract(epoch from (new.return_at-new.pickup_at))/86400.0)::int);
 select coalesce(public.car_range_price(price_ranges,new.days),daily_price),currency into car_price,car_currency from public.cars where id=new.car_id and (active or is_admin);
 if car_price is null then raise exception 'Car not available'; end if;
 if new.price_per_day is null or (tg_op='UPDATE' and new.car_id<>old.car_id and new.price_per_day=old.price_per_day) or (tg_op='INSERT' and not is_admin) then new.price_per_day:=car_price; end if;
 if tg_op='INSERT' then
  if not is_admin or new.currency is null then new.currency:=car_currency; end if;
 elsif not is_admin then new.currency:=old.currency;
 elsif new.currency is null then new.currency:=coalesce(old.currency,car_currency);
 elsif new.car_id<>old.car_id and new.currency=old.currency then new.currency:=car_currency;
 end if;
 if new.price_per_day<0 or new.deposit<0 then raise exception 'Prices cannot be negative'; end if;
 new.total_price:=new.days*new.price_per_day;
 if new.status in ('pending','approved') and exists(select 1 from public.bookings b where b.car_id=new.car_id and b.status='approved' and b.id<>new.id and b.pickup_at<new.return_at and b.return_at>new.pickup_at) then raise exception 'This car is already booked for those dates'; end if;
 return new;
end $$;

create or replace function public.bookings_availability_guard()
returns trigger language plpgsql security definer set search_path to 'public' as $$
DECLARE owner_access boolean := public.has_role(auth.uid(), 'admin');
BEGIN
 PERFORM 1 FROM public.cars WHERE id=new.car_id FOR UPDATE;
 IF tg_op='INSERT' AND (NOT owner_access OR new.source='online') THEN
  IF (new.pickup_at AT TIME ZONE 'Indian/Mauritius')::date < (now() AT TIME ZONE 'Indian/Mauritius')::date THEN RAISE EXCEPTION 'Pickup date cannot be in the past'; END IF;
  IF new.return_at-new.pickup_at < interval '1 day' THEN RAISE EXCEPTION 'Minimum rental is 1 day'; END IF;
 END IF;
 IF NOT owner_access OR new.status IN ('pending','approved','confirmed') THEN
  IF EXISTS (SELECT 1 FROM public.bookings b WHERE b.car_id=new.car_id AND b.id<>new.id AND b.status IN ('approved','confirmed') AND b.pickup_at<new.return_at AND b.return_at>new.pickup_at)
   OR EXISTS (SELECT 1 FROM public.car_date_blocks d WHERE d.car_id=new.car_id AND d.start_at<new.return_at AND d.end_at>new.pickup_at)
  THEN RAISE EXCEPTION 'This car is already booked or blocked for those dates'; END IF;
 END IF;
 IF length(new.full_name)>100 OR length(new.phone)>40 OR length(new.email)>255 OR length(new.id_number)>100 OR length(new.licence_number)>100 OR length(new.notes)>2000 OR length(coalesce(new.location_details,''))>500 THEN RAISE EXCEPTION 'Booking details are too long'; END IF;
 RETURN new;
END $$;

create or replace function public.validate_car_date_block()
returns trigger language plpgsql security definer set search_path to 'public' as $$
BEGIN
 PERFORM 1 FROM public.cars WHERE id=new.car_id FOR UPDATE;
 IF new.start_at IS NULL OR new.end_at IS NULL OR new.end_at<=new.start_at THEN RAISE EXCEPTION 'Return date must be after pickup date'; END IF;
 IF (new.start_at AT TIME ZONE 'Indian/Mauritius')::date < (now() AT TIME ZONE 'Indian/Mauritius')::date THEN RAISE EXCEPTION 'Pickup date cannot be in the past'; END IF;
 IF new.reason NOT IN ('maintenance','off-hire') THEN RAISE EXCEPTION 'Choose maintenance or off-hire'; END IF;
 IF EXISTS(SELECT 1 FROM public.bookings b WHERE b.car_id=new.car_id AND b.status IN ('approved','confirmed') AND b.pickup_at<new.end_at AND b.return_at>new.start_at) THEN RAISE EXCEPTION 'These dates already have an approved booking'; END IF;
 RETURN new;
END $$;

create or replace function public.validate_service_request()
returns trigger language plpgsql set search_path to 'public' as $$
BEGIN
 IF TG_OP = 'INSERT' THEN
  NEW.status := 'new';
  NEW.created_at := now();
  IF NEW.request_date < (now() AT TIME ZONE 'Indian/Mauritius')::date OR (NEW.request_date + NEW.request_time) < (now() AT TIME ZONE 'Indian/Mauritius') THEN RAISE EXCEPTION 'Please choose a future date and time.'; END IF;
 END IF;
 IF NEW.service = 'wedding' AND NEW.hours IS NULL THEN RAISE EXCEPTION 'Number of hours is required.'; END IF;
 IF NEW.service = 'transfer' AND (NEW.passengers IS NULL OR NEW.luggage IS NULL) THEN RAISE EXCEPTION 'Passenger and luggage counts are required.'; END IF;
 RETURN NEW;
END; $$;

-- Owner / team management
create or replace function public.owners_add(owner_email text)
returns void language plpgsql security definer set search_path to 'public' as $$
declare target uuid;
begin
 perform pg_advisory_xact_lock(91423001);
 if not public.has_role(auth.uid(),'admin') then raise exception 'Only owners can manage the team'; end if;
 if length(trim(owner_email))>255 or trim(owner_email) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Enter a valid email'; end if;
 select id into target from auth.users where lower(email)=lower(trim(owner_email));
 if target is null then raise exception 'This person must create an account first'; end if;
 if exists(select 1 from public.user_roles where user_id=target and role='admin') then raise exception 'This person is already an owner'; end if;
 insert into public.user_roles(user_id,role) values(target,'admin');
end $$;

create or replace function public.owners_approve(target uuid)
returns void language plpgsql security definer set search_path to 'public' as $$
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('owners'));
 IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Only owners can manage the team'; END IF;
 IF EXISTS (SELECT 1 FROM public.pending_signup_deletions WHERE user_id=target) THEN RAISE EXCEPTION 'This sign-up is being deleted'; END IF;
 IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target) THEN RAISE EXCEPTION 'User not found'; END IF;
 INSERT INTO public.user_roles(user_id, role) SELECT target, 'admin' WHERE NOT public.has_role(target, 'admin');
END $$;

create or replace function public.owners_list()
returns table(user_id uuid, email text) language plpgsql security definer set search_path to 'public' as $$
begin
 if not public.has_role(auth.uid(),'admin') then raise exception 'Only owners can manage the team'; end if;
 return query select r.user_id,u.email::text from public.user_roles r join auth.users u on u.id=r.user_id where r.role='admin' order by u.email;
end $$;

create or replace function public.owners_remove(owner_id uuid)
returns void language plpgsql security definer set search_path to 'public' as $$
begin
 perform pg_advisory_xact_lock(91423001);
 if not public.has_role(auth.uid(),'admin') then raise exception 'Only owners can manage the team'; end if;
 if not exists(select 1 from public.user_roles where user_id=owner_id and role='admin') then raise exception 'Owner not found'; end if;
 if (select count(*) from public.user_roles where role='admin')<=1 then raise exception 'The last remaining owner cannot be removed'; end if;
 delete from public.user_roles where user_id=owner_id and role='admin';
end $$;

create or replace function public.owners_revoke(target uuid)
returns void language plpgsql security definer set search_path to 'public' as $$
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('owners'));
 IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Only owners can manage the team'; END IF;
 IF (SELECT count(*) FROM public.user_roles WHERE role = 'admin') <= 1 AND public.has_role(target, 'admin') THEN
   RAISE EXCEPTION 'The last remaining owner cannot be revoked';
 END IF;
 DELETE FROM public.user_roles WHERE user_id = target AND role = 'admin';
END $$;

create or replace function public.prepare_pending_signup_deletion(target uuid)
returns void language plpgsql security definer set search_path to 'public' as $$
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('owners'));
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Only owners can manage the team'; END IF;
 IF public.has_role(target,'admin') THEN RAISE EXCEPTION 'Approved owners cannot be deleted'; END IF;
 IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id=target) THEN RAISE EXCEPTION 'User not found'; END IF;
 INSERT INTO public.pending_signup_deletions(user_id,requested_by) VALUES(target,auth.uid());
END $$;

create or replace function public.cancel_pending_signup_deletion(target uuid)
returns void language plpgsql security definer set search_path to 'public' as $$
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('owners'));
 DELETE FROM public.pending_signup_deletions WHERE user_id=target AND requested_by=auth.uid();
END $$;

create or replace function public.team_list()
returns table(user_id uuid, email text, created_at timestamptz, is_owner boolean)
language plpgsql stable security definer set search_path to 'public' as $$
BEGIN
 IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Only owners can manage the team'; END IF;
 RETURN QUERY SELECT u.id, u.email::text, u.created_at, public.has_role(u.id, 'admin') FROM auth.users u ORDER BY u.created_at;
END $$;

-- TRIGGERS
create trigger bookings_prepare before insert or update on public.bookings for each row execute function public.bookings_prepare();
create trigger bookings_availability_guard before insert or update on public.bookings for each row execute function public.bookings_availability_guard();
create trigger validate_car_date_block before insert or update on public.car_date_blocks for each row execute function public.validate_car_date_block();
create trigger service_request_validation before insert or update on public.service_requests for each row execute function public.validate_service_request();

-- RLS
alter table public.user_roles enable row level security;
alter table public.cars enable row level security;
alter table public.settings enable row level security;
alter table public.bookings enable row level security;
alter table public.car_date_blocks enable row level security;
alter table public.pending_signup_deletions enable row level security;
alter table public.service_requests enable row level security;
alter table public.wedding_media enable row level security;

create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());

create policy "public reads active cars" on public.cars for select to anon, authenticated using (active or public.has_role(auth.uid(),'admin'));
create policy "admin manages cars" on public.cars for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "admin reads settings" on public.settings for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin inserts settings" on public.settings for insert to authenticated with check (id = 1 and public.has_role(auth.uid(),'admin'));
create policy "admin updates settings" on public.settings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "anyone can request a booking" on public.bookings for insert to anon, authenticated with check (status = 'pending' or public.has_role(auth.uid(),'admin'));
create policy "admin reads bookings" on public.bookings for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin updates bookings" on public.bookings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin deletes bookings" on public.bookings for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "owners manage date blocks" on public.car_date_blocks for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- pending_signup_deletions: no policies (only reachable via security-definer functions)

create policy "customers submit new service requests" on public.service_requests for insert to anon, authenticated with check (status = 'new');
create policy "owners read service requests" on public.service_requests for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "owners update service requests" on public.service_requests for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "owners delete service requests" on public.service_requests for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "public wedding photos" on public.wedding_media for select to anon, authenticated using (true);
create policy "owners manage wedding photos" on public.wedding_media for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- STORAGE BUCKETS (all private)
insert into storage.buckets (id, name, public, file_size_limit) values
  ('car-photos','car-photos',false,5242880),
  ('documents','documents',false,null),
  ('service-photos','service-photos',false,5242880)
on conflict (id) do nothing;

create policy "admin reads documents" on storage.objects for select to authenticated using (bucket_id='documents' and public.has_role(auth.uid(),'admin'));
create policy "admin writes documents" on storage.objects for insert to authenticated with check (bucket_id='documents' and public.has_role(auth.uid(),'admin'));
create policy "admin updates documents" on storage.objects for update to authenticated using (bucket_id='documents' and public.has_role(auth.uid(),'admin'));
create policy "admin deletes documents" on storage.objects for delete to authenticated using (bucket_id='documents' and public.has_role(auth.uid(),'admin'));

create policy "owners read car photos" on storage.objects for select to authenticated using (bucket_id='car-photos' and public.has_role(auth.uid(),'admin'));
create policy "owners upload car photos" on storage.objects for insert to authenticated with check (bucket_id='car-photos' and public.has_role(auth.uid(),'admin'));
create policy "owners replace car photos" on storage.objects for update to authenticated using (bucket_id='car-photos' and public.has_role(auth.uid(),'admin')) with check (bucket_id='car-photos' and public.has_role(auth.uid(),'admin'));
create policy "owners delete car photos" on storage.objects for delete to authenticated using (bucket_id='car-photos' and public.has_role(auth.uid(),'admin'));

create policy "owners read service photo objects" on storage.objects for select to authenticated using (bucket_id='service-photos' and public.has_role(auth.uid(),'admin'));
create policy "owners upload service photos" on storage.objects for insert to authenticated with check (bucket_id='service-photos' and public.has_role(auth.uid(),'admin'));
create policy "owners delete service photos" on storage.objects for delete to authenticated using (bucket_id='service-photos' and public.has_role(auth.uid(),'admin'));
