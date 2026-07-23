
-- Étape 2a : ajouts non destructifs (enum + colonnes)

-- Nouvelle valeur d'enum statut_produit
ALTER TYPE public.statut_produit ADD VALUE IF NOT EXISTS 'ETAT_A_VERIFIER' BEFORE 'A_NETTOYER';

-- Nouveaux types d'actions de tâches
ALTER TYPE public.type_action ADD VALUE IF NOT EXISTS 'expertiser_prix';
ALTER TYPE public.type_action ADD VALUE IF NOT EXISTS 'verifier_etat';
ALTER TYPE public.type_action ADD VALUE IF NOT EXISTS 'verifier_authenticite';
ALTER TYPE public.type_action ADD VALUE IF NOT EXISTS 'mesurer';
ALTER TYPE public.type_action ADD VALUE IF NOT EXISTS 'tester';
ALTER TYPE public.type_action ADD VALUE IF NOT EXISTS 'emballer';
ALTER TYPE public.type_action ADD VALUE IF NOT EXISTS 'relancer';

-- Nouveaux enums pour nettoyage / restauration
DO $$ BEGIN
  CREATE TYPE public.etat_nettoyage AS ENUM ('a_verifier','necessaire','non_necessaire','termine');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.etat_restauration AS ENUM ('a_verifier','necessaire','non_necessaire','terminee');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.origine_statut AS ENUM ('automatique','manuel');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Colonnes sur produits
ALTER TABLE public.produits
  ADD COLUMN IF NOT EXISTS nettoyage public.etat_nettoyage NOT NULL DEFAULT 'a_verifier',
  ADD COLUMN IF NOT EXISTS restauration public.etat_restauration NOT NULL DEFAULT 'a_verifier',
  ADD COLUMN IF NOT EXISTS actions_requises text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS titre_commercial text,
  ADD COLUMN IF NOT EXISTS statut_origine public.origine_statut NOT NULL DEFAULT 'automatique',
  ADD COLUMN IF NOT EXISTS statut_modifie_manuellement boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS statut_calcule_le timestamptz;
