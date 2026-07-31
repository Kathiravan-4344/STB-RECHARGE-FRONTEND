CREATE OR REPLACE FUNCTION public.claim_role(_mobile TEXT)
RETURNS public.app_role
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid UUID := auth.uid();
  _clean TEXT := regexp_replace(coalesce(_mobile,''), '\D', '', 'g');
  _role public.app_role := 'customer';
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  IF _clean = '9080864542' THEN
    _role := 'admin';
  ELSIF EXISTS (SELECT 1 FROM public.approved_operators WHERE mobile = _clean AND active) THEN
    _role := 'operator';
  END IF;

  IF _role <> 'customer' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_uid, _role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    DELETE FROM public.user_roles WHERE user_id = _uid AND role IN ('admin','operator');
  END IF;

  RETURN _role;
END; $$;
REVOKE EXECUTE ON FUNCTION public.claim_role(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_role(TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.is_blocked(_identifier TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.blocked_customers WHERE lower(identifier) = lower(coalesce(_identifier,'')))
$$;
REVOKE EXECUTE ON FUNCTION public.is_blocked(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_blocked(TEXT) TO authenticated;