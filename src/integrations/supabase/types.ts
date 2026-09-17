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
      categorie_champs: {
        Row: {
          categorie_id: string
          champ: string
          created_at: string
          id: string
          libelle: string
          obligatoire: boolean
          ordre: number
          updated_at: string
        }
        Insert: {
          categorie_id: string
          champ: string
          created_at?: string
          id?: string
          libelle: string
          obligatoire?: boolean
          ordre?: number
          updated_at?: string
        }
        Update: {
          categorie_id?: string
          champ?: string
          created_at?: string
          id?: string
          libelle?: string
          obligatoire?: boolean
          ordre?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categorie_champs_categorie_id_fkey"
            columns: ["categorie_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          actif: boolean
          created_at: string
          id: string
          libelle: string
          ordre: number
          slug: string
          updated_at: string
        }
        Insert: {
          actif?: boolean
          created_at?: string
          id?: string
          libelle: string
          ordre?: number
          slug: string
          updated_at?: string
        }
        Update: {
          actif?: boolean
          created_at?: string
          id?: string
          libelle?: string
          ordre?: number
          slug?: string
          updated_at?: string
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
      lot_produits: {
        Row: {
          created_at: string
          lot_id: string
          produit_id: string
        }
        Insert: {
          created_at?: string
          lot_id: string
          produit_id: string
        }
        Update: {
          created_at?: string
          lot_id?: string
          produit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lot_produits_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lot_produits_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots_detail"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lot_produits_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lot_produits_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits_interne"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lot_produits_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits_public"
            referencedColumns: ["id"]
          },
        ]
      }
      lots: {
        Row: {
          archived_at: string | null
          created_at: string
          description: string | null
          id: string
          identifiant: string
          libelle: string
          notes: string | null
          owner_id: string
          prix_lot_negocie: number | null
          trashed_at: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          identifiant: string
          libelle: string
          notes?: string | null
          owner_id: string
          prix_lot_negocie?: number | null
          trashed_at?: string | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          identifiant?: string
          libelle?: string
          notes?: string | null
          owner_id?: string
          prix_lot_negocie?: number | null
          trashed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      matieres: {
        Row: {
          actif: boolean
          created_at: string
          id: string
          libelle: string
          ordre: number
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          actif?: boolean
          created_at?: string
          id?: string
          libelle: string
          ordre?: number
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          actif?: boolean
          created_at?: string
          id?: string
          libelle?: string
          ordre?: number
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matieres_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "matieres"
            referencedColumns: ["id"]
          },
        ]
      }
      produit_categories: {
        Row: {
          categorie_id: string
          created_at: string
          produit_id: string
        }
        Insert: {
          categorie_id: string
          created_at?: string
          produit_id: string
        }
        Update: {
          categorie_id?: string
          created_at?: string
          produit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "produit_categories_categorie_id_fkey"
            columns: ["categorie_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produit_categories_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produit_categories_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits_interne"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produit_categories_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits_public"
            referencedColumns: ["id"]
          },
        ]
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
      produit_matieres: {
        Row: {
          created_at: string
          matiere_id: string
          produit_id: string
          role: Database["public"]["Enums"]["matiere_role"]
        }
        Insert: {
          created_at?: string
          matiere_id: string
          produit_id: string
          role?: Database["public"]["Enums"]["matiere_role"]
        }
        Update: {
          created_at?: string
          matiere_id?: string
          produit_id?: string
          role?: Database["public"]["Enums"]["matiere_role"]
        }
        Relationships: [
          {
            foreignKeyName: "produit_matieres_matiere_id_fkey"
            columns: ["matiere_id"]
            isOneToOne: false
            referencedRelation: "matieres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produit_matieres_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produit_matieres_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits_interne"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produit_matieres_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits_public"
            referencedColumns: ["id"]
          },
        ]
      }
      produit_sous_categories: {
        Row: {
          created_at: string
          produit_id: string
          sous_categorie_id: string
        }
        Insert: {
          created_at?: string
          produit_id: string
          sous_categorie_id: string
        }
        Update: {
          created_at?: string
          produit_id?: string
          sous_categorie_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "produit_sous_categories_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produit_sous_categories_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits_interne"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produit_sous_categories_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produit_sous_categories_sous_categorie_id_fkey"
            columns: ["sous_categorie_id"]
            isOneToOne: false
            referencedRelation: "sous_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      produit_types: {
        Row: {
          created_at: string
          produit_id: string
          type_objet_id: string
        }
        Insert: {
          created_at?: string
          produit_id: string
          type_objet_id: string
        }
        Update: {
          created_at?: string
          produit_id?: string
          type_objet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "produit_types_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produit_types_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits_interne"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produit_types_produit_id_fkey"
            columns: ["produit_id"]
            isOneToOne: false
            referencedRelation: "produits_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produit_types_type_objet_id_fkey"
            columns: ["type_objet_id"]
            isOneToOne: false
            referencedRelation: "types_objet"
            referencedColumns: ["id"]
          },
        ]
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
          categorie_shopify_id: string | null
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
          categorie_shopify_id?: string | null
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
          categorie_shopify_id?: string | null
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
          updated_at?: string
          validation_statut?: Database["public"]["Enums"]["validation_statut"]
          visibilite?: Database["public"]["Enums"]["produit_visibilite"]
          woodcase?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produits_categorie_shopify_id_fkey"
            columns: ["categorie_shopify_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
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
      sous_categories: {
        Row: {
          actif: boolean
          categorie_id: string
          created_at: string
          id: string
          libelle: string
          ordre: number
          slug: string
          updated_at: string
        }
        Insert: {
          actif?: boolean
          categorie_id: string
          created_at?: string
          id?: string
          libelle: string
          ordre?: number
          slug: string
          updated_at?: string
        }
        Update: {
          actif?: boolean
          categorie_id?: string
          created_at?: string
          id?: string
          libelle?: string
          ordre?: number
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sous_categories_categorie_id_fkey"
            columns: ["categorie_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
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
      types_objet: {
        Row: {
          actif: boolean
          created_at: string
          id: string
          libelle: string
          ordre: number
          slug: string
          updated_at: string
        }
        Insert: {
          actif?: boolean
          created_at?: string
          id?: string
          libelle: string
          ordre?: number
          slug: string
          updated_at?: string
        }
        Update: {
          actif?: boolean
          created_at?: string
          id?: string
          libelle?: string
          ordre?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
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
      lots_detail: {
        Row: {
          archived_at: string | null
          created_at: string | null
          description: string | null
          id: string | null
          identifiant: string | null
          libelle: string | null
          nb_produits: number | null
          notes: string | null
          owner_id: string | null
          prix_calcule: number | null
          prix_lot_negocie: number | null
          statut_calcule: string | null
          trashed_at: string | null
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          identifiant?: string | null
          libelle?: string | null
          nb_produits?: never
          notes?: string | null
          owner_id?: string | null
          prix_calcule?: never
          prix_lot_negocie?: number | null
          statut_calcule?: never
          trashed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          identifiant?: string | null
          libelle?: string | null
          nb_produits?: never
          notes?: string | null
          owner_id?: string | null
          prix_calcule?: never
          prix_lot_negocie?: number | null
          statut_calcule?: never
          trashed_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
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
          categorie_ids: string[] | null
          categorie_shopify_id: string | null
          categories_libelles: string[] | null
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
          lot_id: string | null
          lot_identifiant: string | null
          lot_libelle: string | null
          marge_potentielle: number | null
          matieres: Json | null
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
          sous_categorie_ids: string[] | null
          sous_categories_libelles: string[] | null
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
          type_objet_ids: string[] | null
          types_libelles: string[] | null
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
          categorie_ids?: never
          categorie_shopify_id?: string | null
          categories_libelles?: never
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
          lot_id?: never
          lot_identifiant?: never
          lot_libelle?: never
          marge_potentielle?: never
          matieres?: never
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
          sous_categorie_ids?: never
          sous_categories_libelles?: never
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
          type_objet_ids?: never
          types_libelles?: never
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
          categorie_ids?: never
          categorie_shopify_id?: string | null
          categories_libelles?: never
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
          lot_id?: never
          lot_identifiant?: never
          lot_libelle?: never
          marge_potentielle?: never
          matieres?: never
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
          sous_categorie_ids?: never
          sous_categories_libelles?: never
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
          type_objet_ids?: never
          types_libelles?: never
          updated_at?: string | null
          validation_statut?:
            | Database["public"]["Enums"]["validation_statut"]
            | null
          visibilite?: Database["public"]["Enums"]["produit_visibilite"] | null
          woodcase?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produits_categorie_shopify_id_fkey"
            columns: ["categorie_shopify_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      produits_public: {
        Row: {
          annee: string | null
          categories_libelles: string[] | null
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
          matieres_libelles: string[] | null
          modele: string | null
          photos: Json | null
          prix_pro_ht: number | null
          prix_public_ttc: number | null
          sous_categories_libelles: string[] | null
          titre_commercial: string | null
          tva_regime: Database["public"]["Enums"]["tva_regime"] | null
          tva_taux: number | null
          types_libelles: string[] | null
          updated_at: string | null
          visibilite: Database["public"]["Enums"]["produit_visibilite"] | null
        }
        Insert: {
          annee?: string | null
          categories_libelles?: never
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
          matieres_libelles?: never
          modele?: string | null
          photos?: Json | null
          prix_pro_ht?: never
          prix_public_ttc?: number | null
          sous_categories_libelles?: never
          titre_commercial?: string | null
          tva_regime?: Database["public"]["Enums"]["tva_regime"] | null
          tva_taux?: number | null
          types_libelles?: never
          updated_at?: string | null
          visibilite?: Database["public"]["Enums"]["produit_visibilite"] | null
        }
        Update: {
          annee?: string | null
          categories_libelles?: never
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
          matieres_libelles?: never
          modele?: string | null
          photos?: Json | null
          prix_pro_ht?: never
          prix_public_ttc?: number | null
          sous_categories_libelles?: never
          titre_commercial?: string | null
          tva_regime?: Database["public"]["Enums"]["tva_regime"] | null
          tva_taux?: number | null
          types_libelles?: never
          updated_at?: string | null
          visibilite?: Database["public"]["Enums"]["produit_visibilite"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      _can_archive: { Args: { _uid: string }; Returns: boolean }
      _can_modifier_produit: { Args: { _uid: string }; Returns: boolean }
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
          categorie_ids: string[] | null
          categorie_shopify_id: string | null
          categories_libelles: string[] | null
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
          lot_id: string | null
          lot_identifiant: string | null
          lot_libelle: string | null
          marge_potentielle: number | null
          matieres: Json | null
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
          sous_categorie_ids: string[] | null
          sous_categories_libelles: string[] | null
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
          type_objet_ids: string[] | null
          types_libelles: string[] | null
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
          categorie_ids: string[] | null
          categorie_shopify_id: string | null
          categories_libelles: string[] | null
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
          lot_id: string | null
          lot_identifiant: string | null
          lot_libelle: string | null
          marge_potentielle: number | null
          matieres: Json | null
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
          sous_categorie_ids: string[] | null
          sous_categories_libelles: string[] | null
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
          type_objet_ids: string[] | null
          types_libelles: string[] | null
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
          categorie_ids: string[] | null
          categorie_shopify_id: string | null
          categories_libelles: string[] | null
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
          lot_id: string | null
          lot_identifiant: string | null
          lot_libelle: string | null
          marge_potentielle: number | null
          matieres: Json | null
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
          sous_categorie_ids: string[] | null
          sous_categories_libelles: string[] | null
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
          type_objet_ids: string[] | null
          types_libelles: string[] | null
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
      prochain_identifiant_lot: { Args: never; Returns: string }
      prochain_identifiant_produit: { Args: never; Returns: string }
      restore_produit_from_archive: {
        Args: { _id: string }
        Returns: undefined
      }
      restore_produit_from_trash: { Args: { _id: string }; Returns: undefined }
      set_produit_rattachements: {
        Args: {
          _categories: string[]
          _id: string
          _matieres: Json
          _sous_categories: string[]
          _types: string[]
        }
        Returns: undefined
      }
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
          categorie_ids: string[] | null
          categorie_shopify_id: string | null
          categories_libelles: string[] | null
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
          lot_id: string | null
          lot_identifiant: string | null
          lot_libelle: string | null
          marge_potentielle: number | null
          matieres: Json | null
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
          sous_categorie_ids: string[] | null
          sous_categories_libelles: string[] | null
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
          type_objet_ids: string[] | null
          types_libelles: string[] | null
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
      etat_nettoyage: "a_verifier" | "necessaire" | "non_necessaire" | "termine"
      etat_restauration:
        | "a_verifier"
        | "necessaire"
        | "non_necessaire"
        | "terminee"
      invitation_statut: "en_attente" | "acceptee" | "expiree" | "revoquee"
      matiere_role: "principale" | "secondaire"
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
      etat_nettoyage: ["a_verifier", "necessaire", "non_necessaire", "termine"],
      etat_restauration: [
        "a_verifier",
        "necessaire",
        "non_necessaire",
        "terminee",
      ],
      invitation_statut: ["en_attente", "acceptee", "expiree", "revoquee"],
      matiere_role: ["principale", "secondaire"],
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
