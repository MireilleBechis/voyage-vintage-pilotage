// Référentiels administrables : catégories, sous-catégories, types d'objet,
// matières (hiérarchie à 2 niveaux) et configuration des champs par catégorie.
import { supabase } from "@/integrations/supabase/client";

export interface Categorie {
  id: string;
  libelle: string;
  slug: string;
  ordre: number;
  actif: boolean;
}
export interface SousCategorie extends Categorie {
  categorie_id: string;
}
export interface TypeObjet extends Categorie {}
export interface Matiere {
  id: string;
  libelle: string;
  parent_id: string | null;
  ordre: number;
  actif: boolean;
}
export interface CategorieChamp {
  id: string;
  categorie_id: string;
  champ: string;
  libelle: string;
  ordre: number;
  obligatoire: boolean;
}

/** Champs spécifiques disponibles sur la table produits. */
export const CHAMPS_SPECIFIQUES = [
  "pied",
  "revetement",
  "coque_assise",
  "forme",
  "cabinet",
  "puissance",
  "frequence",
  "impedance",
  "sensibilite",
  "woodcase",
] as const;
export type ChampSpecifique = (typeof CHAMPS_SPECIFIQUES)[number];

export const CHAMP_LABEL_DEFAUT: Record<ChampSpecifique, string> = {
  pied: "Piétement",
  revetement: "Revêtement",
  coque_assise: "Coque / assise",
  forme: "Forme",
  cabinet: "Type de cabinet",
  puissance: "Puissance",
  frequence: "Bande passante",
  impedance: "Impédance",
  sensibilite: "Sensibilité",
  woodcase: "Ébénisterie",
};

export async function listCategories(): Promise<Categorie[]> {
  const { data, error } = await supabase.from("categories").select("*").order("ordre");
  if (error) throw error;
  return (data ?? []) as Categorie[];
}

export async function listSousCategories(): Promise<SousCategorie[]> {
  const { data, error } = await supabase.from("sous_categories").select("*").order("ordre");
  if (error) throw error;
  return (data ?? []) as SousCategorie[];
}

export async function listTypesObjet(): Promise<TypeObjet[]> {
  const { data, error } = await supabase.from("types_objet").select("*").order("ordre");
  if (error) throw error;
  return (data ?? []) as TypeObjet[];
}

export async function listMatieres(): Promise<Matiere[]> {
  const { data, error } = await supabase.from("matieres").select("*").order("ordre");
  if (error) throw error;
  return (data ?? []) as Matiere[];
}

export async function listCategorieChamps(): Promise<CategorieChamp[]> {
  const { data, error } = await supabase.from("categorie_champs").select("*").order("ordre");
  if (error) throw error;
  return (data ?? []) as CategorieChamp[];
}

/** Union des champs à afficher pour les catégories cochées sur un produit. */
export function champsPourCategories(
  champs: CategorieChamp[],
  categorieIds: string[],
): CategorieChamp[] {
  const vus = new Set<string>();
  return champs
    .filter((c) => categorieIds.includes(c.categorie_id))
    .sort((a, b) => a.ordre - b.ordre)
    .filter((c) => (vus.has(c.champ) ? false : (vus.add(c.champ), true)));
}

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Normalisation pour recherche insensible à la casse et aux accents. */
export function normaliser(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
