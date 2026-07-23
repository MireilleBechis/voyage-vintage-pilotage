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
  "ETAT_A_VERIFIER",
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
  statut_modifie_manuellement: boolean;
  statut_origine: "automatique" | "manuel" | "import";
  statut_calcule_le: string | null;
  nettoyage: EtatTravaux;
  restauration: EtatTravaux;
  actions_requises: ActionRequise[];
  titre_commercial: string | null;
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
  archived_at: string | null;
  archived_by: string | null;
  archive_motif: MotifArchivage | null;
  trashed_at: string | null;
  trashed_by: string | null;
  // Étape 8 — visibilité + tarifs multi-niveaux
  visibilite: Visibilite;
  disponibilite: Disponibilite;
  prix_public_ttc: number | null;
  prix_pro_ht: number | null;
  tva_regime: TvaRegime;
  tva_taux: number | null;
  prix_minimum_interne: number | null;
  remise_pro_pct: number | null;
  tarif_pro_valide_jusqu: string | null;
  validation_statut: ValidationStatut;
}

export const MOTIFS_ARCHIVAGE = [
  "vendu_anterieurement",
  "retire_vente",
  "conservation_perso",
  "donne",
  "perdu_endommage",
  "erreur_saisie",
  "autre",
] as const;
export type MotifArchivage = (typeof MOTIFS_ARCHIVAGE)[number];
export const MOTIF_ARCHIVAGE_LABEL: Record<MotifArchivage, string> = {
  vendu_anterieurement: "Vendu antérieurement",
  retire_vente: "Retiré de la vente",
  conservation_perso: "Conservé personnellement",
  donne: "Donné",
  perdu_endommage: "Perdu ou endommagé",
  erreur_saisie: "Erreur de saisie",
  autre: "Autre",
};

export function estArchive(p: Pick<Produit, "archived_at">): boolean {
  return p.archived_at != null;
}
export function estCorbeille(p: Pick<Produit, "trashed_at">): boolean {
  return p.trashed_at != null;
}
export function estActif(p: Pick<Produit, "archived_at" | "trashed_at">): boolean {
  return p.archived_at == null && p.trashed_at == null;
}

export const ACTION_HISTORIQUE_LABEL: Record<string, string> = {
  cree: "Créé",
  modifie: "Modifié",
  archive: "Archivé",
  restaure_archive: "Restauré depuis les archives",
  corbeille: "Mis à la corbeille",
  restaure_corbeille: "Restauré depuis la corbeille",
  supprime: "Supprimé définitivement",
};

export const ETATS_TRAVAUX = ["a_verifier", "non_necessaire", "necessaire", "en_cours", "termine"] as const;
export type EtatTravaux = (typeof ETATS_TRAVAUX)[number];
export const ETAT_TRAVAUX_LABEL: Record<EtatTravaux, string> = {
  a_verifier: "À vérifier",
  non_necessaire: "Non nécessaire",
  necessaire: "Nécessaire",
  en_cours: "En cours",
  termine: "Terminé",
};

export type ActionRequise =
  | "identification_a_completer"
  | "prix_a_expertiser"
  | "prix_incoherent"
  | "nettoyage_a_verifier"
  | "a_nettoyer"
  | "restauration_a_verifier"
  | "a_restaurer"
  | "etat_a_verifier"
  | "photos_manquantes"
  | "description_manquante"
  | "dimensions_manquantes";

export const ACTION_REQUISE_LABEL: Record<ActionRequise, string> = {
  identification_a_completer: "Identification à compléter",
  prix_a_expertiser: "Prix à expertiser",
  prix_incoherent: "Prix incohérent",
  nettoyage_a_verifier: "Nettoyage à vérifier",
  a_nettoyer: "À nettoyer",
  restauration_a_verifier: "Restauration à vérifier",
  a_restaurer: "À restaurer",
  etat_a_verifier: "État à vérifier",
  photos_manquantes: "Photos manquantes",
  description_manquante: "Description manquante",
  dimensions_manquantes: "Dimensions manquantes",
};

export const ACTION_REQUISE_COULEUR: Record<ActionRequise, string> = {
  identification_a_completer: "bg-warning/15 text-warning border-warning/30",
  prix_a_expertiser: "bg-warning/15 text-warning border-warning/30",
  prix_incoherent: "bg-destructive/15 text-destructive border-destructive/30",
  nettoyage_a_verifier: "bg-secondary text-secondary-foreground border-border",
  a_nettoyer: "bg-secondary text-secondary-foreground border-border",
  restauration_a_verifier: "bg-secondary text-secondary-foreground border-border",
  a_restaurer: "bg-secondary text-secondary-foreground border-border",
  etat_a_verifier: "bg-secondary text-secondary-foreground border-border",
  photos_manquantes: "bg-accent/15 text-accent-foreground border-accent/30",
  description_manquante: "bg-accent/15 text-accent-foreground border-accent/30",
  dimensions_manquantes: "bg-accent/15 text-accent-foreground border-accent/30",
};

export function margeReelle(p: Pick<Produit, "statut" | "prix_vente_reel" | "cout_total">): number | null {
  if (p.statut !== "VENDU" || p.prix_vente_reel == null) return null;
  return Number(p.prix_vente_reel) - Number(p.cout_total ?? 0);
}
