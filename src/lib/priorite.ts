import type { Produit, ActionRequise } from "./produits";
import { ACTION_REQUISE_LABEL } from "./produits";
import { eur } from "./format";

export interface PrioriteItem {
  produit: Produit;
  score: number;
  bucket: 1 | 2 | 3 | 4 | 5;
  raison: string;
  action_suggeree: string;
}

/**
 * Priorité (bucket croissant = plus urgent) :
 * 1. Engagements urgents (RESERVE/VENDU avec date limite ≤ 3j ou action)
 * 2. Prêts à publier (marge potentielle décroissante)
 * 3. Fort capital immobilisé débloquable (quartile sup. + action requise)
 * 4. Information manquante bloquante (via actions_requises)
 * 5. Travaux à programmer (nettoyage/restauration)
 */
export function calculerPriorites(produits: Produit[]): PrioriteItem[] {
  const couts = produits
    .map((p) => Number(p.cout_total ?? 0))
    .filter((n) => n > 0)
    .sort((a, b) => a - b);
  const seuilCapital = couts.length ? couts[Math.floor(couts.length * 0.75)] : 0;

  const items: PrioriteItem[] = [];
  const today = new Date();
  const in3days = new Date(today.getTime() + 3 * 24 * 3600 * 1000);

  for (const p of produits) {
    const actions = p.actions_requises ?? [];
    const dateLimiteProche = p.date_limite && new Date(p.date_limite) <= in3days;

    // Bucket 1 — engagements
    if ((p.statut === "RESERVE" || p.statut === "VENDU") && (dateLimiteProche || p.prochaine_action)) {
      items.push({
        produit: p,
        bucket: 1,
        score: 1000 + Number(p.prix_vente_cible ?? 0),
        raison: p.statut === "RESERVE" ? "Réservé — livraison à organiser" : "Vendu — finaliser la livraison",
        action_suggeree: p.prochaine_action || "Organiser la remise",
      });
      continue;
    }

    // Bucket 2 — prêts à publier
    if (p.statut === "PRET_A_PUBLIER") {
      items.push({
        produit: p,
        bucket: 2,
        score: 800 + Number(p.marge_potentielle ?? p.prix_vente_cible ?? 0),
        raison:
          p.marge_potentielle && p.marge_potentielle > 0
            ? `Marge potentielle ${eur(p.marge_potentielle)}`
            : "Fiche complète, prête à mettre en ligne",
        action_suggeree: "Publier maintenant",
      });
      continue;
    }

    // Bucket 3 — fort capital bloqué par une action
    if (
      seuilCapital > 0 &&
      Number(p.cout_total ?? 0) >= seuilCapital &&
      actions.length > 0 &&
      !["VENDU", "ARCHIVE", "EN_LIGNE", "RESERVE"].includes(p.statut)
    ) {
      const action = premiereAction(actions);
      items.push({
        produit: p,
        bucket: 3,
        score: 600 + Number(p.cout_total ?? 0),
        raison: `${eur(p.cout_total)} immobilisés — ${action.toLowerCase()}`,
        action_suggeree: action,
      });
      continue;
    }

    // Bucket 4 — information manquante bloquante
    const bloquant = actions.find((a) =>
      [
        "identification_a_completer",
        "prix_a_expertiser",
        "prix_incoherent",
        "photos_manquantes",
        "description_manquante",
      ].includes(a),
    );
    if (bloquant) {
      items.push({
        produit: p,
        bucket: 4,
        score: 400 + Number(p.prix_vente_cible ?? p.cout_total ?? 0),
        raison: ACTION_REQUISE_LABEL[bloquant],
        action_suggeree: ACTION_REQUISE_LABEL[bloquant],
      });
      continue;
    }

    // Bucket 5 — travaux
    if (p.statut === "A_NETTOYER" || p.statut === "A_RESTAURER" || p.statut === "ETAT_A_VERIFIER") {
      const effort = p.niveau_effort ?? 3;
      const label =
        p.statut === "A_NETTOYER"
          ? "Nettoyer"
          : p.statut === "A_RESTAURER"
            ? "Restaurer"
            : "Vérifier l'état";
      items.push({
        produit: p,
        bucket: 5,
        score: 200 - effort * 10 + Number(p.marge_potentielle ?? 0) / 100,
        raison: label,
        action_suggeree: label,
      });
    }
  }

  items.sort((a, b) => a.bucket - b.bucket || b.score - a.score);
  return items.slice(0, 5);
}

function premiereAction(actions: ActionRequise[]): string {
  const ordre: ActionRequise[] = [
    "identification_a_completer",
    "prix_a_expertiser",
    "prix_incoherent",
    "etat_a_verifier",
    "a_nettoyer",
    "a_restaurer",
    "photos_manquantes",
    "description_manquante",
    "dimensions_manquantes",
    "nettoyage_a_verifier",
    "restauration_a_verifier",
  ];
  for (const a of ordre) if (actions.includes(a)) return ACTION_REQUISE_LABEL[a];
  return ACTION_REQUISE_LABEL[actions[0]];
}
