DROP VIEW IF EXISTS public.lots_detail;
CREATE VIEW public.lots_detail
WITH (security_invoker = off) AS
SELECT
  l.id,
  l.identifiant,
  l.libelle,
  l.description,
  l.notes,
  l.owner_id,
  l.prix_lot_negocie,
  l.archived_at,
  l.trashed_at,
  l.created_at,
  l.updated_at,
  COALESCE(agg.nb_produits, 0) AS nb_produits,
  COALESCE(agg.prix_calcule, 0) AS prix_calcule,
  CASE
    WHEN COALESCE(agg.nb_produits, 0) = 0 THEN 'dissous'
    WHEN COALESCE(agg.nb_vendus, 0) = 0 THEN 'complet'
    WHEN agg.nb_vendus < agg.nb_produits THEN 'partiellement_vendu'
    ELSE 'dissous'
  END AS statut_calcule
FROM public.lots l
LEFT JOIN LATERAL (
  SELECT
    count(*)::int AS nb_produits,
    COALESCE(sum(p.prix_vente_cible), 0) AS prix_calcule,
    count(*) FILTER (WHERE p.statut = 'VENDU')::int AS nb_vendus
  FROM public.lot_produits lp
  JOIN public.produits p ON p.id = lp.produit_id
  WHERE lp.lot_id = l.id
) agg ON true
WHERE public._is_interne(auth.uid());

REVOKE ALL ON public.lots_detail FROM anon, authenticated;
GRANT SELECT ON public.lots_detail TO authenticated;
GRANT ALL ON public.lots_detail TO service_role;