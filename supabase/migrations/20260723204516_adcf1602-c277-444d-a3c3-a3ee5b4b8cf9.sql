
-- ============================================================
-- REVOKE accès direct table
-- ============================================================
REVOKE ALL PRIVILEGES ON TABLE public.produits FROM anon, authenticated, PUBLIC;
GRANT ALL ON TABLE public.produits TO service_role;

-- ============================================================
-- Vue produits_interne — DROP + CREATE (changement typage)
-- ============================================================
DROP VIEW IF EXISTS public.produits_interne;

CREATE VIEW public.produits_interne AS
SELECT
  id, owner_id, identifiant, categorie, sous_categorie,
  designer_ou_marque, editeur_ou_label, type_objet, modele, annee,
  description, materiaux, couleur, etat, dimensions, poids,
  emplacement_stockage, canal_achat, date_achat,
  CASE WHEN public.has_role(auth.uid(),'admin'::app_role)
         OR public.has_permission(auth.uid(),'voir_prix_achat'::role_permission)
       THEN prix_achat ELSE NULL END AS prix_achat,
  CASE WHEN public.has_role(auth.uid(),'admin'::app_role)
         OR public.has_permission(auth.uid(),'voir_couts'::role_permission)
         OR public.has_permission(auth.uid(),'voir_prix_achat'::role_permission)
       THEN cout_travaux ELSE NULL END AS cout_travaux,
  CASE WHEN public.has_role(auth.uid(),'admin'::app_role)
         OR public.has_permission(auth.uid(),'voir_couts'::role_permission)
         OR public.has_permission(auth.uid(),'voir_prix_achat'::role_permission)
       THEN cout_transport ELSE NULL END AS cout_transport,
  CASE WHEN public.has_role(auth.uid(),'admin'::app_role)
         OR public.has_permission(auth.uid(),'voir_couts'::role_permission)
         OR public.has_permission(auth.uid(),'voir_prix_achat'::role_permission)
       THEN cout_total ELSE NULL END AS cout_total,
  prix_vente_cible,
  CASE WHEN public.has_role(auth.uid(),'admin'::app_role)
         OR public.has_permission(auth.uid(),'voir_prix_minimum'::role_permission)
       THEN prix_minimum_accepte ELSE NULL END AS prix_minimum_accepte,
  prix_vente_reel,
  CASE WHEN public.has_role(auth.uid(),'admin'::app_role)
         OR public.has_permission(auth.uid(),'voir_marges'::role_permission)
       THEN marge_potentielle ELSE NULL END AS marge_potentielle,
  date_vente, statut, prochaine_action, blocage, niveau_effort, date_limite,
  notes, photos, documents_authenticite, liens_annonces, plateformes_publication,
  shopify_product_id, source_feuille, source_ligne, import_original,
  donnees_douteuses, doublon_groupe, doublon_valide,
  pied, revetement, coque_assise, forme, cabinet,
  puissance, frequence, impedance, sensibilite, woodcase,
  created_at, updated_at, nettoyage, restauration, actions_requises,
  titre_commercial, statut_origine, statut_modifie_manuellement,
  statut_calcule_le, archived_at, archived_by, archive_motif,
  trashed_at, trashed_by, visibilite, disponibilite, prix_public_ttc,
  prix_pro_ht,
  tva_regime, tva_taux,
  CASE WHEN public.has_role(auth.uid(),'admin'::app_role)
         OR public.has_permission(auth.uid(),'voir_prix_minimum'::role_permission)
       THEN prix_minimum_interne ELSE NULL END AS prix_minimum_interne,
  remise_pro_pct,
  tarif_pro_valide_jusqu, validation_statut
FROM public.produits p
WHERE public.has_role(auth.uid(),'admin'::app_role)
   OR public.has_role_name(auth.uid(),'collaborateur');

REVOKE ALL ON TABLE public.produits_interne FROM anon, authenticated, PUBLIC;
GRANT ALL ON TABLE public.produits_interne TO service_role;

-- ============================================================
-- Helpers d'autorisation
-- ============================================================
CREATE OR REPLACE FUNCTION public._is_interne(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_uid,'admin'::app_role)
      OR public.has_role_name(_uid,'collaborateur');
$$;
REVOKE ALL ON FUNCTION public._is_interne(uuid) FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public._can_archive(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_uid,'admin'::app_role)
      OR (public.has_role_name(_uid,'collaborateur')
          AND public.has_permission(_uid,'archiver_produit'::role_permission));
