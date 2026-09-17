
CREATE OR REPLACE FUNCTION public._ordinary_editable_fields()
RETURNS text[] LANGUAGE sql IMMUTABLE SET search_path TO 'public' AS $$
  SELECT ARRAY[
    'designer_ou_marque','editeur_ou_label','modele','annee','description',
    'couleur','etat','dimensions','poids','emplacement_stockage','canal_achat','date_achat',
    'prix_vente_cible','prix_vente_reel','date_vente','statut',
    'statut_modifie_manuellement','prochaine_action','blocage','niveau_effort',
    'date_limite','notes','photos','documents_authenticite','liens_annonces',
    'plateformes_publication','shopify_product_id','doublon_valide',
    'categorie_shopify_id',
    'pied','revetement','coque_assise','forme','cabinet',
    'puissance','frequence','impedance','sensibilite','woodcase',
    'nettoyage','restauration','titre_commercial','visibilite','disponibilite',
    'tva_regime','tva_taux','tarif_pro_valide_jusqu','validation_statut'
  ];
$$;

CREATE OR REPLACE FUNCTION public._finance_editable_fields()
RETURNS text[] LANGUAGE sql IMMUTABLE SET search_path TO 'public' AS $$
  SELECT ARRAY[
    'prix_achat','cout_travaux','cout_transport',
    'prix_public_ttc','prix_pro_ht','remise_pro_pct',
    'prix_minimum_accepte','prix_minimum_interne'
  ];
$$;

DO $do$
DECLARE f record;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon, public', f.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated, service_role', f.sig);
  END LOOP;
END $do$;
