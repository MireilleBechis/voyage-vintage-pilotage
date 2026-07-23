export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      produits: {
        Row: {
          actions_requises: string[]
          annee: string | null
          blocage: string | null
          cabinet: string | null
          canal_achat: string | null
          categorie: Database["public"]["Enums"]["categorie_produit"]
          coque_assise: string | null
          couleur: string | null
          cout_total: number | null
          cout_transport: number | null
          cout_travaux: number | null
          created_at: string
          date_achat: string | null
          date_limite: string | null
          date_vente: string | null
          description: string | null
          designer_ou_marque: string | null
          dimensions: string | null
          documents_authenticite: Json
          donnees_douteuses: Json | null
          doublon_groupe: string | null
          doublon_valide: boolean
          editeur_ou_label: string | null
          emplacement_stockage: string | null
          etat: string | null
          forme: string | null
          frequence: string | null
          id: string
          identifiant: string
          impedance: string | null
          import_original: Json | null
          liens_annonces: Json
          marge_potentielle: number | null
          materiaux: string | null
          modele: string | null
          nettoyage: Database["public"]["Enums"]["etat_nettoyage"]
          niveau_effort: number | null
          notes: string | null
          owner_id: string
          photos: Json
          pied: string | null
          plateformes_publication: string[]
          poids: string | null
          prix_achat: number | null
          prix_minimum_accepte: number | null
          prix_vente_cible: number | null
          prix_vente_reel: number | null
          prochaine_action: string | null
          puissance: string | null
          restauration: Database["public"]["Enums"]["etat_restauration"]
          revetement: string | null
          sensibilite: string | null
          shopify_product_id: string | null
          source_feuille: string | null
          source_ligne: number | null
          sous_categorie: string | null
          statut: Database["public"]["Enums"]["statut_produit"]
          statut_calcule_le: string | null
          statut_modifie_manuellement: boolean
          statut_origine: Database["public"]["Enums"]["origine_statut"]
          titre_commercial: string | null
          type_objet: string | null
          updated_at: string
          woodcase: string | null
        }
        Insert: {
          actions_requises?: string[]
          annee?: string | null
          blocage?: string | null
          cabinet?: string | null
          canal_achat?: string | null
          categorie: Database["public"]["Enums"]["categorie_produit"]
          coque_assise?: string | null
          couleur?: string | null
          cout_total?: number | null
          cout_transport?: number | null
          cout_travaux?: number | null
          created_at?: string
          date_achat?: string | null
          date_limite?: string | null
          date_vente?: string | null
          description?: string | null
          designer_ou_marque?: string | null
          dimensions?: string | null
          documents_authenticite?: Json
          donnees_douteuses?: Json | null
          doublon_groupe?: string | null
          doublon_valide?: boolean
          editeur_ou_label?: string | null
          emplacement_stockage?: string | null
          etat?: string | null
          forme?: string | null
          frequence?: string | null
          id?: string
          identifiant: string
          impedance?: string | null
          import_original?: Json | null
          liens_annonces?: Json
          marge_potentielle?: number | null
          materiaux?: string | null
          modele?: string | null
          nettoyage?: Database["public"]["Enums"]["etat_nettoyage"]
          niveau_effort?: number | null
          notes?: string | null
          owner_id: string
          photos?: Json
          pied?: string | null
          plateformes_publication?: string[]
          poids?: string | null
          prix_achat?: number | null
          prix_minimum_accepte?: number | null
          prix_vente_cible?: number | null
          prix_vente_reel?: number | null
          prochaine_action?: string | null
          puissance?: string | null
          restauration?: Database["public"]["Enums"]["etat_restauration"]
          revetement?: string | null
          sensibilite?: string | null
          shopify_product_id?: string | null
          source_feuille?: string | null
          source_ligne?: number | null
          sous_categorie?: string | null
          statut?: Database["public"]["Enums"]["statut_produit"]
          statut_calcule_le?: string | null
          statut_modifie_manuellement?: boolean
          statut_origine?: Database["public"]["Enums"]["origine_statut"]
          titre_commercial?: string | null
          type_objet?: string | null
          updated_at?: string
          woodcase?: string | null
        }
        Update: {
          actions_requises?: string[]
          annee?: string | null
          blocage?: string | null
          cabinet?: string | null
          canal_achat?: string | null
          categorie?: Database["public"]["Enums"]["categorie_produit"]
          coque_assise?: string | null
          couleur?: string | null
          cout_total?: number | null
          cout_transport?: number | null
          cout_travaux?: number | null
          created_at?: string
          date_achat?: string | null
          date_limite?: string | null
          date_vente?: string | null
          description?: string | null
          designer_ou_marque?: string | null
          dimensions?: string | null
          documents_authenticite?: Json
          donnees_douteuses?: Json | null
          doublon_groupe?: string | null
          doublon_valide?: boolean
          editeur_ou_label?: string | null
          emplacement_stockage?: string | null
          etat?: string | null
          forme?: string | null
          frequence?: string | null
          id?: string
          identifiant?: string
          impedance?: string | null
          import_original?: Json | null
          liens_annonces?: Json
          marge_potentielle?: number | null
          materiaux?: string | null
          modele?: string | null
          nettoyage?: Database["public"]["Enums"]["etat_nettoyage"]
          niveau_effort?: number | null
          notes?: string | null
          owner_id?: string
          photos?: Json
          pied?: string | null
          plateformes_publication?: string[]
          poids?: string | null
          prix_achat?: number | null
          prix_minimum_accepte?: number | null
          prix_vente_cible?: number | null
          prix_vente_reel?: number | null
          prochaine_action?: string | null
          puissance?: string | null
          restauration?: Database["public"]["Enums"]["etat_restauration"]
          revetement?: string | null
          sensibilite?: string | null
          shopify_product_id?: string | null
          source_feuille?: string | null
          source_ligne?: number | null
          sous_categorie?: string | null
          statut?: Database["public"]["Enums"]["statut_produit"]
          statut_calcule_le?: string | null
          statut_modifie_manuellement?: boolean
          statut_origine?: Database["public"]["Enums"]["origine_statut"]
          titre_commercial?: string | null
          type_objet?: string | null
          updated_at?: string
          woodcase?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nom_affichage: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          nom_affichage?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nom_affichage?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      taches: {
        Row: {
          created_at: string
          date_completion: string | null
          date_limite: string | null
          duree_estimee_min: number | null
          id: string
          justification_priorite: string | null
          notes: string | null
          owner_id: string
          priorite: number
          produit_id: string | null
          statut: Database["public"]["Enums"]["statut_tache"]
          titre: string
          type_action: Database["public"]["Enums"]["type_action"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_completion?: string | null
          date_limite?: string | null
          duree_estimee_min?: number | null
          id?: string
          justification_priorite?: string | null
          notes?: string | null
          owner_id: string
          priorite?: number
          produit_id?: string | null
          statut?: Database["public"]["Enums"]["statut_tache"]
          titre: string
          type_action?: Database["public"]["Enums"]["type_action"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_completion?: string | null
          date_limite?: string | null
          duree_estimee_min?: number | null
          id?: string
          justification_priorite?: string | null
          notes?: string | null
          owner_id?: string
          priorite?: number
          produit_id?: string | null
          statut?: Database["public"]["Enums"]["statut_tache"]
          titre?: string
          type_action?: Database["public"]["Enums"]["type_action"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "taches_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculer_actions_requises: {
        Args: { p: Database["public"]["Tables"]["produits"]["Row"] }
        Returns: string[]
      }
      calculer_statut_produit: {
        Args: { p: Database["public"]["Tables"]["produits"]["Row"] }
        Returns: Database["public"]["Enums"]["statut_produit"]
      }
      marge_reelle: {
        Args: { p: Database["public"]["Tables"]["produits"]["Row"] }
        Returns: number
      }
    }
    Enums: {
      categorie_produit:
        | "enceintes"
        | "chaises"
        | "fauteuils"
        | "tables"
        | "meubles"
        | "canapes"
        | "luminaires"
        | "autre"
      etat_nettoyage: "a_verifier" | "necessaire" | "non_necessaire" | "termine"
      etat_restauration:
        | "a_verifier"
        | "necessaire"
        | "non_necessaire"
        | "terminee"
      origine_statut: "automatique" | "manuel"
      statut_produit:
        | "A_IDENTIFIER"
        | "A_EXPERTISER"
        | "ETAT_A_VERIFIER"
        | "A_NETTOYER"
        | "A_RESTAURER"
        | "A_PHOTOGRAPHIER"
        | "A_REDIGER"
        | "PRET_A_PUBLIER"
        | "EN_LIGNE"
        | "RESERVE"
        | "VENDU"
        | "ARCHIVE"
      statut_tache: "a_faire" | "en_cours" | "fait" | "annule"
      type_action:
        | "nettoyage"
        | "restauration"
        | "photo"
        | "redaction"
        | "publication"
        | "livraison"
        | "expertise"
        | "identification"
        | "autre"
        | "expertiser_prix"
        | "verifier_etat"
        | "verifier_authenticite"
        | "mesurer"
        | "tester"
        | "emballer"
        | "relancer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      categorie_produit: [
        "enceintes",
        "chaises",
        "fauteuils",
        "tables",
        "meubles",
        "canapes",
        "luminaires",
        "autre",
      ],
      etat_nettoyage: ["a_verifier", "necessaire", "non_necessaire", "termine"],
      etat_restauration: [
        "a_verifier",
        "necessaire",
        "non_necessaire",
        "terminee",
      ],
      origine_statut: ["automatique", "manuel"],
      statut_produit: [
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
      ],
      statut_tache: ["a_faire", "en_cours", "fait", "annule"],
      type_action: [
        "nettoyage",
        "restauration",
        "photo",
        "redaction",
        "publication",
        "livraison",
        "expertise",
        "identification",
        "autre",
        "expertiser_prix",
        "verifier_etat",
        "verifier_authenticite",
        "mesurer",
        "tester",
        "emballer",
        "relancer",
      ],
    },
  },
} as const
