import type { Produit } from "./produits";
import { eur } from "./format";

export interface PrioriteItem {
  produit: Produit;
  score: number;
  bucket: 1 | 2 | 3 | 4 | 5;
  raison: string;
  action_suggeree: string;
}

/**
 * Priorité (ordre décroissant) :
 * 1. Engagements urgents (RESERVE/VENDU avec date limite ou action)
 * 2. Prêts à publier + forte marge
 * 3. Fort capital immobilisé débloquable
 * 4. Information manquante (prix, photo, designer)
 * 5. Travaux moins urgents
 */
export function calculerPriorites(produits: Produit[]): PrioriteItem[] {
  // seuil "fort capital" = quartile supérieur des cout_total
  const couts = produits.map((p) => Number(p.cout_total ?? 0)).filter((n) => n > 0).sort((a, b) => a - b);
  const seuilCapital = couts.length ? couts[Math.floor(couts.length * 0.75)] : 0;

  const items: PrioriteItem[] = [];
  const today = new Date();
  const in3days = new Date(today.getTime() + 3 * 24 * 3600 * 1000);

  for (const p of produits) {
    // Bucket 1
    if ((p.statut === "RESERVE" || p.statut === "VENDU" && p.date_limite) && (
      (p.date_limite && new Date(p.date_limite) <= in3days) || p.prochaine_action
    )) {
      items.push({
        produit: p, bucket: 1, score: 1000 + (p.prix_vente_cible ?? 0),
        raison: p.statut === "RESERVE" ? "Réservé : livraison à organiser" : "Vendu : finaliser la livraison",
        action_suggeree: p.prochaine_action || "Organiser la remise",
      });
      continue;
    }
    // Bucket 2
    if (p.statut === "PRET_A_PUBLIER" && (p.marge_potentielle ?? 0) > 0) {
      items.push({
        produit: p, bucket: 2, score: 800 + Number(p.marge_potentielle ?? 0),
        raison: `Marge potentielle : ${eur(p.marge_potentielle)}`,
        action_suggeree: "Publier maintenant",
      });
      continue;
    }
    // Bucket 3 : capital immobilisé débloquable
    if (
      seuilCapital > 0 &&
      Number(p.cout_total ?? 0) >= seuilCapital &&
      ["A_PHOTOGRAPHIER", "A_REDIGER", "PRET_A_PUBLIER"].includes(p.statut)
    ) {
      const manque = manqueQuoi(p);
      items.push({
        produit: p, bucket: 3, score: 600 + Number(p.cout_total ?? 0),
        raison: `${eur(p.cout_total)} immobilisés — ${manque}`,
        action_suggeree: manque,
      });
      continue;
    }
    // Bucket 4 : info manquante
    const manqueInfo = infoManquante(p);
    if (manqueInfo) {
      items.push({
        produit: p, bucket: 4, score: 400 + Number(p.prix_vente_cible ?? p.cout_total ?? 0),
        raison: manqueInfo,
        action_suggeree: manqueInfo,
      });
      continue;
    }
    // Bucket 5 : travaux
    if (p.statut === "A_NETTOYER" || p.statut === "A_RESTAURER") {
      const effort = p.niveau_effort ?? 3;
      items.push({
        produit: p, bucket: 5,
        score: 200 - effort * 10 + Number(p.marge_potentielle ?? 0) / 100,
        raison: p.statut === "A_NETTOYER" ? "Nettoyage rapide" : "Restauration à programmer",
        action_suggeree: p.statut === "A_NETTOYER" ? "Nettoyer" : "Restaurer",
      });
    }
  }

  items.sort((a, b) => a.bucket - b.bucket || b.score - a.score);
  return items.slice(0, 5);
}

function manqueQuoi(p: Produit): string {
  if (!p.photos || p.photos.length === 0) return "il ne manque que les photos";
  if (!p.description) return "il ne manque qu'une description";
  if (!p.prix_vente_cible) return "prix de vente à fixer";
  return "prêt à publier";
}

function infoManquante(p: Produit): string | null {
  if (!p.prix_vente_cible) return "Prix de vente non renseigné";
  if (!p.photos || p.photos.length === 0) return "Il ne manque que les photos";
  if (!p.designer_ou_marque) return "Designer / marque manquant";
  return null;
}
