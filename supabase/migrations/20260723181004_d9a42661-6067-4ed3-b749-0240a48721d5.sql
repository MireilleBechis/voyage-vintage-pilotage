
-- Fonction : liste des actions requises pour un produit
CREATE OR REPLACE FUNCTION public.calculer_actions_requises(p public.produits)
RETURNS text[]
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  a text[] := '{}';
BEGIN
  IF p.designer_ou_marque IS NULL OR p.designer_ou_marque = '' OR p.modele IS NULL OR p.modele = '' THEN
    a := array_append(a, 'identification_a_completer');
  END IF;
  IF p.prix_vente_cible IS NULL OR p.prix_vente_cible = 0 THEN
    a := array_append(a, 'prix_a_expertiser');
  ELSIF p.prix_vente_cible < 10 THEN
    a := array_append(a, 'prix_incoherent');
  END IF;
  IF p.nettoyage = 'a_verifier' THEN a := array_append(a, 'nettoyage_a_verifier'); END IF;
  IF p.nettoyage = 'necessaire' THEN a := array_append(a, 'a_nettoyer'); END IF;
  IF p.restauration = 'a_verifier' THEN a := array_append(a, 'restauration_a_verifier'); END IF;
  IF p.restauration = 'necessaire' THEN a := array_append(a, 'a_restaurer'); END IF;
  IF p.etat IS NULL OR p.etat = '' THEN a := array_append(a, 'etat_a_verifier'); END IF;
  IF p.photos IS NULL OR jsonb_array_length(p.photos) = 0 THEN
    a := array_append(a, 'photos_manquantes');
  END IF;
  IF p.description IS NULL OR p.description = '' THEN
    a := array_append(a, 'description_manquante');
  END IF;
  IF p.dimensions IS NULL OR p.dimensions = '' THEN
    a := array_append(a, 'dimensions_manquantes');
  END IF;
  RETURN a;
END;
$$;

-- Fonction : statut calculé selon le parcours
CREATE OR REPLACE FUNCTION public.calculer_statut_produit(p public.produits)
RETURNS public.statut_produit
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  -- Statuts terminaux/manuels : on ne touche pas
  IF p.statut IN ('EN_LIGNE','RESERVE','VENDU','ARCHIVE') THEN
    RETURN p.statut;
  END IF;
  -- Verrou manuel
  IF p.statut_modifie_manuellement THEN
    RETURN p.statut;
  END IF;
  -- Parcours
  IF p.designer_ou_marque IS NULL OR p.designer_ou_marque = '' OR p.modele IS NULL OR p.modele = '' THEN
    RETURN 'A_IDENTIFIER';
  END IF;
  IF p.prix_vente_cible IS NULL OR p.prix_vente_cible <= 0 THEN
    RETURN 'A_EXPERTISER';
  END IF;
  IF p.nettoyage = 'a_verifier' OR p.restauration = 'a_verifier' THEN
    RETURN 'ETAT_A_VERIFIER';
  END IF;
  IF p.nettoyage = 'necessaire' THEN RETURN 'A_NETTOYER'; END IF;
  IF p.restauration = 'necessaire' THEN RETURN 'A_RESTAURER'; END IF;
  IF p.photos IS NULL OR jsonb_array_length(p.photos) = 0 THEN
    RETURN 'A_PHOTOGRAPHIER';
  END IF;
  IF (p.titre_commercial IS NULL OR p.titre_commercial = '')
     OR (p.description IS NULL OR p.description = '') THEN
    RETURN 'A_REDIGER';
  END IF;
  RETURN 'PRET_A_PUBLIER';
END;
$$;

-- Recalcul initial (aucun produit verrouillé manuellement pour l'instant)
UPDATE public.produits p
SET statut = public.calculer_statut_produit(p.*),
    actions_requises = public.calculer_actions_requises(p.*),
    statut_origine = 'automatique',
    statut_calcule_le = now()
WHERE p.statut_modifie_manuellement = false;

-- Tâches "expertiser le prix" (idempotent)
INSERT INTO public.taches (owner_id, produit_id, titre, type_action, priorite, statut)
SELECT p.owner_id,
       p.id,
       'Rechercher et valider le prix de vente de ' ||
         COALESCE(NULLIF(p.designer_ou_marque,'') || ' ' || COALESCE(p.modele,''), p.identifiant),
       'expertiser_prix',
       2,
       'a_faire'
FROM public.produits p
WHERE (p.prix_vente_cible IS NULL OR p.prix_vente_cible <= 0)
  AND p.designer_ou_marque IS NOT NULL AND p.designer_ou_marque <> ''
  AND p.modele IS NOT NULL AND p.modele <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.taches t
    WHERE t.produit_id = p.id AND t.type_action = 'expertiser_prix' AND t.statut IN ('a_faire','en_cours')
  );

-- Tâches "vérifier l'état" (idempotent)
INSERT INTO public.taches (owner_id, produit_id, titre, type_action, priorite, statut)
SELECT p.owner_id, p.id, 'Examiner l''état général du produit', 'verifier_etat', 3, 'a_faire'
FROM public.produits p
WHERE (p.nettoyage = 'a_verifier' OR p.restauration = 'a_verifier')
  AND NOT EXISTS (
    SELECT 1 FROM public.taches t
    WHERE t.produit_id = p.id AND t.type_action = 'verifier_etat' AND t.statut IN ('a_faire','en_cours')
  );
