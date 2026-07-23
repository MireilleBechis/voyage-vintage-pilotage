
DROP POLICY IF EXISTS produits_admin_collab_select ON public.produits;
DROP POLICY IF EXISTS produits_collab_insert ON public.produits;
DROP POLICY IF EXISTS produits_collab_update ON public.produits;
DROP POLICY IF EXISTS profiles_self ON public.profiles;
DROP POLICY IF EXISTS taches_owner_all ON public.taches;
DROP POLICY IF EXISTS user_permissions_admin_manage ON public.user_permissions;
DROP POLICY IF EXISTS user_permissions_self_read ON public.user_permissions;

CREATE POLICY produits_admin_collab_select ON public.produits
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role_name(auth.uid(), 'collaborateur'));

CREATE POLICY produits_collab_insert ON public.produits
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = owner_id AND (
      public.has_role(auth.uid(), 'admin')
      OR (public.has_role_name(auth.uid(), 'collaborateur') AND public.has_permission(auth.uid(), 'creer_produit'))
    )
  );

CREATE POLICY produits_collab_update ON public.produits
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR (public.has_role_name(auth.uid(), 'collaborateur') AND public.has_permission(auth.uid(), 'modifier_produit'))
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR (public.has_role_name(auth.uid(), 'collaborateur') AND public.has_permission(auth.uid(), 'modifier_produit'))
  );

CREATE POLICY profiles_self ON public.profiles
  FOR ALL TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY taches_owner_all ON public.taches
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY user_permissions_admin_manage ON public.user_permissions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY user_permissions_self_read ON public.user_permissions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY user_roles_admin_manage ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') AND user_id <> auth.uid())
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND user_id <> auth.uid());

CREATE OR REPLACE FUNCTION public.prevent_last_admin_removal()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE remaining int;
BEGIN
  IF (TG_OP = 'DELETE' AND OLD.role = 'admin') OR
     (TG_OP = 'UPDATE' AND OLD.role = 'admin' AND NEW.role <> 'admin') THEN
    SELECT count(*) INTO remaining FROM public.user_roles WHERE role = 'admin' AND user_id <> OLD.user_id;
    IF remaining = 0 THEN
      RAISE EXCEPTION 'Impossible de retirer le dernier administrateur';
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;

DROP TRIGGER IF EXISTS trg_prevent_last_admin_removal ON public.user_roles;
CREATE TRIGGER trg_prevent_last_admin_removal
  BEFORE UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_last_admin_removal();

DROP VIEW IF EXISTS public.produits_public;
CREATE VIEW public.produits_public
WITH (security_invoker = off) AS
SELECT
  id, identifiant, categorie, sous_categorie, designer_ou_marque, editeur_ou_label,
  modele, annee, titre_commercial, description, dimensions, materiaux, couleur, etat,
  photos, visibilite, disponibilite, prix_public_ttc,
  CASE WHEN public.has_role_name(auth.uid(), 'invite_pro')
         OR public.has_role(auth.uid(), 'admin')
         OR public.has_role_name(auth.uid(), 'collaborateur')
       THEN prix_pro_ht END AS prix_pro_ht,
  tva_taux, tva_regime, created_at, updated_at
FROM public.produits p
WHERE archived_at IS NULL
  AND trashed_at IS NULL
  AND (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role_name(auth.uid(), 'collaborateur')
    OR (public.has_role_name(auth.uid(), 'invite_pro') AND visibilite IN ('PRO','TOUS'))
    OR (public.has_role_name(auth.uid(), 'invite_particulier') AND visibilite IN ('PARTICULIER','TOUS'))
  );

COMMENT ON VIEW public.produits_public IS
  'Projection sécurisée. SECURITY DEFINER volontaire : la vue filtre visibilité + rôle et masque prix_achat, coûts, marges, prix minimum, factures et notes internes.';

REVOKE ALL ON public.produits_public FROM PUBLIC, anon;
GRANT SELECT ON public.produits_public TO authenticated;

CREATE TYPE public.invitation_statut AS ENUM ('en_attente','acceptee','expiree','revoquee');

CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role_propose public.app_role NOT NULL,
  permissions public.role_permission[] NOT NULL DEFAULT '{}',
  message text,
  statut public.invitation_statut NOT NULL DEFAULT 'en_attente',
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  invite_par uuid REFERENCES auth.users(id),
  accepte_par uuid REFERENCES auth.users(id),
  expire_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX invitations_email_idx ON public.invitations (lower(email));
CREATE UNIQUE INDEX invitations_token_idx ON public.invitations (token);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitations TO authenticated;
GRANT ALL ON public.invitations TO service_role;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY invitations_admin_all ON public.invitations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_invitations_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  acteur_id uuid REFERENCES auth.users(id),
  acteur_email text,
  action text NOT NULL,
  cible_type text,
  cible_id uuid,
  cible_email text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_log_created_at_idx ON public.audit_log (created_at DESC);

GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_log_admin_read ON public.audit_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY audit_log_authenticated_insert ON public.audit_log
  FOR INSERT TO authenticated
  WITH CHECK (acteur_id = auth.uid());

CREATE TABLE public.user_status (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  suspendu boolean NOT NULL DEFAULT false,
  motif text,
  suspendu_par uuid REFERENCES auth.users(id),
  suspendu_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_status TO authenticated;
GRANT ALL ON public.user_status TO service_role;
ALTER TABLE public.user_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_status_admin_all ON public.user_status
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY user_status_self_read ON public.user_status
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER trg_user_status_updated_at
  BEFORE UPDATE ON public.user_status
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
