
## Étape 7 — Archivage, corbeille et suppression

Trois niveaux distincts, avec parcours obligatoire Carte → menu ⋯ → Corbeille → Suppression définitive (admin uniquement).

### 1. Base de données (migration unique)

Ajouts sur `produits` (non destructifs, aucune donnée existante modifiée) :
- `archived_at` timestamptz, `archived_by` uuid, `archive_motif` text
- `trashed_at` timestamptz, `trashed_by` uuid
- Enum `motif_archivage` : `vendu_anterieurement | retire_vente | conservation_perso | donne | perdu_endommage | erreur_saisie | autre`
- Index partiels sur `archived_at IS NULL AND trashed_at IS NULL` (stock actif rapide)

Nouvelles tables :
- `user_roles` (id, user_id, role enum `app_role = admin | user`, unique(user_id, role)) + RLS + fonction `has_role(uuid, app_role)` SECURITY DEFINER. Utilisatrice actuelle promue `admin`.
- `produit_historique` : id, produit_id, identifiant (copié pour survie), action enum (`cree | modifie | archive | restaure | corbeille | restaure_corbeille | supprime`), acteur uuid, acteur_email text, details jsonb, created_at.

RLS :
- `produits` : les policies existantes deviennent `WHERE trashed_at IS NULL` par défaut. Nouvelle policy admin pour voir/agir sur corbeille. DELETE réservé à `has_role(auth.uid(),'admin')`.
- `produit_historique` : lecture propriétaire, insertion via triggers.

Triggers :
- `produits_audit` : INSERT/UPDATE (archivage, corbeille, restauration) → ligne dans `produit_historique`.
- `produits_before_delete` : consigne la suppression définitive avant DELETE.
- Le calcul auto de `statut` continue de tourner ; `ARCHIVE` n'est plus utilisé pour marquer l'archivage (on utilise `archived_at`), le statut reste celui du parcours.

Pas de suppression automatique de la corbeille (rétention manuelle).

### 2. Fetchers & filtres

`src/lib/produits.ts` : helpers `estActif(p)`, `estArchive(p)`, `estCorbeille(p)`.

Toutes les requêtes existantes (Stock, Aujourd'hui, À débloquer, Kanban, Finances/immobilisé, Qualité, Tâches liées) filtrent `archived_at IS NULL AND trashed_at IS NULL`.

Exceptions :
- Finances → CA / marges réalisées : incluent les archivés vendus (`prix_vente_reel` non nul).
- Stock : nouveau sélecteur `Actifs (défaut) | Archivés | Corbeille`.

### 3. UI — menu ⋯ sur chaque carte

Nouveau composant `ProduitMenu` (popover), déclenché depuis `ProduitCard` et la fiche :
- Ouvrir la fiche
- Modifier (→ fiche en mode édition)
- Changer le statut (sous-menu avec liste `STATUTS`)
- Ajouter une photo (déclenche input caméra)
- Ajouter une tâche (mini-dialog)
- Dupliquer (nouveau VV-XXXX, copie champs hors photos/ventes)
- Archiver (dialog motif)
- Mettre à la corbeille (dialog, garde-fou si vendu)

Le menu ⋯ remplace le clic-carte comme point d'entrée des actions ; le clic sur la zone principale reste = ouvrir la fiche.

### 4. Dialogs

- **Archiver** : choix motif (radio), bouton Confirmer. Toast "Produit archivé — Annuler" (5 s).
- **Mettre à la corbeille** :
  - Si `prix_vente_reel` renseigné → écran d'avertissement "informations de vente utilisées…" avec 3 boutons : Annuler / Archiver / Continuer (Continuer visible uniquement si admin).
  - Sinon confirmation simple. Toast "Produit placé dans la corbeille — Annuler" (5 s, restaure via update `trashed_at = null`).
- **Supprimer définitivement** (page Corbeille uniquement, admin) :
  - Récapitulatif : photo principale, VV-ID, marque, modèle, prix achat, prix cible, nb photos, nb tâches.
  - Message d'irréversibilité.
  - Champ texte : doit contenir exactement l'identifiant (`VV-0042`).
  - Bouton rouge désactivé tant que la saisie ne correspond pas.

### 5. Nouvelle page Corbeille

`src/routes/_authenticated/corbeille.tsx` (entrée dans le menu "Plus") :
- Liste des produits `trashed_at IS NOT NULL`.
- Colonnes : VV, marque/modèle, date corbeille, par qui.
- Actions : Restaurer / Supprimer définitivement (admin).

Filtre "Archivés" dans Stock via le sélecteur d'audience ; action "Restaurer dans le stock actif" sur chaque ligne archivée.

### 6. Historique

Affiché en bas de la fiche produit : liste chronologique compacte (date, acteur, action, détails).

### 7. Sécurité & conventions

- Rôles stockés dans `user_roles` (jamais dans `profiles`) — utilise `has_role()` SECURITY DEFINER.
- Suppression multiple désactivée (pas d'UI de sélection multi).
- L'identifiant d'un produit supprimé n'est jamais réattribué (les nouveaux VV sont générés via `max(source_ligne)+1` déjà en place, jamais recyclés).

### Ce qui ne change pas
- Design (crème / bordeaux / laiton, serif).
- Les 137 produits, leurs identifiants VV-xxxx, statuts, photos, tâches.
- Les autres écrans (juste le filtre actif/archivé/corbeille en amont).

---

Je lance la migration (schéma + rôle admin + triggers historique) dès ta validation, puis j'enchaîne UI (menu ⋯, dialogs, page Corbeille, historique fiche) dans la foulée. OK ?
