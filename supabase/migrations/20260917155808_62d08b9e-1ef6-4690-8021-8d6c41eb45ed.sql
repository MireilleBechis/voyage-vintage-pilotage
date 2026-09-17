CREATE OR REPLACE FUNCTION public.prochain_identifiant_produit()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE n integer;
BEGIN
  IF auth.uid() IS NULL OR NOT public._is_interne(auth.uid()) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE = '42501';
  END IF;

  SELECT COALESCE(max(NULLIF(regexp_replace(identifiant, '^DV-', ''), '')::integer), 0) + 1
    INTO n
    FROM public.produits
   WHERE identifiant ~ '^DV-[0-9]+$';

  RETURN 'DV-' || lpad(n::text, 4, '0');
END;
$$;