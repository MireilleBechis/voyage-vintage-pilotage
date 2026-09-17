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
      audit_log: {
        Row: {
          acteur_email: string | null
          acteur_id: string | null
          action: string
          cible_email: string | null
          cible_id: string | null
          cible_type: string | null
          created_at: string
          details: Json | null
          id: string
        }
        Insert: {
          acteur_email?: string | null
          acteur_id?: string | null
          action: string
          cible_email?: string | null
          cible_id?: string | null
          cible_type?: string | null
          created_at?: string
          details?: Json | null
          id?: string
        }
        Update: {
          acteur_email?: string | null
          acteur_id?: string | null
          action?: string
          cible_email?: string | null
          cible_id?: string | null
          cible_type?: string | null
          created_at?: string
          details?: Json | null
          id?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          accepte_par: string | null
          created_at: string
          email: string
          expire_at: string
          id: string
          invite_par: string | null
          message: string | null
          permissions: Database["public"]["Enums"]["role_permission"][]
          role_propose: Database["public"]["Enums"]["app_role"]
          statut: Database["public"]["Enums"]["invitation_statut"]
          token: string
          updated_at: string
        }
        Insert: {
          accepte_par?: string | null
          created_at?: string
          email: string
          expire_at?: string
          id?: string
          invite_par?: string | null
          message?: string | null
          permissions?: Database["public"]["Enums"]["role_permission"][]
          role_propose: Database["public"]["Enums"]["app_role"]
          statut?: Database["public"]["Enums"]["invitation_statut"]
          token?: string
          updated_at?: string
        }
        Update: {
          accepte_par?: string | null
          created_at?: string
          email?: string
          expire_at?: string
          id?: string
          invite_par?: string | null
          message?: string | null
          permissions?: Database["public"]["Enums"]["role_permission"][]
          role_propose?: Database["public"]["Enums"]["app_role"]
          statut?: Database["public"]["Enums"]["invitation_statut"]
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      produit_historique: {
        Row: {
          acteur_email: string | null
          acteur_id: string | null
          action: Database["public"]["Enums"]["action_historique"]
          created_at: string
          details: Json | null
          id: string
          identifiant: string
          owner_id: string
          produit_id: string | null
        }
        Insert: {
          acteur_email?: string | null
          acteur_id?: string | null
          action: Database["public"]["Enums"]["action_historique"]
          created_at?: string
          details?: Json | null
          id?: string
          identifiant: string
          owner_id: string
          produit_id?: string | null
        }
        Update: {
          acteur_email?: string | null
          acteur_id?: string | null
          action?: Database["public"]["Enums"]["action_historique"]
          created_at?: string
          details?: Json | null
          id?: string
          identifiant?: string
          owner_id?: string
          produit_id?: string | null
        }
        Relationships: []
      }
      produits: {
        Row: {
          actions_requises: string[]
          annee: string | null
          archive_motif: Database["public"]["Enums"]["motif_archivage"] | null
          archived_at: string | null
          archived_by: string | null
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
          disponibilite: Database["public"]["Enums"]["produit_disponibilite"]
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
          prix_minimum_interne: number | null
          prix_pro_ht: number | null
          prix_public_ttc: number | null
          prix_vente_cible: number | null
          prix_vente_reel: number | null
          prochaine_action: string | null
          puissance: string | null
          remise_pro_pct: number | null
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
          tarif_pro_valide_jusqu: string | null
          titre_commercial: string | null
          trashed_at: string | null
          trashed_by: string | null
          tva_regime: Database["public"]["Enums"]["tva_regime"]
          tva_taux: number
          type_objet: string | null
          updated_at: string
          validation_statut: Database["public"]["Enums"]["validation_statut"]
          visibilite: Database["public"]["Enums"]["produit_visibilite"]
          woodcase: string | null
        }
        Insert: {
          actions_requises?: string[]
          annee?: string | null
          archive_motif?: Database["public"]["Enums"]["motif_archivage"] | null
          archived_at?: string | null
          archived_by?: string | null
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
          disponibilite?: Database["public"]["Enums"]["produit_disponibilite"]
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
          prix_minimum_interne?: number | null
          prix_pro_ht?: number | null
          prix_public_ttc?: number | null
          prix_vente_cible?: number | null
          prix_vente_reel?: number | null
          prochaine_action?: string | null
          puissance?: string | null
          remise_pro_pct?: number | null
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
          tarif_pro_valide_jusqu?: string | null
          titre_commercial?: string | null
          trashed_at?: string | null
          trashed_by?: string | null
          tva_regime?: Database["public"]["Enums"]["tva_regime"]
          tva_taux?: number
          type_objet?: string | null
          updated_at?: string
          validation_statut?: Database["public"]["Enums"]["validation_statut"]
          visibilite?: Database["public"]["Enums"]["produit_visibilite"]
          woodcase?: string | null
        }
        Update: {
          actions_requises?: string[]
          annee?: string | null
          archive_motif?: Database["public"]["Enums"]["motif_archivage"] | null
          archived_at?: string | null
          archived_by?: string | null
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
          disponibilite?: Database["public"]["Enums"]["produit_disponibilite"]
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
          prix_minimum_interne?: number | null
          prix_pro_ht?: number | null
          prix_public_ttc?: number | null
          prix_vente_cible?: number | null
          prix_vente_reel?: number | null
          prochaine_action?: string | null
          puissance?: string | null
          remise_pro_pct?: number | null
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
          tarif_pro_valide_jusqu?: string | null
          titre_commercial?: string | null
          trashed_at?: string | null
          trashed_by?: string | null
          tva_regime?: Database["public"]["Enums"]["tva_regime"]
          tva_taux?: number
          type_objet?: string | null
          updated_at?: string
          validation_statut?: Database["public"]["Enums"]["validation_statut"]
          visibilite?: Database["public"]["Enums"]["produit_visibilite"]
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
          {
            foreignKeyName: "taches_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits_interne"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "taches_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits_public"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          permission: Database["public"]["Enums"]["role_permission"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          permission: Database["public"]["Enums"]["role_permission"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          permission?: Database["public"]["Enums"]["role_permission"]
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_status: {
        Row: {
          motif: string | null
          suspendu: boolean
          suspendu_at: string | null
          suspendu_par: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          motif?: string | null
          suspendu?: boolean
          suspendu_at?: string | null
          suspendu_par?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          motif?: string | null
          suspendu?: boolean
          suspendu_at?: string | null
          suspendu_par?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      produits_interne: {
        Row: {
          actions_requises: string[] | null
          annee: string | null
          archive_motif: Database["public"]["Enums"]["motif_archivage"] | null
          archived_at: string | null
          archived_by: string | null
          blocage: string | null
          cabinet: string | null
          canal_achat: string | null
          categorie: Database["public"]["Enums"]["categorie_produit"] | null
          coque_assise: string | null
          couleur: string | null
          cout_total: number | null
          cout_transport: number | null
          cout_travaux: number | null
          created_at: string | null
          date_achat: string | null
          date_limite: string | null
          date_vente: string | null
          description: string | null
          designer_ou_marque: string | null
          dimensions: string | null
          disponibilite:
            | Database["public"]["Enums"]["produit_disponibilite"]
            | null
          documents_authenticite: Json | null
          donnees_douteuses: Json | null
          doublon_groupe: string | null
          doublon_valide: boolean | null
          editeur_ou_label: string | null
          emplacement_stockage: string | null
          etat: string | null
          forme: string | null
          frequence: string | null
          id: string | null
          identifiant: string | null
          impedance: string | null
          import_original: Json | null
          liens_annonces: Json | null
          marge_potentielle: number | null
          materiaux: string | null
          modele: string | null
          nettoyage: Database["public"]["Enums"]["etat_nettoyage"] | null
          niveau_effort: number | null
          notes: string | null
          owner_id: string | null
          photos: Json | null
          pied: string | null
          plateformes_publication: string[] | null
          poids: string | null
          prix_achat: number | null
          prix_minimum_accepte: number | null
          prix_minimum_interne: number | null
          prix_pro_ht: number | null
          prix_public_ttc: number | null
          prix_vente_cible: number | null
          prix_vente_reel: number | null
          prochaine_action: string | null
          puissance: string | null
          remise_pro_pct: number | null
          restauration: Database["public"]["Enums"]["etat_restauration"] | null
          revetement: string | null
          sensibilite: string | null
          shopify_product_id: string | null
          source_feuille: string | null
          source_ligne: number | null
          sous_categorie: string | null
          statut: Database["public"]["Enums"]["statut_produit"] | null
          statut_calcule_le: string | null
          statut_modifie_manuellement: boolean | null
          statut_origine: Database["public"]["Enums"]["origine_statut"] | null
          tarif_pro_valide_jusqu: string | null
          titre_commercial: string | null
          trashed_at: string | null
          trashed_by: string | null
          tva_regime: Database["public"]["Enums"]["tva_regime"] | null
          tva_taux: number | null
          type_objet: string | null
          updated_at: string | null
          validation_statut:
            | Database["public"]["Enums"]["validation_statut"]
            | null
          visibilite: Database["public"]["Enums"]["produit_visibilite"] | null
          woodcase: string | null
        }
        Insert: {
          actions_requises?: string[] | null
          annee?: string | null
          archive_motif?: Database["public"]["Enums"]["motif_archivage"] | null
          archived_at?: string | null
          archived_by?: string | null
          blocage?: string | null
          cabinet?: string | null
          canal_achat?: string | null
          categorie?: Database["public"]["Enums"]["categorie_produit"] | null
          coque_assise?: string | null
          couleur?: string | null
          cout_total?: never
          cout_transport?: never
          cout_travaux?: never
          created_at?: string | null
          date_achat?: string | null
          date_limite?: string | null
          date_vente?: string | null
          description?: string | null
          designer_ou_marque?: string | null
          dimensions?: string | null
          disponibilite?:
            | Database["public"]["Enums"]["produit_disponibilite"]
            | null
          documents_authenticite?: Json | null
          donnees_douteuses?: Json | null
          doublon_groupe?: string | null
          doublon_valide?: boolean | null
          editeur_ou_label?: string | null
          emplacement_stockage?: string | null
          etat?: string | null
          forme?: string | null
          frequence?: string | null
          id?: string | null
          identifiant?: string | null
          impedance?: string | null
          import_original?: Json | null
          liens_annonces?: Json | null
          marge_potentielle?: never
          materiaux?: string | null
          modele?: string | null
          nettoyage?: Database["public"]["Enums"]["etat_nettoyage"] | null
          niveau_effort?: number | null
          notes?: string | null
          owner_id?: string | null
          photos?: Json | null
          pied?: string | null
          plateformes_publication?: string[] | null
          poids?: string | null
          prix_achat?: never
          prix_minimum_accepte?: never
          prix_minimum_interne?: never
          prix_pro_ht?: number | null
          prix_public_ttc?: number | null
          prix_vente_cible?: number | null
          prix_vente_reel?: number | null
          prochaine_action?: string | null
          puissance?: string | null
          remise_pro_pct?: number | null
          restauration?: Database["public"]["Enums"]["etat_restauration"] | null
          revetement?: string | null
          sensibilite?: string | null
          shopify_product_id?: string | null
          source_feuille?: string | null
          source_ligne?: number | null
          sous_categorie?: string | null
          statut?: Database["public"]["Enums"]["statut_produit"] | null
          statut_calcule_le?: string | null
          statut_modifie_manuellement?: boolean | null
          statut_origine?: Database["public"]["Enums"]["origine_statut"] | null
          tarif_pro_valide_jusqu?: string | null
          titre_commercial?: string | null
          trashed_at?: string | null
          trashed_by?: string | null
          tva_regime?: Database["public"]["Enums"]["tva_regime"] | null
          tva_taux?: number | null
          type_objet?: string | null
          updated_at?: string | null
          validation_statut?:
            | Database["public"]["Enums"]["validation_statut"]
            | null
          visibilite?: Database["public"]["Enums"]["produit_visibilite"] | null
          woodcase?: string | null
        }
        Update: {
          actions_requises?: string[] | null
          annee?: string | null
          archive_motif?: Database["public"]["Enums"]["motif_archivage"] | null
          archived_at?: string | null
          archived_by?: string | null
          blocage?: string | null
          cabinet?: string | null
          canal_achat?: string | null
          categorie?: Database["public"]["Enums"]["categorie_produit"] | null
          coque_assise?: string | null
          couleur?: string | null
          cout_total?: never
          cout_transport?: never
          cout_travaux?: never
          created_at?: string | null
          date_achat?: string | null
          date_limite?: string | null
          date_vente?: string | null
          description?: string | null
          designer_ou_marque?: string | null
          dimensions?: string | null
          disponibilite?:
            | Database["public"]["Enums"]["produit_disponibilite"]
            | null
          documents_authenticite?: Json | null
          donnees_douteuses?: Json | null
          doublon_groupe?: string | null
          doublon_valide?: boolean | null
          editeur_ou_label?: string | null
          emplacement_stockage?: string | null
          etat?: string | null
          forme?: string | null
          frequence?: string | null
          id?: string | null
          identifiant?: string | null
          impedance?: string | null
          import_original?: Json | null
          liens_annonces?: Json | null
          marge_potentielle?: never
          materiaux?: string | null
          modele?: string | null
          nettoyage?: Database["public"]["Enums"]["etat_nettoyage"] | null
          niveau_effort?: number | null
          notes?: string | null
          owner_id?: string | null
          photos?: Json | null
          pied?: string | null
          plateformes_publication?: string[] | null
          poids?: string | null
          prix_achat?: never
          prix_minimum_accepte?: never
          prix_minimum_interne?: never
          prix_pro_ht?: number | null
          prix_public_ttc?: number | null
          prix_vente_cible?: number | null
          prix_vente_reel?: number | null
          prochaine_action?: string | null
          puissance?: string | null
          remise_pro_pct?: number | null
          restauration?: Database["public"]["Enums"]["etat_restauration"] | null
          revetement?: string | null
          sensibilite?: string | null
          shopify_product_id?: string | null
          source_feuille?: string | null
          source_ligne?: number | null
          sous_categorie?: string | null
          statut?: Database["public"]["Enums"]["statut_produit"] | null
          statut_calcule_le?: string | null
          statut_modifie_manuellement?: boolean | null
          statut_origine?: Database["public"]["Enums"]["origine_statut"] | null
          tarif_pro_valide_jusqu?: string | null
          titre_commercial?: string | null
          trashed_at?: string | null
          trashed_by?: string | null
          tva_regime?: Database["public"]["Enums"]["tva_regime"] | null
          tva_taux?: number | null
          type_objet?: string | null
          updated_at?: string | null
          validation_statut?:
            | Database["public"]["Enums"]["validation_statut"]
            | null
          visibilite?: Database["public"]["Enums"]["produit_visibilite"] | null
          woodcase?: string | null
        }
        Relationships: []
      }
      produits_public: {
        Row: {
          annee: string | null
          categorie: Database["public"]["Enums"]["categorie_produit"] | null
          couleur: string | null
          created_at: string | null
          description: string | null
          designer_ou_marque: string | null
          dimensions: string | null
          disponibilite:
            | Database["public"]["Enums"]["produit_disponibilite"]
            | null
          editeur_ou_label: string | null
          etat: string | null
          id: string | null
          identifiant: string | null
          materiaux: string | null
          modele: string | null
          photos: Json | null
          prix_pro_ht: number | null
          prix_public_ttc: number | null
          sous_categorie: string | null
          titre_commercial: string | null
          tva_regime: Database["public"]["Enums"]["tva_regime"] | null
          tva_taux: number | null
          updated_at: string | null
          visibilite: Database["public"]["Enums"]["produit_visibilite"] | null
        }
        Insert: {
          annee?: string | null
          categorie?: Database["public"]["Enums"]["categorie_produit"] | null
          couleur?: string | null
          created_at?: string | null
          description?: string | null
          designer_ou_marque?: string | null
          dimensions?: string | null
          disponibilite?:
            | Database["public"]["Enums"]["produit_disponibilite"]
            | null
          editeur_ou_label?: string | null
          etat?: string | null
          id?: string | null
          identifiant?: string | null
          materiaux?: string | null
          modele?: string | null
          photos?: Json | null
          prix_pro_ht?: never
          prix_public_ttc?: number | null
          sous_categorie?: string | null
          titre_commercial?: string | null
          tva_regime?: Database["public"]["Enums"]["tva_regime"] | null
          tva_taux?: number | null
          updated_at?: string | null
          visibilite?: Database["public"]["Enums"]["produit_visibilite"] | null
        }
        Update: {
          annee?: string | null
          categorie?: Database["public"]["Enums"]["categorie_produit"] | null
          couleur?: string | null
          created_at?: string | null
          description?: string | null
          designer_ou_marque?: string | null
          dimensions?: string | null
          disponibilite?:
            | Database["public"]["Enums"]["produit_disponibilite"]
            | null
          editeur_ou_label?: string | null
          etat?: string | null
          id?: string | null
          identifiant?: string | null
          materiaux?: string | null
          modele?: string | null
          photos?: Json | null
          prix_pro_ht?: never
          prix_public_ttc?: number | null
          sous_categorie?: string | null
          titre_commercial?: string | null
          tva_regime?: Database["public"]["Enums"]["tva_regime"] | null
          tva_taux?: number | null
          updated_at?: string | null
          visibilite?: Database["public"]["Enums"]["produit_visibilite"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      _can_archive: { Args: { _uid: string }; Returns: boolean }
      _check_finance_field_write: {
        Args: { _field: string; _uid: string }
        Returns: undefined
      }
      _finance_editable_fields: { Args: never; Returns: string[] }
      _is_interne: { Args: { _uid: string }; Returns: boolean }
      _ordinary_editable_fields: { Args: never; Returns: string[] }
      archive_produit: {
        Args: {
          _id: string
          _motif: Database["public"]["Enums"]["motif_archivage"]
        }
        Returns: undefined
      }
      calculer_actions_requises: {
        Args: { p: Database["public"]["Tables"]["produits"]["Row"] }
        Returns: string[]
      }
      calculer_statut_produit: {
        Args: { p: Database["public"]["Tables"]["produits"]["Row"] }
        Returns: Database["public"]["Enums"]["statut_produit"]
      }
      can_view_finances: { Args: { _uid: string }; Returns: boolean }
      create_produit: {
        Args: { _data: Json }
        Returns: {
          actions_requises: string[] | null
          annee: string | null
          archive_motif: Database["public"]["Enums"]["motif_archivage"] | null
          archived_at: string | null
          archived_by: string | null
          blocage: string | null
          cabinet: string | null
          canal_achat: string | null
          categorie: Database["public"]["Enums"]["categorie_produit"] | null
          coque_assise: string | null
          couleur: string | null
          cout_total: number | null
          cout_transport: number | null
          cout_travaux: number | null
          created_at: string | null
          date_achat: string | null
          date_limite: string | null
          date_vente: string | null
          description: string | null
          designer_ou_marque: string | null
          dimensions: string | null
          disponibilite:
            | Database["public"]["Enums"]["produit_disponibilite"]
            | null
          documents_authenticite: Json | null
          donnees_douteuses: Json | null
          doublon_groupe: string | null
          doublon_valide: boolean | null
          editeur_ou_label: string | null
          emplacement_stockage: string | null
          etat: string | null
          forme: string | null
          frequence: string | null
          id: string | null
          identifiant: string | null
          impedance: string | null
          import_original: Json | null
          liens_annonces: Json | null
          marge_potentielle: number | null
          materiaux: string | null
          modele: string | null
          nettoyage: Database["public"]["Enums"]["etat_nettoyage"] | null
          niveau_effort: number | null
          notes: string | null
          owner_id: string | null
          photos: Json | null
          pied: string | null
          plateformes_publication: string[] | null
          poids: string | null
          prix_achat: number | null
          prix_minimum_accepte: number | null
          prix_minimum_interne: number | null
          prix_pro_ht: number | null
          prix_public_ttc: number | null
          prix_vente_cible: number | null
          prix_vente_reel: number | null
          prochaine_action: string | null
          puissance: string | null
          remise_pro_pct: number | null
          restauration: Database["public"]["Enums"]["etat_restauration"] | null
          revetement: string | null
          sensibilite: string | null
          shopify_product_id: string | null
          source_feuille: string | null
          source_ligne: number | null
          sous_categorie: string | null
          statut: Database["public"]["Enums"]["statut_produit"] | null
          statut_calcule_le: string | null
          statut_modifie_manuellement: boolean | null
          statut_origine: Database["public"]["Enums"]["origine_statut"] | null
          tarif_pro_valide_jusqu: string | null
          titre_commercial: string | null
          trashed_at: string | null
          trashed_by: string | null
          tva_regime: Database["public"]["Enums"]["tva_regime"] | null
          tva_taux: number | null
          type_objet: string | null
          updated_at: string | null
          validation_statut:
            | Database["public"]["Enums"]["validation_statut"]
            | null
          visibilite: Database["public"]["Enums"]["produit_visibilite"] | null
          woodcase: string | null
        }
        SetofOptions: {
          from: "*"
          to: "produits_interne"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      delete_produit_definitivement: {
        Args: { _id: string }
        Returns: undefined
      }
      get_produit_interne: {
        Args: { _id: string }
        Returns: {
          actions_requises: string[] | null
          annee: string | null
          archive_motif: Database["public"]["Enums"]["motif_archivage"] | null
          archived_at: string | null
          archived_by: string | null
          blocage: string | null
          cabinet: string | null
          canal_achat: string | null
          categorie: Database["public"]["Enums"]["categorie_produit"] | null
          coque_assise: string | null
          couleur: string | null
          cout_total: number | null
          cout_transport: number | null
          cout_travaux: number | null
          created_at: string | null
          date_achat: string | null
          date_limite: string | null
          date_vente: string | null
          description: string | null
          designer_ou_marque: string | null
          dimensions: string | null
          disponibilite:
            | Database["public"]["Enums"]["produit_disponibilite"]
            | null
          documents_authenticite: Json | null
          donnees_douteuses: Json | null
          doublon_groupe: string | null
          doublon_valide: boolean | null
          editeur_ou_label: string | null
          emplacement_stockage: string | null
          etat: string | null
          forme: string | null
          frequence: string | null
          id: string | null
          identifiant: string | null
          impedance: string | null
          import_original: Json | null
          liens_annonces: Json | null
          marge_potentielle: number | null
          materiaux: string | null
          modele: string | null
          nettoyage: Database["public"]["Enums"]["etat_nettoyage"] | null
          niveau_effort: number | null
          notes: string | null
          owner_id: string | null
          photos: Json | null
          pied: string | null
          plateformes_publication: string[] | null
          poids: string | null
          prix_achat: number | null
          prix_minimum_accepte: number | null
          prix_minimum_interne: number | null
          prix_pro_ht: number | null
          prix_public_ttc: number | null
          prix_vente_cible: number | null
          prix_vente_reel: number | null
          prochaine_action: string | null
          puissance: string | null
          remise_pro_pct: number | null
          restauration: Database["public"]["Enums"]["etat_restauration"] | null
          revetement: string | null
          sensibilite: string | null
          shopify_product_id: string | null
          source_feuille: string | null
          source_ligne: number | null
          sous_categorie: string | null
          statut: Database["public"]["Enums"]["statut_produit"] | null
          statut_calcule_le: string | null
          statut_modifie_manuellement: boolean | null
          statut_origine: Database["public"]["Enums"]["origine_statut"] | null
          tarif_pro_valide_jusqu: string | null
          titre_commercial: string | null
          trashed_at: string | null
          trashed_by: string | null
          tva_regime: Database["public"]["Enums"]["tva_regime"] | null
          tva_taux: number | null
          type_objet: string | null
          updated_at: string | null
          validation_statut:
            | Database["public"]["Enums"]["validation_statut"]
            | null
          visibilite: Database["public"]["Enums"]["produit_visibilite"] | null
          woodcase: string | null
        }
        SetofOptions: {
          from: "*"
          to: "produits_interne"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_permission: {
        Args: {
          _perm: Database["public"]["Enums"]["role_permission"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role_name: {
        Args: { _role_name: string; _user_id: string }
        Returns: boolean
      }
      list_produits_interne: {
        Args: never
        Returns: {
          actions_requises: string[] | null
          annee: string | null
          archive_motif: Database["public"]["Enums"]["motif_archivage"] | null
          archived_at: string | null
          archived_by: string | null
          blocage: string | null
          cabinet: string | null
          canal_achat: string | null
          categorie: Database["public"]["Enums"]["categorie_produit"] | null
          coque_assise: string | null
          couleur: string | null
          cout_total: number | null
          cout_transport: number | null
          cout_travaux: number | null
          created_at: string | null
          date_achat: string | null
          date_limite: string | null
          date_vente: string | null
          description: string | null
          designer_ou_marque: string | null
          dimensions: string | null
          disponibilite:
            | Database["public"]["Enums"]["produit_disponibilite"]
            | null
          documents_authenticite: Json | null
          donnees_douteuses: Json | null
          doublon_groupe: string | null
          doublon_valide: boolean | null
          editeur_ou_label: string | null
          emplacement_stockage: string | null
          etat: string | null
          forme: string | null
          frequence: string | null
          id: string | null
          identifiant: string | null
          impedance: string | null
          import_original: Json | null
          liens_annonces: Json | null
          marge_potentielle: number | null
          materiaux: string | null
          modele: string | null
          nettoyage: Database["public"]["Enums"]["etat_nettoyage"] | null
          niveau_effort: number | null
          notes: string | null
          owner_id: string | null
          photos: Json | null
          pied: string | null
          plateformes_publication: string[] | null
          poids: string | null
          prix_achat: number | null
          prix_minimum_accepte: number | null
          prix_minimum_interne: number | null
          prix_pro_ht: number | null
          prix_public_ttc: number | null
          prix_vente_cible: number | null
          prix_vente_reel: number | null
          prochaine_action: string | null
          puissance: string | null
          remise_pro_pct: number | null
          restauration: Database["public"]["Enums"]["etat_restauration"] | null
          revetement: string | null
          sensibilite: string | null
          shopify_product_id: string | null
          source_feuille: string | null
          source_ligne: number | null
          sous_categorie: string | null
          statut: Database["public"]["Enums"]["statut_produit"] | null
          statut_calcule_le: string | null
          statut_modifie_manuellement: boolean | null
          statut_origine: Database["public"]["Enums"]["origine_statut"] | null
          tarif_pro_valide_jusqu: string | null
          titre_commercial: string | null
          trashed_at: string | null
          trashed_by: string | null
          tva_regime: Database["public"]["Enums"]["tva_regime"] | null
          tva_taux: number | null
          type_objet: string | null
          updated_at: string | null
          validation_statut:
            | Database["public"]["Enums"]["validation_statut"]
            | null
          visibilite: Database["public"]["Enums"]["produit_visibilite"] | null
          woodcase: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "produits_interne"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      marge_reelle: {
        Args: { p: Database["public"]["Tables"]["produits"]["Row"] }
        Returns: number
      }
      restore_produit_from_archive: {
        Args: { _id: string }
        Returns: undefined
      }
      restore_produit_from_trash: { Args: { _id: string }; Returns: undefined }
      trash_produit: { Args: { _id: string }; Returns: undefined }
      update_produit: {
        Args: { _data: Json; _id: string }
        Returns: {
          actions_requises: string[] | null
          annee: string | null
          archive_motif: Database["public"]["Enums"]["motif_archivage"] | null
          archived_at: string | null
          archived_by: string | null
          blocage: string | null
          cabinet: string | null
          canal_achat: string | null
          categorie: Database["public"]["Enums"]["categorie_produit"] | null
          coque_assise: string | null
          couleur: string | null
          cout_total: number | null
          cout_transport: number | null
          cout_travaux: number | null
          created_at: string | null
          date_achat: string | null
          date_limite: string | null
          date_vente: string | null
          description: string | null
          designer_ou_marque: string | null
          dimensions: string | null
          disponibilite:
            | Database["public"]["Enums"]["produit_disponibilite"]
            | null
          documents_authenticite: Json | null
          donnees_douteuses: Json | null
          doublon_groupe: string | null
          doublon_valide: boolean | null
          editeur_ou_label: string | null
          emplacement_stockage: string | null
          etat: string | null
          forme: string | null
          frequence: string | null
          id: string | null
          identifiant: string | null
          impedance: string | null
          import_original: Json | null
          liens_annonces: Json | null
          marge_potentielle: number | null
          materiaux: string | null
          modele: string | null
          nettoyage: Database["public"]["Enums"]["etat_nettoyage"] | null
          niveau_effort: number | null
          notes: string | null
          owner_id: string | null
          photos: Json | null
          pied: string | null
          plateformes_publication: string[] | null
          poids: string | null
          prix_achat: number | null
          prix_minimum_accepte: number | null
          prix_minimum_interne: number | null
          prix_pro_ht: number | null
          prix_public_ttc: number | null
          prix_vente_cible: number | null
          prix_vente_reel: number | null
          prochaine_action: string | null
          puissance: string | null
          remise_pro_pct: number | null
          restauration: Database["public"]["Enums"]["etat_restauration"] | null
          revetement: string | null
          sensibilite: string | null
          shopify_product_id: string | null
          source_feuille: string | null
          source_ligne: number | null
          sous_categorie: string | null
          statut: Database["public"]["Enums"]["statut_produit"] | null
          statut_calcule_le: string | null
          statut_modifie_manuellement: boolean | null
          statut_origine: Database["public"]["Enums"]["origine_statut"] | null
          tarif_pro_valide_jusqu: string | null
          titre_commercial: string | null
          trashed_at: string | null
          trashed_by: string | null
          tva_regime: Database["public"]["Enums"]["tva_regime"] | null
          tva_taux: number | null
          type_objet: string | null
          updated_at: string | null
          validation_statut:
            | Database["public"]["Enums"]["validation_statut"]
            | null
          visibilite: Database["public"]["Enums"]["produit_visibilite"] | null
          woodcase: string | null
        }
        SetofOptions: {
          from: "*"
          to: "produits_interne"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      action_historique:
        | "cree"
        | "modifie"
        | "archive"
        | "restaure_archive"
        | "corbeille"
        | "restaure_corbeille"
        | "supprime"
      app_role:
        | "admin"
        | "user"
        | "collaborateur"
        | "invite_particulier"
        | "invite_pro"
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
      invitation_statut: "en_attente" | "acceptee" | "expiree" | "revoquee"
      motif_archivage:
        | "vendu_anterieurement"
        | "retire_vente"
        | "conservation_perso"
        | "donne"
        | "perdu_endommage"
        | "erreur_saisie"
        | "autre"
      origine_statut: "automatique" | "manuel"
      produit_disponibilite:
        | "DISPONIBLE"
        | "RESERVE"
        | "VENDU"
        | "NON_DISPONIBLE"
        | "SUR_DEMANDE"
      produit_visibilite: "PRIVE" | "PARTICULIER" | "PRO" | "TOUS" | "MASQUE"
      role_permission:
        | "voir_prix_achat"
        | "voir_marges"
        | "modifier_prix"
        | "voir_factures_achat"
        | "creer_produit"
        | "modifier_produit"
        | "archiver_produit"
        | "exporter"
        | "voir_couts"
        | "voir_prix_minimum"
        | "modifier_prix_achat"
        | "modifier_prix_public"
        | "modifier_prix_pro"
        | "modifier_prix_minimum"
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
      tva_regime: "marge" | "normal"
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
      validation_statut: "brouillon" | "valide"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      action_historique: [
        "cree",
        "modifie",
        "archive",
        "restaure_archive",
        "corbeille",
        "restaure_corbeille",
        "supprime",
      ],
      app_role: [
        "admin",
        "user",
        "collaborateur",
        "invite_particulier",
        "invite_pro",
      ],
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
      invitation_statut: ["en_attente", "acceptee", "expiree", "revoquee"],
      motif_archivage: [
        "vendu_anterieurement",
        "retire_vente",
        "conservation_perso",
        "donne",
        "perdu_endommage",
        "erreur_saisie",
        "autre",
      ],
      origine_statut: ["automatique", "manuel"],
      produit_disponibilite: [
        "DISPONIBLE",
        "RESERVE",
        "VENDU",
        "NON_DISPONIBLE",
        "SUR_DEMANDE",
      ],
      produit_visibilite: ["PRIVE", "PARTICULIER", "PRO", "TOUS", "MASQUE"],
      role_permission: [
        "voir_prix_achat",
        "voir_marges",
        "modifier_prix",
        "voir_factures_achat",
        "creer_produit",
        "modifier_produit",
        "archiver_produit",
        "exporter",
        "voir_couts",
        "voir_prix_minimum",
        "modifier_prix_achat",
        "modifier_prix_public",
        "modifier_prix_pro",
        "modifier_prix_minimum",
      ],
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
      tva_regime: ["marge", "normal"],
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
      validation_statut: ["brouillon", "valide"],
    },
  },
} as const
