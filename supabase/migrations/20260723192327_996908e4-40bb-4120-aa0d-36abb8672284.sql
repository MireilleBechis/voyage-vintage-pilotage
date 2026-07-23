
-- 1. Colonnes archivage / corbeille
DO $$ BEGIN
  CREATE TYPE public.motif_archivage AS ENUM (
    'vendu_anterieurement','retire_vente','conservation_perso','donne','perdu_endommage','erreur_saisie','autre'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.produits
  ADD COLUMN IF NOT EXISTS archived_at   timestamptz,
  ADD COLUMN IF NOT EXISTS archived_by   uuid,
  ADD COLUMN IF NOT EXISTS archive_motif public.motif_archivage,
  ADD COLUMN IF NOT EXISTS trashed_at    timestamptz,
  ADD COLUMN IF NOT EXISTS trashed_by    uuid;

CREATE INDEX IF NOT EXISTS produits_actif_idx
  ON public.produits (owner_id)
  WHERE archived_at IS NULL AND trashed_at IS NULL;
CREATE INDEX IF NOT EXISTS produits_corbeille_idx
  ON public.produits (owner_id) WHERE trashed_at IS NOT NULL;

-- 2. Rôles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role    public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_roles_self_read ON public.user_roles;
CREATE POLICY user_roles_self_read ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Promeut tous les utilisateurs existants en admin (mono-utilisatrice)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users
ON CONFLICT DO NOTHING;

-- 3. Historique
DO $$ BEGIN
  CREATE TYPE public.action_historique AS ENUM (
    'cree','modifie','archive','restaure_archive','corbeille','restaure_corbeille','supprime'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.produit_historique (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produit_id   uuid,
  owner_id     uuid NOT NULL,
  identifiant  text NOT NULL,
  action       public.action_historique NOT NULL,
  acteur_id    uuid,
  acteur_email text,
  details      jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.produit_historique TO authenticated;
GRANT ALL ON public.produit_historique TO service_role;
ALTER TABLE public.produit_historique ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS histo_owner_read ON public.produit_historique;
CREATE POLICY histo_owner_read ON public.produit_historique
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);

CREATE INDEX IF NOT EXISTS histo_produit_idx ON public.produit_historique (produit_id, created_at DESC);
CREATE INDEX IF NOT EXISTS histo_owner_idx   ON public.produit_historique (owner_id, created_at DESC);

-- 4. Triggers historique
CREATE OR REPLACE FUNCTION public.log_produit_action()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_action public.action_historique;
  v_email text;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();

  IF TG_OP = 'INSERT' THEN
    v_action := 'cree';
    INSERT INTO public.produit_historique (produit_id, owner_id, identifiant, action, acteur_id, acteur_email)
    VALUES (NEW.id, NEW.owner_id, NEW.identifiant, v_action, auth.uid(), v_email);
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.produit_historique (produit_id, owner_id, identifiant, action, acteur_id, acteur_email)
    VALUES (OLD.id, OLD.owner_id, OLD.identifiant, 'supprime', auth.uid(), v_email);
    RETURN OLD;
  END IF;

  -- UPDATE : détecter transitions
  IF OLD.trashed_at IS NULL AND NEW.trashed_at IS NOT NULL THEN
    v_action := 'corbeille';
  ELSIF OLD.trashed_at IS NOT NULL AND NEW.trashed_at IS NULL THEN
    v_action := 'restaure_corbeille';
  ELSIF OLD.archived_at IS NULL AND NEW.archived_at IS NOT NULL THEN
    v_action := 'archive';
  ELSIF OLD.archived_at IS NOT NULL AND NEW.archived_at IS NULL THEN
    v_action := 'restaure_archive';
  ELSE
    v_action := 'modifie';
  END IF;

  INSERT INTO public.produit_historique (produit_id, owner_id, identifiant, action, acteur_id, acteur_email, details)
  VALUES (NEW.id, NEW.owner_id, NEW.identifiant, v_action, auth.uid(), v_email,
          CASE WHEN v_action = 'archive' THEN jsonb_build_object('motif', NEW.archive_motif) ELSE NULL END);
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS produits_hist_ins ON public.produits;
CREATE TRIGGER produits_hist_ins AFTER INSERT ON public.produits
  FOR EACH ROW EXECUTE FUNCTION public.log_produit_action();

DROP TRIGGER IF EXISTS produits_hist_upd ON public.produits;
CREATE TRIGGER produits_hist_upd AFTER UPDATE ON public.produits
  FOR EACH ROW EXECUTE FUNCTION public.log_produit_action();

DROP TRIGGER IF EXISTS produits_hist_del ON public.produits;
CREATE TRIGGER produits_hist_del BEFORE DELETE ON public.produits
  FOR EACH ROW EXECUTE FUNCTION public.log_produit_action();

-- 5. Split policy produits (DELETE réservé admin)
DROP POLICY IF EXISTS produits_owner_all ON public.produits;
CREATE POLICY produits_owner_select ON public.produits
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY produits_owner_insert ON public.produits
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY produits_owner_update ON public.produits
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY produits_admin_delete ON public.produits
  FOR DELETE TO authenticated USING (auth.uid() = owner_id AND public.has_role(auth.uid(), 'admin'));
