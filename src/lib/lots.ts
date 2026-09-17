import { supabase } from "@/integrations/supabase/client";
import { prochainIdentifiantLot } from "./produits-api";

export interface Lot {
  id: string;
  identifiant: string;
  libelle: string;
  description: string | null;
  notes: string | null;
  prix_lot_negocie: number | null;
  prix_calcule: number | null;
  nb_produits: number | null;
  statut_calcule: string | null;
  archived_at: string | null;
  trashed_at: string | null;
  created_at: string | null;
}

export const LOT_STATUT_LABEL: Record<string, string> = {
  complet: "Complet",
  partiellement_vendu: "Partiellement vendu",
  dissous: "Dissous",
};

export async function listLots(): Promise<Lot[]> {
  const { data, error } = await supabase
    .from("lots_detail")
    .select("*")
    .order("identifiant");
  if (error) throw error;
  return (data ?? []) as Lot[];
}

export async function createLot(libelle: string, description?: string): Promise<string> {
  const identifiant = await prochainIdentifiantLot();
  const { data: auth } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("lots")
    .insert({
      identifiant,
      libelle,
      description: description || null,
      owner_id: auth.user!.id,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function majLot(
  id: string,
  patch: { libelle?: string; description?: string | null; notes?: string | null; prix_lot_negocie?: number | null },
): Promise<void> {
  const { error } = await supabase.from("lots").update(patch).eq("id", id);
  if (error) throw error;
}

export async function supprimerLot(id: string): Promise<void> {
  const { error } = await supabase.from("lots").update({ trashed_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function produitsDuLot(lotId: string): Promise<string[]> {
  const { data, error } = await supabase.from("lot_produits").select("produit_id").eq("lot_id", lotId);
  if (error) throw error;
  return (data ?? []).map((r) => r.produit_id);
}

export async function ajouterProduitAuLot(lotId: string, produitId: string): Promise<void> {
  const { error } = await supabase.from("lot_produits").insert({ lot_id: lotId, produit_id: produitId });
  if (error) throw error;
}

export async function retirerProduitDuLot(lotId: string, produitId: string): Promise<void> {
  const { error } = await supabase
    .from("lot_produits")
    .delete()
    .eq("lot_id", lotId)
    .eq("produit_id", produitId);
  if (error) throw error;
}
