import type { MotifArchivage, Produit } from "./produits";
import {
  archiveProduitRpc,
  restoreFromArchiveRpc,
  trashProduitRpc,
  restoreFromTrashRpc,
  deleteProduitRpc,
  createProduit,
  prochainIdentifiantProduit,
  setProduitRattachements,
} from "./produits-api";

export async function archiverProduit(id: string, motif: MotifArchivage) {
  await archiveProduitRpc(id, motif);
}

export async function restaurerArchive(id: string) {
  await restoreFromArchiveRpc(id);
}

export async function mettreCorbeille(id: string) {
  await trashProduitRpc(id);
}

export async function restaurerCorbeille(id: string) {
  await restoreFromTrashRpc(id);
}

export async function supprimerDefinitivement(id: string) {
  await deleteProduitRpc(id);
}

export async function dupliquerProduit(p: Produit): Promise<string> {
  const nouvel = await prochainIdentifiantProduit();
  const id = await createProduit({
    identifiant: nouvel,
    designer_ou_marque: p.designer_ou_marque,
    editeur_ou_label: p.editeur_ou_label,
    modele: p.modele,
    annee: p.annee,
    description: p.description,
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
  });
  // Recopie les rattachements référentiels du produit d'origine.
  await setProduitRattachements(id, {
    categories: p.categorie_ids ?? [],
    sousCategories: p.sous_categorie_ids ?? [],
    types: p.type_objet_ids ?? [],
    matieres: (p.matieres ?? []).map((m) => ({ matiere_id: m.matiere_id, role: m.role })),
  });
  return id;
}
