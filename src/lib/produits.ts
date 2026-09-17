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

// Les catégories, sous-catégories, types d'objet et matières sont désormais
// des référentiels administrables en base — voir src/lib/referentiels.ts.

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

export const TYPES_ACTION = [
  "nettoyage",
  "restauration",
  "photo",
  "redaction",
  "publication",
  "livraison",
  "expertise",
  "identification",
  "expertiser_prix",
  "verifier_etat",
  "verifier_authenticite",
  "mesurer",
  "tester",
  "emballer",
  "relancer",
  "autre",
] as const;
export type TypeAction = (typeof TYPES_ACTION)[number];

export const ACTION_LABEL: Record<TypeAction, string> = {
  nettoyage: "Nettoyage",
  restauration: "Restauration",
  photo: "Photos",
  redaction: "Rédaction",
  publication: "Publication",
  livraison: "Livraison",
  expertise: "Expertise",
  identification: "Identification",
  expertiser_prix: "Expertiser le prix",
  verifier_etat: "Vérifier l'état",
  verifier_authenticite: "Vérifier l'authenticité",
  mesurer: "Mesurer",
  tester: "Tester",
  emballer: "Emballer",
  relancer: "Relancer",
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

export type MatiereRole = "principale" | "secondaire";

export interface ProduitMatiere {
  matiere_id: string;
  role: MatiereRole;
  libelle: string;
  parent_id: string | null;
}

export interface Produit {
  id: string;
  identifiant: string;
  // Référentiels multi-valeurs
  categorie_ids: string[];
  categories_libelles: string[];
  sous_categorie_ids: string[];
  sous_categories_libelles: string[];
  type_objet_ids: string[];
  types_libelles: string[];
  matieres: ProduitMatiere[];
  categorie_shopify_id: string | null;
  // Appartenance à un lot
  lot_id: string | null;
  lot_identifiant: string | null;
  lot_libelle: string | null;
  designer_ou_marque: string | null;
  editeur_ou_label: string | null;
  modele: string | null;
  annee: string | null;
  description: string | null;
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
  statut_origine: "automatique" | "manuel";
  statut_calcule_le: string | null;
  nettoyage: EtatNettoyage;
  restauration: EtatRestauration;
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
  updated_at: string | null;
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

// Enums réels en base : etat_nettoyage se termine par « termine »,
// etat_restauration par « terminee ». Il n'y a pas de valeur « en_cours ».
export const ETATS_NETTOYAGE = ["a_verifier", "non_necessaire", "necessaire", "termine"] as const;
export type EtatNettoyage = (typeof ETATS_NETTOYAGE)[number];

export const ETATS_RESTAURATION = ["a_verifier", "non_necessaire", "necessaire", "terminee"] as const;
export type EtatRestauration = (typeof ETATS_RESTAURATION)[number];

export type EtatTravaux = EtatNettoyage | EtatRestauration;

export const ETAT_TRAVAUX_LABEL: Record<EtatTravaux, string> = {
  a_verifier: "À vérifier",
  non_necessaire: "Non nécessaire",
  necessaire: "Nécessaire",
  termine: "Terminé",
  terminee: "Terminée",
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

// ============================================================
// Étape 8 — Rôles, permissions, visibilité, tarifs multi-niveaux
// ============================================================

export const ROLES = ["admin", "collaborateur", "invite_particulier", "invite_pro"] as const;
export type AppRole = (typeof ROLES)[number];
export const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Administrateur",
  collaborateur: "Collaborateur",
  invite_particulier: "Invité particulier",
  invite_pro: "Invité professionnel",
};

export const PERMISSIONS = [
  "voir_prix_achat",
  "voir_marges",
  "voir_couts",
  "voir_prix_minimum",
  "voir_factures_achat",
  "modifier_prix",
  "modifier_prix_achat",
  "modifier_prix_public",
  "modifier_prix_pro",
  "modifier_prix_minimum",
  "creer_produit",
  "modifier_produit",
  "archiver_produit",
  "exporter",
] as const;
export type Permission = (typeof PERMISSIONS)[number];
export const PERMISSION_LABEL: Record<Permission, string> = {
  voir_prix_achat: "Voir les prix d'achat",
  voir_marges: "Voir les marges",
  voir_couts: "Voir les coûts (travaux, transport, total)",
  voir_prix_minimum: "Voir les prix minimum",
  voir_factures_achat: "Voir les factures d'achat",
  modifier_prix: "Modifier tous les prix",
  modifier_prix_achat: "Modifier les prix d'achat et coûts",
  modifier_prix_public: "Modifier le prix public TTC",
  modifier_prix_pro: "Modifier les prix professionnels",
  modifier_prix_minimum: "Modifier les prix minimum",
  creer_produit: "Créer un produit",
  modifier_produit: "Modifier un produit",
  archiver_produit: "Archiver un produit",
  exporter: "Exporter des données",
};

export const VISIBILITES = ["PRIVE", "PARTICULIER", "PRO", "TOUS", "MASQUE"] as const;
export type Visibilite = (typeof VISIBILITES)[number];
export const VISIBILITE_LABEL: Record<Visibilite, string> = {
  PRIVE: "Privé",
  PARTICULIER: "Visible aux particuliers invités",
  PRO: "Visible aux professionnels invités",
  TOUS: "Visible à tous les invités",
  MASQUE: "Masqué temporairement",
};

export const DISPONIBILITES = ["DISPONIBLE", "RESERVE", "VENDU", "NON_DISPONIBLE", "SUR_DEMANDE"] as const;
export type Disponibilite = (typeof DISPONIBILITES)[number];
export const DISPONIBILITE_LABEL: Record<Disponibilite, string> = {
  DISPONIBLE: "Disponible",
  RESERVE: "Réservé",
  VENDU: "Vendu",
  NON_DISPONIBLE: "Non disponible",
  SUR_DEMANDE: "Sur demande",
};

export const TVA_REGIMES = ["marge", "normal"] as const;
export type TvaRegime = (typeof TVA_REGIMES)[number];
export const TVA_REGIME_LABEL: Record<TvaRegime, string> = {
  marge: "Marge bénéficiaire (biens d'occasion)",
  normal: "TVA normale",
};

export type ValidationStatut = "brouillon" | "valide";
export const VALIDATION_LABEL: Record<ValidationStatut, string> = {
  brouillon: "Brouillon",
  valide: "Validé",
};

/**
 * Calcule le prix professionnel TTC selon le régime de TVA.
 * - Régime normal : TTC = HT × (1 + taux/100)
 * - Régime marge (art. 297 A CGI) : la TVA porte sur la marge, pas sur le prix total.
 *   Sans coût d'acquisition on ne peut pas la calculer côté vitrine → on affiche le HT tel quel.
 */
export function calculerPrixProTtc(
  prixHt: number | null,
  regime: TvaRegime,
  tauxTva: number | null,
): number | null {
  if (prixHt == null) return null;
  if (regime === "normal" && tauxTva != null) {
    return Math.round(prixHt * (1 + tauxTva / 100) * 100) / 100;
  }
  // Régime marge : le HT affiché est déjà le prix payé par le pro (TVA sur marge invisible côté acheteur)
  return prixHt;
}
