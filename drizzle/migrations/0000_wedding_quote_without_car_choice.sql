CREATE OR REPLACE FUNCTION public.validate_service_request() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $f$
BEGIN
 IF TG_OP = 'INSERT' THEN
  NEW.status := 'new';
  NEW.created_at := now();
  IF NEW.request_date < (now() AT TIME ZONE 'Indian/Mauritius')::date OR (NEW.request_date + NEW.request_time) < (now() AT TIME ZONE 'Indian/Mauritius') THEN RAISE EXCEPTION 'Please choose a future date and time.'; END IF;
 END IF;
 IF NEW.service = 'wedding' AND NEW.hours IS NULL THEN RAISE EXCEPTION 'Number of hours is required.'; END IF;
 IF NEW.service = 'transfer' AND (NEW.passengers IS NULL OR NEW.luggage IS NULL) THEN RAISE EXCEPTION 'Passenger and luggage counts are required.'; END IF;
 RETURN NEW;
END; $f$;