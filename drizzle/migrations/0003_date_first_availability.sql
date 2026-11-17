CREATE TABLE public.car_date_blocks (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 car_id uuid NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
 start_at timestamptz NOT NULL,
 end_at timestamptz NOT NULL,
 reason text NOT NULL DEFAULT 'maintenance',
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.car_date_blocks TO authenticated;
GRANT ALL ON public.car_date_blocks TO service_role;
ALTER TABLE public.car_date_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owners manage date blocks" ON public.car_date_blocks FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX car_date_blocks_lookup ON public.car_date_blocks(car_id, start_at, end_at);
CREATE INDEX bookings_availability_lookup ON public.bookings(car_id, pickup_at, return_at) WHERE status IN ('approved','confirmed');
CREATE OR REPLACE FUNCTION public.available_car_ids(requested_from date, requested_to date)
RETURNS TABLE(car_id uuid) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
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
REVOKE ALL ON FUNCTION public.available_car_ids(date,date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.available_car_ids(date,date) TO anon, authenticated;
CREATE OR REPLACE FUNCTION public.bookings_availability_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
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
CREATE TRIGGER bookings_availability_guard BEFORE INSERT OR UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.bookings_availability_guard();
CREATE OR REPLACE FUNCTION public.validate_car_date_block()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 PERFORM 1 FROM public.cars WHERE id=new.car_id FOR UPDATE;
 IF new.start_at IS NULL OR new.end_at IS NULL OR new.end_at<=new.start_at THEN RAISE EXCEPTION 'Return date must be after pickup date'; END IF;
 IF (new.start_at AT TIME ZONE 'Indian/Mauritius')::date < (now() AT TIME ZONE 'Indian/Mauritius')::date THEN RAISE EXCEPTION 'Pickup date cannot be in the past'; END IF;
 IF new.reason NOT IN ('maintenance','off-hire') THEN RAISE EXCEPTION 'Choose maintenance or off-hire'; END IF;
 IF EXISTS(SELECT 1 FROM public.bookings b WHERE b.car_id=new.car_id AND b.status IN ('approved','confirmed') AND b.pickup_at<new.end_at AND b.return_at>new.start_at) THEN RAISE EXCEPTION 'These dates already have an approved booking'; END IF;
 RETURN new;
END $$;
CREATE TRIGGER validate_car_date_block BEFORE INSERT OR UPDATE ON public.car_date_blocks FOR EACH ROW EXECUTE FUNCTION public.validate_car_date_block();
REVOKE EXECUTE ON FUNCTION public.car_unavailable(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.car_unavailable(uuid) TO service_role;