$$;
REVOKE ALL ON FUNCTION public._can_archive(uuid) FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public._check_finance_field_write(_uid uuid, _field text)
RETURNS void LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE ok boolean := false;
BEGIN
  IF public.has_role(_uid,'admin'::app_role) THEN RETURN; END IF;
  IF _field IN ('prix_achat','cout_travaux','cout_transport') THEN
    ok := public.has_permission(_uid,'modifier_prix_achat'::role_permission)
       OR public.has_permission(_uid,'modifier_prix'::role_permission);
  ELSIF _field = 'prix_public_ttc' THEN
    ok := public.has_permission(_uid,'modifier_prix_public'::role_permission)
       OR public.has_permission(_uid,'modifier_prix'::role_permission);
  ELSIF _field IN ('prix_pro_ht','remise_pro_pct') THEN
    ok := public.has_permission(_uid,'modifier_prix_pro'::role_permission)
       OR public.has_permission(_uid,'modifier_prix'::role_permission);
  ELSIF _field IN ('prix_minimum_accepte','prix_minimum_interne') THEN
    ok := public.has_permission(_uid,'modifier_prix_minimum'::role_permission)
       OR public.has_permission(_uid,'modifier_prix'::role_permission);
  ELSE
    ok := true;
  END IF;
  IF NOT ok THEN
    RAISE EXCEPTION 'Champ financier interdit: %', _field USING ERRCODE='42501';
  END IF;
END; $$;
REVOKE ALL ON FUNCTION public._check_finance_field_write(uuid,text) FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public._ordinary_editable_fields()
RETURNS text[] LANGUAGE sql IMMUTABLE AS $$
  SELECT ARRAY[
    'categorie','sous_categorie','designer_ou_marque','editeur_ou_label',
    'type_objet','modele','annee','description','materiaux','couleur','etat',
    'dimensions','poids','emplacement_stockage','canal_achat','date_achat',
    'prix_vente_cible','prix_vente_reel','date_vente','statut',
    'statut_modifie_manuellement','prochaine_action','blocage','niveau_effort',
    'date_limite','notes','photos','documents_authenticite','liens_annonces',
    'plateformes_publication','shopify_product_id','doublon_valide',
    'pied','revetement','coque_assise','forme','cabinet',
    'puissance','frequence','impedance','sensibilite','woodcase',
    'nettoyage','restauration','titre_commercial','visibilite','disponibilite',
    'tva_regime','tva_taux','tarif_pro_valide_jusqu','validation_statut'
  ];
$$;

CREATE OR REPLACE FUNCTION public._finance_editable_fields()
RETURNS text[] LANGUAGE sql IMMUTABLE AS $$
  SELECT ARRAY[
    'prix_achat','cout_travaux','cout_transport',
    'prix_public_ttc','prix_pro_ht','remise_pro_pct',
    'prix_minimum_accepte','prix_minimum_interne'
  ];
$$;

-- ============================================================
-- Lecture sécurisée
-- ============================================================
CREATE OR REPLACE FUNCTION public.list_produits_interne()
RETURNS SETOF public.produits_interne
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Non authentifié' USING ERRCODE='42501'; END IF;
  IF NOT public._is_interne(auth.uid()) THEN RAISE EXCEPTION 'Accès refusé' USING ERRCODE='42501'; END IF;
  RETURN QUERY SELECT * FROM public.produits_interne;
END; $$;
REVOKE ALL ON FUNCTION public.list_produits_interne() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_produits_interne() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_produit_interne(_id uuid)
RETURNS public.produits_interne
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE row public.produits_interne;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Non authentifié' USING ERRCODE='42501'; END IF;
  IF NOT public._is_interne(auth.uid()) THEN RAISE EXCEPTION 'Accès refusé' USING ERRCODE='42501'; END IF;
  IF _id IS NULL THEN RAISE EXCEPTION 'id requis'; END IF;
  SELECT * INTO row FROM public.produits_interne WHERE id = _id;
  RETURN row;
