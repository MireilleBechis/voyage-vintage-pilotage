import { supabase } from "@/integrations/supabase/client";
import type { MotifArchivage, Produit } from "./produits";

export async function archiverProduit(id: string, motif: MotifArchivage) {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("produits")
    .update({
      archived_at: new Date().toISOString(),
      archived_by: userData.user?.id ?? null,
      archive_motif: motif,
    } as never)
    .eq("id", id);
  if (error) throw error;
}

export async function restaurerArchive(id: string) {
  const { error } = await supabase
    .from("produits")
    .update({ archived_at: null, archived_by: null, archive_motif: null } as never)
    .eq("id", id);
  if (error) throw error;
}

export async function mettreCorbeille(id: string) {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("produits")
    .update({ trashed_at: new Date().toISOString(), trashed_by: userData.user?.id ?? null } as never)
    .eq("id", id);
  if (error) throw error;
}

export async function restaurerCorbeille(id: string) {
  const { error } = await supabase
    .from("produits")
    .update({ trashed_at: null, trashed_by: null } as never)
    .eq("id", id);
  if (error) throw error;
}

export async function supprimerDefinitivement(id: string) {
  const { error } = await supabase.from("produits").delete().eq("id", id);
  if (error) throw error;
}

export async function dupliquerProduit(p: Produit): Promise<string> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user!.id;
  // trouver prochain identifiant VV-XXXX
  const { data: max } = await supabase
    .from("produits")
    .select("identifiant")
    .order("identifiant", { ascending: false })
    .limit(1);
  const last = max?.[0]?.identifiant ?? "VV-0000";
  const n = Number(last.replace("VV-", "")) + 1;
  const nouvel = `VV-${String(n).padStart(4, "0")}`;
  const { data, error } = await supabase
    .from("produits")
    .insert({
      owner_id: uid,
      identifiant: nouvel,
      categorie: p.categorie,
      sous_categorie: p.sous_categorie,
      designer_ou_marque: p.designer_ou_marque,
      editeur_ou_label: p.editeur_ou_label,
      type_objet: p.type_objet,
      modele: p.modele,
      annee: p.annee,
      description: p.description,
      materiaux: p.materiaux,
      couleur: p.couleur,
      etat: p.etat,
      dimensions: p.dimensions,
      poids: p.poids,
      emplacement_stockage: p.emplacement_stockage,
      prix_achat: p.prix_achat,
      cout_travaux: p.cout_travaux,
      cout_transport: p.cout_transport,
      prix_vente_cible: p.prix_vente_cible,
      prix_minimum_accepte: p.prix_minimum_accepte,
      notes: p.notes,
    } as never)
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}
