REVOKE ALL ON public.car_date_blocks FROM anon;
GRANT EXECUTE ON FUNCTION public.available_car_ids(date,date) TO service_role;