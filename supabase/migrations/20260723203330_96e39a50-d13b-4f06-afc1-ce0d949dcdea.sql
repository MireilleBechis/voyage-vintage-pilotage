
-- helper
CREATE OR REPLACE FUNCTION public.can_view_finances(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT has_role(_uid,'admin'::app_role)
      OR has_permission(_uid,'voir_prix_achat'::role_permission)
      OR has_permission(_uid,'voir_marges'::role_permission);
$$;
REVOKE ALL ON FUNCTION public.can_view_finances(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_view_finances(uuid) TO authenticated;

-- SELECT policy
DROP POLICY IF EXISTS produits_admin_collab_select ON public.produits;
CREATE POLICY produits_admin_collab_select ON public.produits
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR (has_role_name(auth.uid(), 'collaborateur') AND public.can_view_finances(auth.uid()))
  );

-- Vue interne masquant les colonnes financières
DROP VIEW IF EXISTS public.produits_interne;
CREATE VIEW public.produits_interne
WITH (security_invoker = off) AS
SELECT
  p.id, p.owner_id, p.identifiant, p.categorie, p.sous_categorie,
  p.designer_ou_marque, p.editeur_ou_label, p.type_objet, p.modele, p.annee,
  p.description, p.materiaux, p.couleur, p.etat, p.dimensions, p.poids,
  p.emplacement_stockage, p.canal_achat, p.date_achat,
  CASE WHEN public.can_view_finances(auth.uid()) THEN p.prix_achat END AS prix_achat,
  CASE WHEN public.can_view_finances(auth.uid()) THEN p.cout_travaux END AS cout_travaux,
  CASE WHEN public.can_view_finances(auth.uid()) THEN p.cout_transport END AS cout_transport,
  CASE WHEN public.can_view_finances(auth.uid()) THEN p.cout_total END AS cout_total,
  p.prix_vente_cible,
  CASE WHEN public.can_view_finances(auth.uid()) THEN p.prix_minimum_accepte END AS prix_minimum_accepte,
  p.prix_vente_reel,
  CASE WHEN public.can_view_finances(auth.uid()) THEN p.marge_potentielle END AS marge_potentielle,
  p.date_vente,
  p.statut, p.prochaine_action, p.blocage, p.niveau_effort, p.date_limite,
  p.notes, p.photos, p.documents_authenticite, p.liens_annonces,
  p.plateformes_publication, p.shopify_product_id,
  p.source_feuille, p.source_ligne, p.import_original, p.donnees_douteuses,
  p.doublon_groupe, p.doublon_valide,
  p.pied, p.revetement, p.coque_assise, p.forme, p.cabinet,
  p.puissance, p.frequence, p.impedance, p.sensibilite, p.woodcase,
  p.created_at, p.updated_at, p.nettoyage, p.restauration, p.actions_requises,
  p.titre_commercial, p.statut_origine, p.statut_modifie_manuellement, p.statut_calcule_le,
  p.archived_at, p.archived_by, p.archive_motif,
  p.trashed_at, p.trashed_by,
  p.visibilite, p.disponibilite,
  p.prix_public_ttc,
  CASE WHEN public.can_view_finances(auth.uid()) THEN p.prix_pro_ht END AS prix_pro_ht,
  p.tva_regime, p.tva_taux,
  CASE WHEN public.can_view_finances(auth.uid()) THEN p.prix_minimum_interne END AS prix_minimum_interne,
  CASE WHEN public.can_view_finances(auth.uid()) THEN p.remise_pro_pct END AS remise_pro_pct,
  p.tarif_pro_valide_jusqu, p.validation_statut
FROM public.produits p
WHERE
  has_role(auth.uid(),'admin'::app_role)
  OR has_role_name(auth.uid(),'collaborateur')
  OR auth.uid() = p.owner_id;

REVOKE ALL ON public.produits_interne FROM PUBLIC, anon;
GRANT SELECT ON public.produits_interne TO authenticated;
GRANT ALL ON public.produits_interne TO service_role;
