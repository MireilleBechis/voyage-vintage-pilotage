CREATE OR REPLACE FUNCTION public.create_produit(_data jsonb)
 RETURNS produits_interne
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_is_admin boolean;
  v_can_create boolean;
  k text;
  ord text[] := public._ordinary_editable_fields();
  fin text[] := public._finance_editable_fields();
  keys text[];
  cols text;
  vals text;
  new_id uuid;
  row public.produits_interne;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Non authentifié' USING ERRCODE='42501'; END IF;
  IF _data IS NULL OR jsonb_typeof(_data) <> 'object' THEN
    RAISE EXCEPTION 'Paramètres invalides';
  END IF;
  IF COALESCE(_data->>'identifiant','') = '' THEN
    RAISE EXCEPTION 'identifiant requis';
  END IF;

  v_is_admin := public.has_role(v_uid,'admin'::app_role);
  v_can_create := v_is_admin OR (
    public.has_role_name(v_uid,'collaborateur')
    AND public.has_permission(v_uid,'creer_produit'::role_permission)
  );
  IF NOT v_can_create THEN
    RAISE EXCEPTION 'Création interdite' USING ERRCODE='42501';
  END IF;

  FOR k IN SELECT jsonb_object_keys(_data) LOOP
    IF k IN ('owner_id','identifiant','id','created_at','updated_at') THEN
      CONTINUE;
    ELSIF k = ANY(fin) THEN
      PERFORM public._check_finance_field_write(v_uid, k);
    ELSIF k = ANY(ord) THEN
      NULL;
    ELSE
      RAISE EXCEPTION 'Champ non autorisé à la création: %', k USING ERRCODE='42501';
    END IF;
  END LOOP;

  SELECT array_agg(x) INTO keys
  FROM jsonb_object_keys(_data) x
  WHERE x = ANY(ord) OR x = ANY(fin);

  keys := COALESCE(keys, ARRAY[]::text[]);

  SELECT string_agg(format('%I', c), ', '),
         string_agg(format('(jsonb_populate_record(NULL::public.produits, %L::jsonb)).%I', _data::text, c), ', ')
    INTO cols, vals
    FROM unnest(keys) c;

  IF cols IS NULL THEN
    EXECUTE format(
      'INSERT INTO public.produits (owner_id, identifiant) VALUES (%L, %L) RETURNING id',
      v_uid, _data->>'identifiant')
    INTO new_id;
  ELSE
    EXECUTE format(
      'INSERT INTO public.produits (owner_id, identifiant, %s) VALUES (%L, %L, %s) RETURNING id',
      cols, v_uid, _data->>'identifiant', vals)
    INTO new_id;
  END IF;

  SELECT * INTO row FROM public.produits_interne WHERE id = new_id;
  RETURN row;
END; $function$;