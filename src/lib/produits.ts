export const STATUTS = [
  "A_IDENTIFIER",
  "A_EXPERTISER",
  "ETAT_A_VERIFIER",
  "A_NETTOYER",
  "A_RESTAURER",
  "A_PHOTOGRAPHIER",
  "A_REDIGER",
  "PRET_A_PUBLIER",
  "EN_LIGNE",
  "RESERVE",
  "VENDU",
  "ARCHIVE",
] as const;
export type Statut = (typeof STATUTS)[number];

export const STATUT_LABEL: Record<Statut, string> = {
  A_IDENTIFIER: "À identifier",
  A_EXPERTISER: "À expertiser",
  ETAT_A_VERIFIER: "État à vérifier",
  A_NETTOYER: "À nettoyer",
  A_RESTAURER: "À restaurer",
  A_PHOTOGRAPHIER: "À photographier",
  A_REDIGER: "À rédiger",
  PRET_A_PUBLIER: "Prêt à publier",
  EN_LIGNE: "En ligne",
  RESERVE: "Réservé",
  VENDU: "Vendu",
  ARCHIVE: "Archivé",
};

// Couleur sémantique par statut (tokens du design system)
export const STATUT_COULEUR: Record<Statut, string> = {
  A_IDENTIFIER: "bg-warning/15 text-warning border-warning/40",
  A_EXPERTISER: "bg-warning/15 text-warning border-warning/40",
  ETAT_A_VERIFIER: "bg-secondary text-secondary-foreground border-border",
  A_NETTOYER: "bg-secondary text-secondary-foreground border-border",
  A_RESTAURER: "bg-secondary text-secondary-foreground border-border",
  A_PHOTOGRAPHIER: "bg-accent/15 text-accent-foreground border-accent/40",
  A_REDIGER: "bg-accent/15 text-accent-foreground border-accent/40",
  PRET_A_PUBLIER: "bg-primary/15 text-primary border-primary/40",
  EN_LIGNE: "bg-primary text-primary-foreground border-primary",
  RESERVE: "bg-accent text-accent-foreground border-accent",
  VENDU: "bg-muted text-muted-foreground border-border",
  ARCHIVE: "bg-muted text-muted-foreground border-border",
};

export const CATEGORIES = [
  "enceintes",
  "chaises",
  "fauteuils",
  "tables",
  "meubles",
  "canapes",
  "luminaires",
  "autre",
] as const;
export type Categorie = (typeof CATEGORIES)[number];

export const CAT_LABEL: Record<Categorie, string> = {
  enceintes: "Enceintes",
  chaises: "Chaises",
  fauteuils: "Fauteuils",
  tables: "Tables",
  meubles: "Meubles",
  canapes: "Canapés",
  luminaires: "Luminaires",
  autre: "Autre",
};

// Parcours de vente : ordre d'avancement pour "Marquer terminé"
const PARCOURS: Statut[] = [
  "A_IDENTIFIER",
  "A_EXPERTISER",
  "A_NETTOYER",
  "A_RESTAURER",
  "A_PHOTOGRAPHIER",
  "A_REDIGER",
  "PRET_A_PUBLIER",
  "EN_LIGNE",
];

export function statutSuivant(s: Statut): Statut | null {
  const i = PARCOURS.indexOf(s);
  if (i < 0 || i === PARCOURS.length - 1) return null;
  return PARCOURS[i + 1];
}

export type TypeAction =
  | "nettoyage"
  | "restauration"
  | "photo"
  | "redaction"
  | "publication"
  | "livraison"
  | "expertise"
  | "identification"
  | "autre";

export const ACTION_LABEL: Record<TypeAction, string> = {
  nettoyage: "Nettoyage",
  restauration: "Restauration",
  photo: "Photos",
  redaction: "Rédaction",
  publication: "Publication",
  livraison: "Livraison",
  expertise: "Expertise",
  identification: "Identification",
  autre: "Autre",
};

export function actionParStatut(s: Statut): TypeAction {
  switch (s) {
    case "A_IDENTIFIER": return "identification";
    case "A_EXPERTISER": return "expertise";
    case "A_NETTOYER": return "nettoyage";
    case "A_RESTAURER": return "restauration";
    case "A_PHOTOGRAPHIER": return "photo";
    case "A_REDIGER": return "redaction";
    case "PRET_A_PUBLIER": return "publication";
    case "EN_LIGNE": case "RESERVE": return "livraison";
    default: return "autre";
  }
}

export interface Produit {
  id: string;
  identifiant: string;
  categorie: Categorie;
  sous_categorie: string | null;
  designer_ou_marque: string | null;
  editeur_ou_label: string | null;
  type_objet: string | null;
  modele: string | null;
  annee: string | null;
  description: string | null;
  materiaux: string | null;
  couleur: string | null;
  etat: string | null;
  dimensions: string | null;
  poids: string | null;
  emplacement_stockage: string | null;
  canal_achat: string | null;
  date_achat: string | null;
  prix_achat: number | null;
  cout_travaux: number | null;
  cout_transport: number | null;
  cout_total: number | null;
  prix_vente_cible: number | null;
  prix_minimum_accepte: number | null;
  prix_vente_reel: number | null;
  marge_potentielle: number | null;
  date_vente: string | null;
  statut: Statut;
  prochaine_action: string | null;
  blocage: string | null;
  niveau_effort: number | null;
  date_limite: string | null;
  notes: string | null;
  photos: Array<{ url: string; storage_path: string; ordre?: number }>;
  documents_authenticite: Array<{ url: string; storage_path: string; nom?: string }>;
  liens_annonces: Array<{ plateforme: string; url: string; external_id?: string }>;
  plateformes_publication: string[];
  shopify_product_id: string | null;
  source_feuille: string | null;
  source_ligne: number | null;
  donnees_douteuses: Record<string, unknown> | null;
  doublon_groupe: string | null;
  doublon_valide: boolean;
  created_at: string;
}

export function margeReelle(p: Pick<Produit, "statut" | "prix_vente_reel" | "cout_total">): number | null {
  if (p.statut !== "VENDU" || p.prix_vente_reel == null) return null;
  return Number(p.prix_vente_reel) - Number(p.cout_total ?? 0);
}