END; $$;
REVOKE ALL ON FUNCTION public.get_produit_interne(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_produit_interne(uuid) TO authenticated;

-- ============================================================
-- update_produit
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_produit(_id uuid, _data jsonb)
RETURNS public.produits_interne
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_is_admin boolean;
  v_can_modif boolean;
  k text;
  ord text[] := public._ordinary_editable_fields();
  fin text[] := public._finance_editable_fields();
  keys text[];
  set_sql text;
  row public.produits_interne;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Non authentifié' USING ERRCODE='42501'; END IF;
  IF _id IS NULL OR _data IS NULL OR jsonb_typeof(_data) <> 'object' THEN
    RAISE EXCEPTION 'Paramètres invalides';
  END IF;

  v_is_admin := public.has_role(v_uid,'admin'::app_role);
  v_can_modif := v_is_admin OR (
    public.has_role_name(v_uid,'collaborateur')
    AND public.has_permission(v_uid,'modifier_produit'::role_permission)
  );

  FOR k IN SELECT jsonb_object_keys(_data) LOOP
    IF k = ANY(fin) THEN
      PERFORM public._check_finance_field_write(v_uid, k);
    ELSIF k = ANY(ord) THEN
      IF NOT v_can_modif THEN
        RAISE EXCEPTION 'Modification interdite (champ %) — permission modifier_produit requise', k USING ERRCODE='42501';
      END IF;
    ELSE
      RAISE EXCEPTION 'Champ non modifiable: %', k USING ERRCODE='42501';
    END IF;
  END LOOP;

  SELECT array_agg(x) INTO keys FROM jsonb_object_keys(_data) x;
  IF keys IS NULL OR array_length(keys,1) IS NULL THEN
    RAISE EXCEPTION 'Aucun champ à modifier';
  END IF;

  set_sql := (
    SELECT string_agg(
      format('%I = (jsonb_populate_record(NULL::public.produits, %L::jsonb)).%I', c, _data::text, c),
      ', '
    ) FROM unnest(keys) c
  );

  EXECUTE format('UPDATE public.produits SET %s WHERE id = %L', set_sql, _id);

  SELECT * INTO row FROM public.produits_interne WHERE id = _id;
  RETURN row;
END; $$;
REVOKE ALL ON FUNCTION public.update_produit(uuid,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_produit(uuid,jsonb) TO authenticated;

-- ============================================================
-- create_produit
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_produit(_data jsonb)
RETURNS public.produits_interne
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_is_admin boolean;
  v_can_create boolean;
  k text;
  ord text[] := public._ordinary_editable_fields();
  fin text[] := public._finance_editable_fields();
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

  INSERT INTO public.produits
  SELECT (jsonb_populate_record(
    NULL::public.produits,
    _data || jsonb_build_object('owner_id', v_uid)
  )).*
  RETURNING id INTO new_id;

  SELECT * INTO row FROM public.produits_interne WHERE id = new_id;
  RETURN row;
END; $$;
REVOKE ALL ON FUNCTION public.create_produit(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_produit(jsonb) TO authenticated;

-- ============================================================
-- Cycle de vie
-- ============================================================
CREATE OR REPLACE FUNCTION public.archive_produit(_id uuid, _motif public.motif_archivage)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Non authentifié' USING ERRCODE='42501'; END IF;
  IF NOT public._can_archive(v_uid) THEN RAISE EXCEPTION 'Interdit' USING ERRCODE='42501'; END IF;
  IF _id IS NULL OR _motif IS NULL THEN RAISE EXCEPTION 'Paramètres invalides'; END IF;
  UPDATE public.produits
     SET archived_at = now(), archived_by = v_uid, archive_motif = _motif
   WHERE id = _id;
END; $$;
REVOKE ALL ON FUNCTION public.archive_produit(uuid, public.motif_archivage) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.archive_produit(uuid, public.motif_archivage) TO authenticated;

CREATE OR REPLACE FUNCTION public.restore_produit_from_archive(_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Non authentifié' USING ERRCODE='42501'; END IF;
  IF NOT public._can_archive(v_uid) THEN RAISE EXCEPTION 'Interdit' USING ERRCODE='42501'; END IF;
  UPDATE public.produits SET archived_at=NULL, archived_by=NULL, archive_motif=NULL WHERE id = _id;
END; $$;
REVOKE ALL ON FUNCTION public.restore_produit_from_archive(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.restore_produit_from_archive(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.trash_produit(_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Non authentifié' USING ERRCODE='42501'; END IF;
  IF NOT public._can_archive(v_uid) THEN RAISE EXCEPTION 'Interdit' USING ERRCODE='42501'; END IF;
  UPDATE public.produits SET trashed_at=now(), trashed_by=v_uid WHERE id = _id;
END; $$;
REVOKE ALL ON FUNCTION public.trash_produit(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.trash_produit(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.restore_produit_from_trash(_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Non authentifié' USING ERRCODE='42501'; END IF;
  IF NOT public._can_archive(v_uid) THEN RAISE EXCEPTION 'Interdit' USING ERRCODE='42501'; END IF;
  UPDATE public.produits SET trashed_at=NULL, trashed_by=NULL WHERE id = _id;
END; $$;
REVOKE ALL ON FUNCTION public.restore_produit_from_trash(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.restore_produit_from_trash(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.delete_produit_definitivement(_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Non authentifié' USING ERRCODE='42501'; END IF;
  IF NOT public.has_role(v_uid,'admin'::app_role) THEN
    RAISE EXCEPTION 'Suppression réservée à un administrateur' USING ERRCODE='42501';
  END IF;
  DELETE FROM public.produits WHERE id = _id;
END; $$;
REVOKE ALL ON FUNCTION public.delete_produit_definitivement(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_produit_definitivement(uuid) TO authenticated;
