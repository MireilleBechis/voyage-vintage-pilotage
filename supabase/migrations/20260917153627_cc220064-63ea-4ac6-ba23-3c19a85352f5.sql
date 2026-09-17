
-- ============================================================
-- 1. RÉFÉRENTIELS
-- ============================================================
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  libelle text NOT NULL,
  slug text NOT NULL UNIQUE,
  ordre integer NOT NULL DEFAULT 0,
  actif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY categories_read ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY categories_admin ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.sous_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categorie_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  libelle text NOT NULL,
  slug text NOT NULL,
  ordre integer NOT NULL DEFAULT 0,
  actif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (categorie_id, slug)
);
GRANT SELECT ON public.sous_categories TO authenticated;
GRANT ALL ON public.sous_categories TO service_role;
ALTER TABLE public.sous_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY sous_categories_read ON public.sous_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY sous_categories_admin ON public.sous_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER sous_categories_updated_at BEFORE UPDATE ON public.sous_categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.types_objet (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  libelle text NOT NULL,
  slug text NOT NULL UNIQUE,
  ordre integer NOT NULL DEFAULT 0,
  actif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.types_objet TO authenticated;
GRANT ALL ON public.types_objet TO service_role;
ALTER TABLE public.types_objet ENABLE ROW LEVEL SECURITY;
CREATE POLICY types_objet_read ON public.types_objet FOR SELECT TO authenticated USING (true);
CREATE POLICY types_objet_admin ON public.types_objet FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER types_objet_updated_at BEFORE UPDATE ON public.types_objet FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.matieres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  libelle text NOT NULL,
  parent_id uuid REFERENCES public.matieres(id) ON DELETE CASCADE,
  ordre integer NOT NULL DEFAULT 0,
  actif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX matieres_unique_racine ON public.matieres (lower(libelle)) WHERE parent_id IS NULL;
CREATE UNIQUE INDEX matieres_unique_enfant ON public.matieres (parent_id, lower(libelle)) WHERE parent_id IS NOT NULL;
GRANT SELECT ON public.matieres TO authenticated;
GRANT ALL ON public.matieres TO service_role;
ALTER TABLE public.matieres ENABLE ROW LEVEL SECURITY;
CREATE POLICY matieres_read ON public.matieres FOR SELECT TO authenticated USING (true);
CREATE POLICY matieres_admin ON public.matieres FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER matieres_updated_at BEFORE UPDATE ON public.matieres FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.categorie_champs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categorie_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  champ text NOT NULL,
  libelle text NOT NULL,
  ordre integer NOT NULL DEFAULT 0,
  obligatoire boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (categorie_id, champ)
);
GRANT SELECT ON public.categorie_champs TO authenticated;
GRANT ALL ON public.categorie_champs TO service_role;
ALTER TABLE public.categorie_champs ENABLE ROW LEVEL SECURITY;
CREATE POLICY categorie_champs_read ON public.categorie_champs FOR SELECT TO authenticated USING (true);
CREATE POLICY categorie_champs_admin ON public.categorie_champs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER categorie_champs_updated_at BEFORE UPDATE ON public.categorie_champs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Données de départ ------------------------------------------------
INSERT INTO public.categories (libelle, slug, ordre) VALUES
  ('Enceintes','enceintes',1),('Chaises','chaises',2),('Fauteuils','fauteuils',3),
  ('Tables','tables',4),('Meubles','meubles',5),('Canapés','canapes',6),
  ('Luminaires','luminaires',7),('Autre','autre',8);

INSERT INTO public.categorie_champs (categorie_id, champ, libelle, ordre, obligatoire)
SELECT c.id, v.champ, v.libelle, v.ordre, false
FROM public.categories c
JOIN (VALUES
  ('enceintes','puissance','Puissance',1),
  ('enceintes','frequence','Bande passante',2),
  ('enceintes','impedance','Impédance',3),
  ('enceintes','sensibilite','Sensibilité',4),
  ('enceintes','cabinet','Type de cabinet',5),
  ('enceintes','woodcase','Ébénisterie',6),
  ('chaises','pied','Piétement',1),
  ('chaises','revetement','Revêtement',2),
  ('chaises','coque_assise','Coque / assise',3),
  ('chaises','forme','Forme',4),
  ('fauteuils','pied','Piétement',1),
  ('fauteuils','revetement','Revêtement',2),
  ('fauteuils','coque_assise','Coque / assise',3),
  ('fauteuils','forme','Forme',4),
  ('canapes','pied','Piétement',1),
  ('canapes','revetement','Revêtement',2),
  ('canapes','coque_assise','Coque / assise',3),
  ('canapes','forme','Forme',4),
  ('tables','pied','Piétement',1),
  ('tables','forme','Forme',2),
  ('tables','revetement','Revêtement / plateau',3),
  ('meubles','pied','Piétement',1),
  ('meubles','forme','Forme',2),
  ('meubles','revetement','Revêtement / plateau',3),
  ('luminaires','forme','Forme',1),
  ('luminaires','revetement','Revêtement / abat-jour',2)
) AS v(slug, champ, libelle, ordre) ON v.slug = c.slug;

