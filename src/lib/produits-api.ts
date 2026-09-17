// Accès sécurisé à la table produits — passe exclusivement par les fonctions
// SECURITY DEFINER de la base. Aucun composant front ne doit interroger la
// table brute `produits` (les GRANTs SELECT/INSERT/UPDATE/DELETE ont été
// révoqués pour anon et authenticated).
import { supabase } from "@/integrations/supabase/client";
import type { Produit, MotifArchivage } from "./produits";

export async function listProduitsInterne(): Promise<Produit[]> {
  const { data, error } = await supabase.rpc("list_produits_interne");
  if (error) throw error;
  return ((data ?? []) as unknown) as Produit[];
}

export async function getProduitInterne(id: string): Promise<Produit | null> {
  const { data, error } = await supabase.rpc("get_produit_interne", { _id: id });
  if (error) throw error;
  if (!data) return null;
  // La fonction retourne un ROW ; Supabase RPC renvoie soit l'objet soit un array selon typage
  const row = Array.isArray(data) ? data[0] : data;
  return (row as unknown) as Produit | null;
}

export async function updateProduit(id: string, patch: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.rpc("update_produit", {
    _id: id,
    _data: patch as never,
  });
  if (error) throw error;
}

export async function createProduit(data: Record<string, unknown>): Promise<string> {
  const { data: row, error } = await supabase.rpc("create_produit", {
    _data: data as never,
  });
  if (error) throw error;
  const r = Array.isArray(row) ? row[0] : row;
  return (r as { id: string }).id;
}

export async function archiveProduitRpc(id: string, motif: MotifArchivage): Promise<void> {
  const { error } = await supabase.rpc("archive_produit", { _id: id, _motif: motif });
  if (error) throw error;
}

export async function restoreFromArchiveRpc(id: string): Promise<void> {
  const { error } = await supabase.rpc("restore_produit_from_archive", { _id: id });
  if (error) throw error;
}

export async function trashProduitRpc(id: string): Promise<void> {
  const { error } = await supabase.rpc("trash_produit", { _id: id });
  if (error) throw error;
}

export async function restoreFromTrashRpc(id: string): Promise<void> {
  const { error } = await supabase.rpc("restore_produit_from_trash", { _id: id });
  if (error) throw error;
}

export async function deleteProduitRpc(id: string): Promise<void> {
  const { error } = await supabase.rpc("delete_produit_definitivement", { _id: id });
  if (error) throw error;
}

/** Remplace les rattachements référentiels d'un produit (listes complètes). */
export async function setProduitRattachements(
  id: string,
  r: {
    categories?: string[];
    sousCategories?: string[];
    types?: string[];
    matieres?: Array<{ matiere_id: string; role: "principale" | "secondaire" }>;
  },
): Promise<void> {
  const { error } = await supabase.rpc("set_produit_rattachements", {
    _id: id,
    _categories: (r.categories ?? null) as never,
    _sous_categories: (r.sousCategories ?? null) as never,
    _types: (r.types ?? null) as never,
    _matieres: (r.matieres ?? null) as never,
  });
  if (error) throw error;
}

export async function prochainIdentifiantProduit(): Promise<string> {
  const { data, error } = await supabase.rpc("prochain_identifiant_produit");
  if (error) throw error;
  return (data as string) ?? "DV-0001";
}

export async function prochainIdentifiantLot(): Promise<string> {
  const { data, error } = await supabase.rpc("prochain_identifiant_lot");
  if (error) throw error;
  return (data as string) ?? "LOT-0001";
}
