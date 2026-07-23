-- === Étape 8 : RBAC + visibilité produits ===

-- 1) Étendre l'enum app_role (nouvelles valeurs)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'collaborateur';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'invite_particulier';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'invite_pro';

-- 2) Helper de vérification de rôle par nom (safe dans la même transaction
--    que l'extension d'enum : n'utilise pas de littéral enum nouveau)
CREATE OR REPLACE FUNCTION public.has_role_name(_user_id uuid, _role_name text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role::text = _role_name
  )
$$;

-- 3) Enum de permissions granulaires
DO $$ BEGIN
  CREATE TYPE public.role_permission AS ENUM (
    'voir_prix_achat', 'voir_marges', 'modifier_prix', 'voir_factures_achat',
    'creer_produit', 'modifier_produit', 'archiver_produit', 'exporter'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4) Table user_permissions (droits granulaires par utilisateur)
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission public.role_permission NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, permission)
);
GRANT SELECT ON public.user_permissions TO authenticated;
GRANT ALL ON public.user_permissions TO service_role;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_permissions_self_read" ON public.user_permissions;
CREATE POLICY "user_permissions_self_read" ON public.user_permissions
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

DROP POLICY IF EXISTS "user_permissions_admin_manage" ON public.user_permissions;
CREATE POLICY "user_permissions_admin_manage" ON public.user_permissions
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 5) has_permission : admin = toutes permissions
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _perm public.role_permission)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(_user_id, 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.user_permissions
      WHERE user_id = _user_id AND permission = _perm
    )
$$;

-- 6) Nouveaux enums produits
DO $$ BEGIN
  CREATE TYPE public.produit_visibilite AS ENUM ('PRIVE','PARTICULIER','PRO','TOUS','MASQUE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.produit_disponibilite AS ENUM ('DISPONIBLE','RESERVE','VENDU','NON_DISPONIBLE','SUR_DEMANDE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.tva_regime AS ENUM ('marge','normal');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.validation_statut AS ENUM ('brouillon','valide');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 7) Nouvelles colonnes sur produits (non destructif — les colonnes existantes
--    prix_vente_cible, statut, etc. sont conservées)
ALTER TABLE public.produits
  ADD COLUMN IF NOT EXISTS visibilite public.produit_visibilite NOT NULL DEFAULT 'PRIVE',
  ADD COLUMN IF NOT EXISTS disponibilite public.produit_disponibilite NOT NULL DEFAULT 'DISPONIBLE',
  ADD COLUMN IF NOT EXISTS prix_public_ttc numeric(10,2),
  ADD COLUMN IF NOT EXISTS prix_pro_ht numeric(10,2),
  ADD COLUMN IF NOT EXISTS tva_regime public.tva_regime NOT NULL DEFAULT 'marge',
  ADD COLUMN IF NOT EXISTS tva_taux numeric(5,2) NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS prix_minimum_interne numeric(10,2),
  ADD COLUMN IF NOT EXISTS remise_pro_pct numeric(5,2),
  ADD COLUMN IF NOT EXISTS tarif_pro_valide_jusqu date,
  ADD COLUMN IF NOT EXISTS validation_statut public.validation_statut NOT NULL DEFAULT 'brouillon';

-- 8) Backfill : reprend le prix de vente cible existant en prix public TTC
UPDATE public.produits
   SET prix_public_ttc = prix_vente_cible
 WHERE prix_public_ttc IS NULL
   AND prix_vente_cible IS NOT NULL;

-- Aligne la disponibilité sur le statut actuel
UPDATE public.produits SET disponibilite = 'VENDU'   WHERE statut = 'VENDU';
UPDATE public.produits SET disponibilite = 'RESERVE' WHERE statut = 'RESERVE';

-- 9) RLS produits : ajout de policies admin/collaborateur (additif : les
--    policies "owner" existantes ne sont pas touchées, Postgres combine en OR)
DROP POLICY IF EXISTS "produits_admin_collab_select" ON public.produits;
CREATE POLICY "produits_admin_collab_select" ON public.produits
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role_name(auth.uid(), 'collaborateur')
  );

DROP POLICY IF EXISTS "produits_collab_insert" ON public.produits;
CREATE POLICY "produits_collab_insert" ON public.produits
  FOR INSERT WITH CHECK (
    auth.uid() = owner_id AND (
      public.has_role(auth.uid(), 'admin'::public.app_role)
      OR (
        public.has_role_name(auth.uid(), 'collaborateur')
        AND public.has_permission(auth.uid(), 'creer_produit'::public.role_permission)
      )
    )
  );

DROP POLICY IF EXISTS "produits_collab_update" ON public.produits;
CREATE POLICY "produits_collab_update" ON public.produits
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR (
      public.has_role_name(auth.uid(), 'collaborateur')
      AND public.has_permission(auth.uid(), 'modifier_produit'::public.role_permission)
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR (
      public.has_role_name(auth.uid(), 'collaborateur')
      AND public.has_permission(auth.uid(), 'modifier_produit'::public.role_permission)
    )
  );

-- 10) Vue catalogue invité : projection safe des produits, sans données internes.
--     WITH (security_invoker = off) : la vue s'exécute avec les droits de son
--     propriétaire et bypass la RLS de la table produits. Le WHERE ci-dessous
--     est ce qui protège l'accès (rôle + visibilité + archivé/corbeille).
DROP VIEW IF EXISTS public.produits_public;
CREATE VIEW public.produits_public
WITH (security_invoker = off) AS
SELECT
  p.id, p.identifiant, p.categorie, p.sous_categorie,
  p.designer_ou_marque, p.editeur_ou_label, p.modele, p.annee,
  p.titre_commercial, p.description,
  p.dimensions, p.materiaux, p.couleur, p.etat,
  p.photos, p.visibilite, p.disponibilite,
  p.prix_public_ttc,
  -- Le prix pro n'est projeté que pour les invités professionnels
  CASE WHEN public.has_role_name(auth.uid(), 'invite_pro')
       THEN p.prix_pro_ht ELSE NULL END AS prix_pro_ht,
  CASE WHEN public.has_role_name(auth.uid(), 'invite_pro')
       THEN p.tva_taux ELSE NULL END AS tva_taux,
  CASE WHEN public.has_role_name(auth.uid(), 'invite_pro')
       THEN p.tva_regime ELSE NULL END AS tva_regime,
  p.created_at, p.updated_at
FROM public.produits p
WHERE
  p.archived_at IS NULL
  AND p.trashed_at IS NULL
  AND p.visibilite NOT IN ('PRIVE'::public.produit_visibilite, 'MASQUE'::public.produit_visibilite)
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role_name(auth.uid(), 'collaborateur')
    OR (
      public.has_role_name(auth.uid(), 'invite_particulier')
      AND p.visibilite IN ('PARTICULIER'::public.produit_visibilite, 'TOUS'::public.produit_visibilite)
    )
    OR (
      public.has_role_name(auth.uid(), 'invite_pro')
      AND p.visibilite IN ('PRO'::public.produit_visibilite, 'TOUS'::public.produit_visibilite)
    )
  );

GRANT SELECT ON public.produits_public TO authenticated;
COMMENT ON VIEW public.produits_public IS
  'Catalogue invité — projection sans champs financiers internes, filtrée par rôle et visibilité.';