INSERT INTO public.matieres (libelle, ordre) VALUES
  ('Bois',1),('Métal',2),('Tissu',3),('Cuir',4),('Verre',5),
  ('Plastique',6),('Rotin/Osier',7),('Marbre',8),('Céramique',9);

INSERT INTO public.matieres (libelle, parent_id, ordre)
SELECT v.libelle, m.id, v.ordre
FROM (VALUES
  ('Bois','Teck',1),('Bois','Palissandre',2),('Bois','Chêne',3),('Bois','Noyer',4),
  ('Bois','Hêtre',5),('Bois','Frêne',6),('Bois','Pin',7),('Bois','Acajou',8),
  ('Bois','Contreplaqué',9),('Bois','Bois exotique',10),
  ('Métal','Acier',1),('Métal','Laiton',2),('Métal','Chrome',3),('Métal','Aluminium',4),('Métal','Fonte',5),
  ('Tissu','Laine',1),('Tissu','Lin',2),('Tissu','Coton',3),('Tissu','Velours',4),('Tissu','Bouclette',5),
  ('Cuir','Cuir pleine fleur',1),('Cuir','Skaï/Simili',2),
  ('Plastique','ABS',1),('Plastique','Fibre de verre',2),('Plastique','Formica',3),('Plastique','Plexiglas',4)
) AS v(parent, libelle, ordre)
JOIN public.matieres m ON m.libelle = v.parent AND m.parent_id IS NULL;

