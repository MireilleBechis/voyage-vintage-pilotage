import type { MotifArchivage, Produit } from "./produits";
import {
  archiveProduitRpc,
  restoreFromArchiveRpc,
  trashProduitRpc,
  restoreFromTrashRpc,
  deleteProduitRpc,
  createProduit,
  listProduitsInterne,
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
  // Récupérer le prochain identifiant VV-XXXX à partir de la liste interne
  const list = await listProduitsInterne();
  const last = list
    .map((x) => x.identifiant)
    .filter(Boolean)
    .sort()
    .reverse()[0] ?? "VV-0000";
  const n = Number(String(last).replace("VV-", "")) + 1;
  const nouvel = `VV-${String(n).padStart(4, "0")}`;
  return await createProduit({
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
  });
}
