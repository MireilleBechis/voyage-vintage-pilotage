// Accès sécurisé à la table produits — passe exclusivement par les fonctions
// SECURITY DEFINER de la base. Aucun composant front ne doit interroger la
// table brute `produits` (les GRANTs SELECT/INSERT/UPDATE/DELETE ont été
// révoqués pour anon et authenticated).
import { supabase } from "@/integrations/supabase/client";
import type { Produit, MotifArchivage } from "./produits";

export async function listProduitsInterne(): Promise<Produit[]> {
  const { data, error } = await supabase.rpc("list_produits_interne" as never);
  if (error) throw error;
  return ((data ?? []) as unknown) as Produit[];
}

export async function getProduitInterne(id: string): Promise<Produit | null> {
  const { data, error } = await supabase.rpc("get_produit_interne" as never, { _id: id } as never);
  if (error) throw error;
  if (!data) return null;
  // La fonction retourne un ROW ; Supabase RPC renvoie soit l'objet soit un array selon typage
  const row = Array.isArray(data) ? data[0] : data;
  return (row as unknown) as Produit | null;
}

export async function updateProduit(id: string, patch: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.rpc("update_produit" as never, {
    _id: id,
    _data: patch,
  } as never);
  if (error) throw error;
}

export async function createProduit(data: Record<string, unknown>): Promise<string> {
  const { data: row, error } = await supabase.rpc("create_produit" as never, {
    _data: data,
  } as never);
  if (error) throw error;
  const r = Array.isArray(row) ? row[0] : row;
  return (r as { id: string }).id;
}

export async function archiveProduitRpc(id: string, motif: MotifArchivage): Promise<void> {
  const { error } = await supabase.rpc("archive_produit" as never, { _id: id, _motif: motif } as never);
  if (error) throw error;
}

export async function restoreFromArchiveRpc(id: string): Promise<void> {
  const { error } = await supabase.rpc("restore_produit_from_archive" as never, { _id: id } as never);
  if (error) throw error;
}

export async function trashProduitRpc(id: string): Promise<void> {
  const { error } = await supabase.rpc("trash_produit" as never, { _id: id } as never);
  if (error) throw error;
}

export async function restoreFromTrashRpc(id: string): Promise<void> {
  const { error } = await supabase.rpc("restore_produit_from_trash" as never, { _id: id } as never);
  if (error) throw error;
}

export async function deleteProduitRpc(id: string): Promise<void> {
  const { error } = await supabase.rpc("delete_produit_definitivement" as never, { _id: id } as never);
  if (error) throw error;
}
