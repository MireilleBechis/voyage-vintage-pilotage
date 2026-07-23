
-- Enums
CREATE TYPE public.categorie_produit AS ENUM ('enceintes','chaises','fauteuils','tables','meubles','canapes','luminaires','autre');
CREATE TYPE public.statut_produit AS ENUM ('A_IDENTIFIER','A_EXPERTISER','A_NETTOYER','A_RESTAURER','A_PHOTOGRAPHIER','A_REDIGER','PRET_A_PUBLIER','EN_LIGNE','RESERVE','VENDU','ARCHIVE');
CREATE TYPE public.type_action AS ENUM ('nettoyage','restauration','photo','redaction','publication','livraison','expertise','identification','autre');
CREATE TYPE public.statut_tache AS ENUM ('a_faire','en_cours','fait','annule');

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom_affichage TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_self" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- produits
CREATE TABLE public.produits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  identifiant TEXT NOT NULL,
  categorie public.categorie_produit NOT NULL,
  sous_categorie TEXT,
  designer_ou_marque TEXT,
  editeur_ou_label TEXT,
  type_objet TEXT,
  modele TEXT,
  annee TEXT,
  description TEXT,
  materiaux TEXT,
  couleur TEXT,
  etat TEXT,
  dimensions TEXT,
  poids TEXT,
  emplacement_stockage TEXT,
  canal_achat TEXT,
  date_achat DATE,
  prix_achat NUMERIC(10,2),
  cout_travaux NUMERIC(10,2) DEFAULT 0,
  cout_transport NUMERIC(10,2) DEFAULT 0,
  cout_total NUMERIC(10,2) GENERATED ALWAYS AS (COALESCE(prix_achat,0) + COALESCE(cout_travaux,0) + COALESCE(cout_transport,0)) STORED,
  prix_vente_cible NUMERIC(10,2),
  prix_minimum_accepte NUMERIC(10,2),
  prix_vente_reel NUMERIC(10,2),
  marge_potentielle NUMERIC(10,2) GENERATED ALWAYS AS (COALESCE(prix_vente_cible,0) - (COALESCE(prix_achat,0) + COALESCE(cout_travaux,0) + COALESCE(cout_transport,0))) STORED,
  date_vente DATE,
  statut public.statut_produit NOT NULL DEFAULT 'A_IDENTIFIER',
  prochaine_action TEXT,
  blocage TEXT,
  niveau_effort SMALLINT CHECK (niveau_effort BETWEEN 1 AND 5),
  date_limite DATE,
  notes TEXT,
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  documents_authenticite JSONB NOT NULL DEFAULT '[]'::jsonb,
  liens_annonces JSONB NOT NULL DEFAULT '[]'::jsonb,
  plateformes_publication TEXT[] NOT NULL DEFAULT '{}',
  shopify_product_id TEXT,
  -- import & qualité
  source_feuille TEXT,
  source_ligne INTEGER,
  import_original JSONB,
  donnees_douteuses JSONB,
  doublon_groupe TEXT,
  doublon_valide BOOLEAN NOT NULL DEFAULT FALSE,
  -- champs bruts complémentaires
  pied TEXT, revetement TEXT, coque_assise TEXT, forme TEXT, cabinet TEXT,
  puissance TEXT, frequence TEXT, impedance TEXT, sensibilite TEXT, woodcase TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_id, identifiant)
);
CREATE INDEX produits_owner_statut_idx ON public.produits (owner_id, statut);
CREATE INDEX produits_owner_categorie_idx ON public.produits (owner_id, categorie);
CREATE INDEX produits_doublon_idx ON public.produits (owner_id, doublon_groupe) WHERE doublon_groupe IS NOT NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.produits TO authenticated;
GRANT ALL ON public.produits TO service_role;
ALTER TABLE public.produits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "produits_owner_all" ON public.produits FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Marge réelle: uniquement si vendu, calculée côté client via vue
CREATE OR REPLACE FUNCTION public.marge_reelle(p public.produits) RETURNS NUMERIC LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE WHEN p.statut = 'VENDU' AND p.prix_vente_reel IS NOT NULL
              THEN p.prix_vente_reel - p.cout_total ELSE NULL END
$$;

-- taches
CREATE TABLE public.taches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  produit_id UUID REFERENCES public.produits(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  type_action public.type_action NOT NULL DEFAULT 'autre',
  priorite SMALLINT NOT NULL DEFAULT 3 CHECK (priorite BETWEEN 1 AND 5),
  justification_priorite TEXT,
  duree_estimee_min INTEGER,
  date_limite DATE,
  statut public.statut_tache NOT NULL DEFAULT 'a_faire',
  notes TEXT,
  date_completion TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX taches_owner_statut_idx ON public.taches (owner_id, statut);
CREATE INDEX taches_produit_idx ON public.taches (produit_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.taches TO authenticated;
GRANT ALL ON public.taches TO service_role;
ALTER TABLE public.taches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "taches_owner_all" ON public.taches FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER produits_updated_at BEFORE UPDATE ON public.produits FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER taches_updated_at BEFORE UPDATE ON public.taches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- auto-profile
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nom_affichage) VALUES (NEW.id, split_part(NEW.email, '@', 1))
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
