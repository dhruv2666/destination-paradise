CREATE TABLE public.service_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 service text NOT NULL CHECK (service IN ('wedding','transfer')),
 status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','quoted','confirmed')),
 request_date date NOT NULL,
 request_time time NOT NULL,
 name text NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 120),
 phone text NOT NULL CHECK (length(trim(phone)) BETWEEN 5 AND 40),
 pickup_location text NOT NULL CHECK (length(trim(pickup_location)) BETWEEN 1 AND 300),
 dropoff_location text NOT NULL CHECK (length(trim(dropoff_location)) BETWEEN 1 AND 300),
 car_choice text CHECK (car_choice IN ('BMW X5','BMW 7 Series')),
 hours numeric CHECK (hours > 0),
 passengers integer CHECK (passengers > 0),
 luggage integer CHECK (luggage >= 0),
 flight_number text NOT NULL DEFAULT '' CHECK (length(flight_number) <= 80),
 notes text NOT NULL DEFAULT '' CHECK (length(notes) <= 2000),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT (id,service,request_date,request_time,name,phone,pickup_location,dropoff_location,car_choice,hours,passengers,luggage,flight_number,notes) ON public.service_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.service_requests TO authenticated;
GRANT ALL ON public.service_requests TO service_role;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers submit new service requests" ON public.service_requests FOR INSERT TO anon,authenticated WITH CHECK (status = 'new');
CREATE POLICY "owners read service requests" ON public.service_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "owners update service requests" ON public.service_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "owners delete service requests" ON public.service_requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE FUNCTION public.validate_service_request() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF TG_OP = 'INSERT' THEN
  NEW.status := 'new';
  NEW.created_at := now();
  IF NEW.request_date < (now() AT TIME ZONE 'Indian/Mauritius')::date OR (NEW.request_date + NEW.request_time) < (now() AT TIME ZONE 'Indian/Mauritius') THEN RAISE EXCEPTION 'Please choose a future date and time.'; END IF;
 END IF;
 IF NEW.service = 'wedding' AND (NEW.car_choice IS NULL OR NEW.hours IS NULL) THEN RAISE EXCEPTION 'Wedding car and number of hours are required.'; END IF;
 IF NEW.service = 'transfer' AND (NEW.passengers IS NULL OR NEW.luggage IS NULL) THEN RAISE EXCEPTION 'Passenger and luggage counts are required.'; END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER service_request_validation BEFORE INSERT OR UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.validate_service_request();
CREATE TABLE public.wedding_media (
 slot text PRIMARY KEY CHECK (slot IN ('hero','x5','7series','gallery')),
 image_url text NOT NULL,
 thumb_url text,
 placeholder boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.wedding_media TO anon,authenticated;
GRANT INSERT, UPDATE, DELETE ON public.wedding_media TO authenticated;
GRANT ALL ON public.wedding_media TO service_role;
ALTER TABLE public.wedding_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public wedding photos" ON public.wedding_media FOR SELECT TO anon,authenticated USING (true);
CREATE POLICY "owners manage wedding photos" ON public.wedding_media FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "owners upload service photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'service-photos' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "owners read service photo objects" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'service-photos' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "owners delete service photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'service-photos' AND public.has_role(auth.uid(),'admin'));
CREATE INDEX service_requests_date_idx ON public.service_requests (request_date,created_at DESC);