-- ============================================================
-- 2. HELPERS DE DROITS
-- ============================================================
CREATE OR REPLACE FUNCTION public._can_modifier_produit(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT public.has_role(_uid,'admin'::app_role)
      OR (public.has_role_name(_uid,'collaborateur')
          AND public.has_permission(_uid,'modifier_produit'::role_permission));
$$;

-- ============================================================
-- 3. SUPPRESSION DES VUES / RPC DÉPENDANTES (recréées plus bas)
-- ============================================================
DROP FUNCTION IF EXISTS public.list_produits_interne();
DROP FUNCTION IF EXISTS public.get_produit_interne(uuid);
DROP FUNCTION IF EXISTS public.create_produit(jsonb);
DROP FUNCTION IF EXISTS public.update_produit(uuid, jsonb);
DROP VIEW IF EXISTS public.produits_interne;
DROP VIEW IF EXISTS public.produits_public;

-- ============================================================
-- 4. COLONNES PRODUITS
-- ============================================================
ALTER TABLE public.produits
  DROP COLUMN categorie,
  DROP COLUMN sous_categorie,
  DROP COLUMN type_objet,
  DROP COLUMN materiaux,
  ADD COLUMN categorie_shopify_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;

DROP TYPE IF EXISTS public.categorie_produit;

-- ============================================================
-- 5. LIAISONS PRODUIT ↔ RÉFÉRENTIELS
-- ============================================================
CREATE TYPE public.matiere_role AS ENUM ('principale','secondaire');

CREATE TABLE public.produit_categories (
  produit_id uuid NOT NULL REFERENCES public.produits(id) ON DELETE CASCADE,
  categorie_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (produit_id, categorie_id)
);
GRANT SELECT, INSERT, DELETE ON public.produit_categories TO authenticated;
GRANT ALL ON public.produit_categories TO service_role;
ALTER TABLE public.produit_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY pc_read ON public.produit_categories FOR SELECT TO authenticated USING (public._is_interne(auth.uid()));
CREATE POLICY pc_write ON public.produit_categories FOR ALL TO authenticated
  USING (public._can_modifier_produit(auth.uid())) WITH CHECK (public._can_modifier_produit(auth.uid()));

CREATE TABLE public.produit_sous_categories (
  produit_id uuid NOT NULL REFERENCES public.produits(id) ON DELETE CASCADE,
  sous_categorie_id uuid NOT NULL REFERENCES public.sous_categories(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (produit_id, sous_categorie_id)
);
GRANT SELECT, INSERT, DELETE ON public.produit_sous_categories TO authenticated;
GRANT ALL ON public.produit_sous_categories TO service_role;
ALTER TABLE public.produit_sous_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY psc_read ON public.produit_sous_categories FOR SELECT TO authenticated USING (public._is_interne(auth.uid()));
CREATE POLICY psc_write ON public.produit_sous_categories FOR ALL TO authenticated
  USING (public._can_modifier_produit(auth.uid())) WITH CHECK (public._can_modifier_produit(auth.uid()));

CREATE TABLE public.produit_types (
  produit_id uuid NOT NULL REFERENCES public.produits(id) ON DELETE CASCADE,
  type_objet_id uuid NOT NULL REFERENCES public.types_objet(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (produit_id, type_objet_id)
);
GRANT SELECT, INSERT, DELETE ON public.produit_types TO authenticated;
GRANT ALL ON public.produit_types TO service_role;
ALTER TABLE public.produit_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY pt_read ON public.produit_types FOR SELECT TO authenticated USING (public._is_interne(auth.uid()));
CREATE POLICY pt_write ON public.produit_types FOR ALL TO authenticated
  USING (public._can_modifier_produit(auth.uid())) WITH CHECK (public._can_modifier_produit(auth.uid()));

CREATE TABLE public.produit_matieres (
  produit_id uuid NOT NULL REFERENCES public.produits(id) ON DELETE CASCADE,
  matiere_id uuid NOT NULL REFERENCES public.matieres(id) ON DELETE RESTRICT,
  role public.matiere_role NOT NULL DEFAULT 'principale',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (produit_id, matiere_id, role)
);
GRANT SELECT, INSERT, DELETE ON public.produit_matieres TO authenticated;
GRANT ALL ON public.produit_matieres TO service_role;
ALTER TABLE public.produit_matieres ENABLE ROW LEVEL SECURITY;
CREATE POLICY pm_read ON public.produit_matieres FOR SELECT TO authenticated USING (public._is_interne(auth.uid()));
CREATE POLICY pm_write ON public.produit_matieres FOR ALL TO authenticated
  USING (public._can_modifier_produit(auth.uid())) WITH CHECK (public._can_modifier_produit(auth.uid()));

-- ============================================================
-- 6. LOTS
-- ============================================================
CREATE TABLE public.lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  identifiant text NOT NULL UNIQUE,
  libelle text NOT NULL,
  description text,
  prix_lot_negocie numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  trashed_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lots TO authenticated;
GRANT ALL ON public.lots TO service_role;
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
CREATE POLICY lots_read ON public.lots FOR SELECT TO authenticated USING (public._is_interne(auth.uid()));
CREATE POLICY lots_write ON public.lots FOR ALL TO authenticated
  USING (public._can_modifier_produit(auth.uid())) WITH CHECK (public._can_modifier_produit(auth.uid()));
CREATE TRIGGER lots_updated_at BEFORE UPDATE ON public.lots FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.lot_produits (
  lot_id uuid NOT NULL REFERENCES public.lots(id) ON DELETE CASCADE,
  produit_id uuid NOT NULL REFERENCES public.produits(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (lot_id, produit_id)
);
CREATE UNIQUE INDEX lot_produits_un_seul_lot ON public.lot_produits (produit_id);
GRANT SELECT, INSERT, DELETE ON public.lot_produits TO authenticated;
GRANT ALL ON public.lot_produits TO service_role;
ALTER TABLE public.lot_produits ENABLE ROW LEVEL SECURITY;
CREATE POLICY lp_read ON public.lot_produits FOR SELECT TO authenticated USING (public._is_interne(auth.uid()));
CREATE POLICY lp_write ON public.lot_produits FOR ALL TO authenticated
  USING (public._can_modifier_produit(auth.uid())) WITH CHECK (public._can_modifier_produit(auth.uid()));

CREATE VIEW public.lots_detail WITH (security_invoker = on) AS
SELECT l.*,
  (SELECT count(*) FROM public.lot_produits lp WHERE lp.lot_id = l.id) AS nb_produits,
  (SELECT COALESCE(sum(p.prix_vente_cible),0) FROM public.lot_produits lp
     JOIN public.produits p ON p.id = lp.produit_id WHERE lp.lot_id = l.id) AS prix_calcule,
  CASE
    WHEN (SELECT count(*) FROM public.lot_produits lp WHERE lp.lot_id = l.id) = 0 THEN 'dissous'
    WHEN NOT EXISTS (
      SELECT 1 FROM public.lot_produits lp JOIN public.produits p ON p.id = lp.produit_id
      WHERE lp.lot_id = l.id AND p.statut <> 'VENDU'::statut_produit AND p.archived_at IS NULL AND p.trashed_at IS NULL
    ) THEN 'dissous'
    WHEN EXISTS (
      SELECT 1 FROM public.lot_produits lp JOIN public.produits p ON p.id = lp.produit_id
      WHERE lp.lot_id = l.id AND p.statut = 'VENDU'::statut_produit
    ) THEN 'partiellement_vendu'
    ELSE 'complet'
  END AS statut_calcule
FROM public.lots l;
GRANT SELECT ON public.lots_detail TO authenticated;

-- ============================================================
-- 7. VUES PRODUITS
-- ============================================================
CREATE VIEW public.produits_interne AS
SELECT
  p.id, p.owner_id, p.identifiant,
  p.designer_ou_marque, p.editeur_ou_label, p.modele, p.annee,
  p.description, p.couleur, p.etat, p.dimensions, p.poids,
  p.emplacement_stockage, p.canal_achat, p.date_achat,
  CASE WHEN has_role(auth.uid(),'admin'::app_role) OR has_permission(auth.uid(),'voir_prix_achat'::role_permission) THEN p.prix_achat END AS prix_achat,
  CASE WHEN has_role(auth.uid(),'admin'::app_role) OR has_permission(auth.uid(),'voir_couts'::role_permission) OR has_permission(auth.uid(),'voir_prix_achat'::role_permission) THEN p.cout_travaux END AS cout_travaux,
  CASE WHEN has_role(auth.uid(),'admin'::app_role) OR has_permission(auth.uid(),'voir_couts'::role_permission) OR has_permission(auth.uid(),'voir_prix_achat'::role_permission) THEN p.cout_transport END AS cout_transport,
  CASE WHEN has_role(auth.uid(),'admin'::app_role) OR has_permission(auth.uid(),'voir_couts'::role_permission) OR has_permission(auth.uid(),'voir_prix_achat'::role_permission) THEN p.cout_total END AS cout_total,
  p.prix_vente_cible,
  CASE WHEN has_role(auth.uid(),'admin'::app_role) OR has_permission(auth.uid(),'voir_prix_minimum'::role_permission) THEN p.prix_minimum_accepte END AS prix_minimum_accepte,
  p.prix_vente_reel,
  CASE WHEN has_role(auth.uid(),'admin'::app_role) OR has_permission(auth.uid(),'voir_marges'::role_permission) THEN p.marge_potentielle END AS marge_potentielle,
  p.date_vente, p.statut, p.prochaine_action, p.blocage, p.niveau_effort, p.date_limite,
  p.notes, p.photos, p.documents_authenticite, p.liens_annonces, p.plateformes_publication,
  p.shopify_product_id, p.source_feuille, p.source_ligne, p.import_original,
  p.donnees_douteuses, p.doublon_groupe, p.doublon_valide,
  p.pied, p.revetement, p.coque_assise, p.forme, p.cabinet,
  p.puissance, p.frequence, p.impedance, p.sensibilite, p.woodcase,
  p.created_at, p.updated_at, p.nettoyage, p.restauration, p.actions_requises,
  p.titre_commercial, p.statut_origine, p.statut_modifie_manuellement, p.statut_calcule_le,
  p.archived_at, p.archived_by, p.archive_motif, p.trashed_at, p.trashed_by,
  p.visibilite, p.disponibilite, p.prix_public_ttc, p.prix_pro_ht, p.tva_regime, p.tva_taux,
  CASE WHEN has_role(auth.uid(),'admin'::app_role) OR has_permission(auth.uid(),'voir_prix_minimum'::role_permission) THEN p.prix_minimum_interne END AS prix_minimum_interne,
  p.remise_pro_pct, p.tarif_pro_valide_jusqu, p.validation_statut,
  p.categorie_shopify_id,
  COALESCE((SELECT array_agg(pc.categorie_id) FROM public.produit_categories pc WHERE pc.produit_id = p.id), '{}'::uuid[]) AS categorie_ids,
  COALESCE((SELECT array_agg(c.libelle ORDER BY c.ordre) FROM public.produit_categories pc JOIN public.categories c ON c.id = pc.categorie_id WHERE pc.produit_id = p.id), '{}'::text[]) AS categories_libelles,
  COALESCE((SELECT array_agg(psc.sous_categorie_id) FROM public.produit_sous_categories psc WHERE psc.produit_id = p.id), '{}'::uuid[]) AS sous_categorie_ids,
  COALESCE((SELECT array_agg(sc.libelle ORDER BY sc.ordre) FROM public.produit_sous_categories psc JOIN public.sous_categories sc ON sc.id = psc.sous_categorie_id WHERE psc.produit_id = p.id), '{}'::text[]) AS sous_categories_libelles,
  COALESCE((SELECT array_agg(pt.type_objet_id) FROM public.produit_types pt WHERE pt.produit_id = p.id), '{}'::uuid[]) AS type_objet_ids,
  COALESCE((SELECT array_agg(t.libelle ORDER BY t.ordre) FROM public.produit_types pt JOIN public.types_objet t ON t.id = pt.type_objet_id WHERE pt.produit_id = p.id), '{}'::text[]) AS types_libelles,
  COALESCE((SELECT jsonb_agg(jsonb_build_object('matiere_id', pm.matiere_id, 'role', pm.role, 'libelle', m.libelle, 'parent_id', m.parent_id) ORDER BY pm.role)
            FROM public.produit_matieres pm JOIN public.matieres m ON m.id = pm.matiere_id WHERE pm.produit_id = p.id), '[]'::jsonb) AS matieres,
  (SELECT lp.lot_id FROM public.lot_produits lp WHERE lp.produit_id = p.id LIMIT 1) AS lot_id,
  (SELECT l.identifiant FROM public.lot_produits lp JOIN public.lots l ON l.id = lp.lot_id WHERE lp.produit_id = p.id LIMIT 1) AS lot_identifiant,
  (SELECT l.libelle FROM public.lot_produits lp JOIN public.lots l ON l.id = lp.lot_id WHERE lp.produit_id = p.id LIMIT 1) AS lot_libelle
FROM public.produits p
WHERE has_role(auth.uid(),'admin'::app_role) OR has_role_name(auth.uid(),'collaborateur');

CREATE VIEW public.produits_public AS
SELECT
  p.id, p.identifiant,
  p.designer_ou_marque, p.editeur_ou_label, p.modele, p.annee,
  p.titre_commercial, p.description, p.dimensions, p.couleur, p.etat, p.photos,
  p.visibilite, p.disponibilite, p.prix_public_ttc,
  CASE WHEN has_role_name(auth.uid(),'invite_pro') OR has_role(auth.uid(),'admin'::app_role) OR has_role_name(auth.uid(),'collaborateur') THEN p.prix_pro_ht END AS prix_pro_ht,
  p.tva_taux, p.tva_regime, p.created_at, p.updated_at,
  COALESCE((SELECT array_agg(c.libelle ORDER BY c.ordre) FROM public.produit_categories pc JOIN public.categories c ON c.id = pc.categorie_id WHERE pc.produit_id = p.id), '{}'::text[]) AS categories_libelles,
  COALESCE((SELECT array_agg(sc.libelle ORDER BY sc.ordre) FROM public.produit_sous_categories psc JOIN public.sous_categories sc ON sc.id = psc.sous_categorie_id WHERE psc.produit_id = p.id), '{}'::text[]) AS sous_categories_libelles,
  COALESCE((SELECT array_agg(t.libelle ORDER BY t.ordre) FROM public.produit_types pt JOIN public.types_objet t ON t.id = pt.type_objet_id WHERE pt.produit_id = p.id), '{}'::text[]) AS types_libelles,
  COALESCE((SELECT array_agg(m.libelle) FROM public.produit_matieres pm JOIN public.matieres m ON m.id = pm.matiere_id WHERE pm.produit_id = p.id), '{}'::text[]) AS matieres_libelles
FROM public.produits p
WHERE p.archived_at IS NULL AND p.trashed_at IS NULL
  AND (has_role(auth.uid(),'admin'::app_role)
       OR has_role_name(auth.uid(),'collaborateur')
       OR (has_role_name(auth.uid(),'invite_pro') AND p.visibilite = ANY (ARRAY['PRO'::produit_visibilite,'TOUS'::produit_visibilite]))
       OR (has_role_name(auth.uid(),'invite_particulier') AND p.visibilite = ANY (ARRAY['PARTICULIER'::produit_visibilite,'TOUS'::produit_visibilite])));

REVOKE ALL ON public.produits_public FROM authenticated, anon;
REVOKE ALL ON public.produits_interne FROM authenticated, anon;
GRANT SELECT ON public.produits_public TO authenticated;

-- ============================================================
-- 8. RPC PRODUITS
-- ============================================================
CREATE OR REPLACE FUNCTION public._ordinary_editable_fields()
RETURNS text[] LANGUAGE sql IMMUTABLE AS $$
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

CREATE OR REPLACE FUNCTION public.list_produits_interne()
RETURNS SETOF public.produits_interne
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public','pg_temp' AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Non authentifié' USING ERRCODE='42501'; END IF;
  IF NOT public._is_interne(auth.uid()) THEN RAISE EXCEPTION 'Accès refusé' USING ERRCODE='42501'; END IF;
  RETURN QUERY SELECT * FROM public.produits_interne;
END; $$;

CREATE OR REPLACE FUNCTION public.get_produit_interne(_id uuid)
RETURNS public.produits_interne
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public','pg_temp' AS $$
DECLARE row public.produits_interne;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Non authentifié' USING ERRCODE='42501'; END IF;
  IF NOT public._is_interne(auth.uid()) THEN RAISE EXCEPTION 'Accès refusé' USING ERRCODE='42501'; END IF;
  IF _id IS NULL THEN RAISE EXCEPTION 'id requis'; END IF;
  SELECT * INTO row FROM public.produits_interne WHERE id = _id;
  RETURN row;
END; $$;

CREATE OR REPLACE FUNCTION public.create_produit(_data jsonb)
RETURNS public.produits_interne
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_temp' AS $$
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
  IF _data IS NULL OR jsonb_typeof(_data) <> 'object' THEN RAISE EXCEPTION 'Paramètres invalides'; END IF;
  IF COALESCE(_data->>'identifiant','') = '' THEN RAISE EXCEPTION 'identifiant requis'; END IF;

  v_is_admin := public.has_role(v_uid,'admin'::app_role);
  v_can_create := v_is_admin OR (
    public.has_role_name(v_uid,'collaborateur')
    AND public.has_permission(v_uid,'creer_produit'::role_permission)
  );
  IF NOT v_can_create THEN RAISE EXCEPTION 'Création interdite' USING ERRCODE='42501'; END IF;

  FOR k IN SELECT jsonb_object_keys(_data) LOOP
    IF k IN ('owner_id','identifiant','id','created_at','updated_at') THEN CONTINUE;
    ELSIF k = ANY(fin) THEN PERFORM public._check_finance_field_write(v_uid, k);
    ELSIF k = ANY(ord) THEN NULL;
    ELSE RAISE EXCEPTION 'Champ non autorisé à la création: %', k USING ERRCODE='42501';
    END IF;
  END LOOP;

  INSERT INTO public.produits
  SELECT (jsonb_populate_record(NULL::public.produits, _data || jsonb_build_object('owner_id', v_uid))).*
  RETURNING id INTO new_id;

  SELECT * INTO row FROM public.produits_interne WHERE id = new_id;
  RETURN row;
END; $$;

CREATE OR REPLACE FUNCTION public.update_produit(_id uuid, _data jsonb)
RETURNS public.produits_interne
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_temp' AS $$
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
  IF _id IS NULL OR _data IS NULL OR jsonb_typeof(_data) <> 'object' THEN RAISE EXCEPTION 'Paramètres invalides'; END IF;

  v_is_admin := public.has_role(v_uid,'admin'::app_role);
  v_can_modif := v_is_admin OR (
    public.has_role_name(v_uid,'collaborateur')
    AND public.has_permission(v_uid,'modifier_produit'::role_permission)
  );

  FOR k IN SELECT jsonb_object_keys(_data) LOOP
    IF k = ANY(fin) THEN PERFORM public._check_finance_field_write(v_uid, k);
    ELSIF k = ANY(ord) THEN
      IF NOT v_can_modif THEN
        RAISE EXCEPTION 'Modification interdite (champ %) — permission modifier_produit requise', k USING ERRCODE='42501';
      END IF;
    ELSE RAISE EXCEPTION 'Champ non modifiable: %', k USING ERRCODE='42501';
    END IF;
  END LOOP;

  SELECT array_agg(x) INTO keys FROM jsonb_object_keys(_data) x;
  IF keys IS NULL OR array_length(keys,1) IS NULL THEN RAISE EXCEPTION 'Aucun champ à modifier'; END IF;

  set_sql := (
    SELECT string_agg(format('%I = (jsonb_populate_record(NULL::public.produits, %L::jsonb)).%I', c, _data::text, c), ', ')
    FROM unnest(keys) c
  );
  EXECUTE format('UPDATE public.produits SET %s WHERE id = %L', set_sql, _id);

  SELECT * INTO row FROM public.produits_interne WHERE id = _id;
  RETURN row;
END; $$;

-- Rattachements (remplacement complet de la liste) -------------------
CREATE OR REPLACE FUNCTION public.set_produit_rattachements(
  _id uuid, _categories uuid[], _sous_categories uuid[], _types uuid[], _matieres jsonb
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_temp' AS $$
DECLARE v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Non authentifié' USING ERRCODE='42501'; END IF;
  IF NOT public._can_modifier_produit(v_uid) THEN RAISE EXCEPTION 'Modification interdite' USING ERRCODE='42501'; END IF;
  IF _id IS NULL THEN RAISE EXCEPTION 'id requis'; END IF;

  IF _categories IS NOT NULL THEN
    DELETE FROM public.produit_categories WHERE produit_id = _id;
    INSERT INTO public.produit_categories (produit_id, categorie_id)
      SELECT _id, x FROM unnest(_categories) x ON CONFLICT DO NOTHING;
  END IF;
  IF _sous_categories IS NOT NULL THEN
    DELETE FROM public.produit_sous_categories WHERE produit_id = _id;
    INSERT INTO public.produit_sous_categories (produit_id, sous_categorie_id)
      SELECT _id, x FROM unnest(_sous_categories) x ON CONFLICT DO NOTHING;
  END IF;
  IF _types IS NOT NULL THEN
    DELETE FROM public.produit_types WHERE produit_id = _id;
    INSERT INTO public.produit_types (produit_id, type_objet_id)
      SELECT _id, x FROM unnest(_types) x ON CONFLICT DO NOTHING;
  END IF;
  IF _matieres IS NOT NULL THEN
    DELETE FROM public.produit_matieres WHERE produit_id = _id;
    INSERT INTO public.produit_matieres (produit_id, matiere_id, role)
      SELECT _id, (e->>'matiere_id')::uuid, (e->>'role')::public.matiere_role
      FROM jsonb_array_elements(_matieres) e
      WHERE COALESCE(e->>'matiere_id','') <> ''
      ON CONFLICT DO NOTHING;
  END IF;

  -- La catégorie Shopify doit rester dans les catégories cochées
  UPDATE public.produits SET categorie_shopify_id = NULL
   WHERE id = _id AND categorie_shopify_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM public.produit_categories pc WHERE pc.produit_id = _id AND pc.categorie_id = produits.categorie_shopify_id);
END; $$;

-- Prochain identifiant DV-xxxx --------------------------------------
CREATE OR REPLACE FUNCTION public.prochain_identifiant_produit()
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public','pg_temp' AS $$
DECLARE n integer;
BEGIN
  IF auth.uid() IS NULL OR NOT public._is_interne(auth.uid()) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE='42501';
  END IF;
  SELECT COALESCE(max(NULLIF(regexp_replace(identifiant, '^DV-', ''), '')::integer), 0) + 1
    INTO n FROM public.produits WHERE identifiant ~ '^DV-[0-9]+$';
  RETURN 'DV-' || lpad(n::text, 4, '0');
END; $$;

CREATE OR REPLACE FUNCTION public.prochain_identifiant_lot()
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public','pg_temp' AS $$
DECLARE n integer;
BEGIN
  IF auth.uid() IS NULL OR NOT public._is_interne(auth.uid()) THEN
    RAISE EXCEPTION 'Accès refusé' USING ERRCODE='42501';
  END IF;
  SELECT COALESCE(max(NULLIF(regexp_replace(identifiant, '^LOT-', ''), '')::integer), 0) + 1
    INTO n FROM public.lots WHERE identifiant ~ '^LOT-[0-9]+$';
  RETURN 'LOT-' || lpad(n::text, 4, '0');
END; $$;
