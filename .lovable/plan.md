## Préalable — Corriger l'Étape 8 (migration unique)

1. **Vue `produits_public`** : ajouter `WHERE visibilite IN ('PARTICULIER','PRO','TOUS') AND disponibilite <> 'NON_DISPONIBLE' AND validation_statut = 'valide' AND archived_at IS NULL AND trashed_at IS NULL`. Filtrer aussi `visibilite = 'PARTICULIER'` seulement pour invité particulier, `'PRO'` seulement pour invité pro.
2. **GRANTs** : `GRANT SELECT ON produits_public TO authenticated`.
3. **Policies `produits`** : recréer toutes en `TO authenticated`, avec `WITH CHECK (owner_id = auth.uid())` sur INSERT/UPDATE. Supprimer les policies `{public}`.
4. **Pas de SELECT direct sur `produits` pour invités** : leurs policies passent uniquement par la vue.
5. Relancer `supabase--linter` et documenter chaque warning restant (fichier, règle, justification, mesure de mitigation).

## Étape 9 — Page « Utilisateurs et accès »

### Base de données

Nouvelle migration :

- **Enum `role_permission`** étendu : ajouter `consulter_stock`, `ajouter_photos`, `modifier_statuts`, `gerer_taches`, `modifier_prix_public`, `modifier_prix_pro`, `voir_factures_vente`, `gerer_ventes`, `importer`, `gerer_utilisateurs`, `consulter_historique`.
- **Enum `app_role`** : ajouter `admin_principal` (unique protégé).
- **Table `user_profiles_admin`** : `user_id`, `nom`, `statut_compte` (`actif|suspendu|desactive|en_attente`), `date_invitation`, `derniere_connexion`, `date_expiration`, `cree_par`, `modifie_par`.
- **Table `user_invitations`** : `id`, `email`, `nom`, `role`, `permissions[]`, `date_expiration`, `message`, `token`, `invite_par`, `accepted_at`, `revoked_at`.
- **Table `admin_audit_log`** : `id`, `acteur_id`, `cible_id`, `action` (`invitation|acceptation|role_change|perm_change|suspension|revocation|reactivation|pro_validation`), `ancienne_valeur jsonb`, `nouvelle_valeur jsonb`, `created_at`.
- **Table `invite_pro_validations`** : `user_id`, `statut` (`en_attente|valide|refuse|suspendu`), `valide_par`, `valide_le`, `motif`.
- **Trigger** : empêcher la suppression/rétrogradation du dernier `admin_principal` actif.
- **Trigger** : refuser toute écriture sur `user_roles` en dehors des server functions autorisées (garde-fou en plus des RLS).
- **RLS** : `user_profiles_admin`, `user_invitations`, `admin_audit_log`, `invite_pro_validations` — SELECT/UPDATE réservés aux users avec `gerer_utilisateurs` OU rôle `admin`/`admin_principal`.

### Server functions (`src/lib/admin-users.functions.ts`)

Tous avec `requireSupabaseAuth` + double check `has_permission(userId, 'gerer_utilisateurs')` OR `has_role(userId, 'admin_principal')`. `supabaseAdmin` importé dynamiquement dans le handler.

- `listUsers()` — join `auth.users` + `profiles` + `user_roles` + `user_permissions` + `user_profiles_admin`.
- `inviteUser({ email, nom, role, permissions, date_expiration, message })` — appelle `auth.admin.inviteUserByEmail`, insère l'invitation, log l'audit. **Rejette explicitement `role = 'admin_principal'`.**
- `updateUserRole({ userId, role })` — refuse si `role = admin_principal` sauf appelant est admin_principal ; refuse si tentative de retirer le dernier admin_principal ; log l'audit.
- `updateUserPermissions({ userId, add[], remove[] })` — log ancien/nouveau.
- `suspendUser({ userId })` / `reactivateUser({ userId })` / `revokeUser({ userId })` — met à jour `statut_compte`, révoque les sessions via `auth.admin.signOut(userId, 'global')`.
- `resendInvitation({ invitationId })` / `expireInvitation({ invitationId })`.
- `validateInvitePro({ userId, decision, motif })` — passe le statut de `invite_pro_validations`, ajoute/retire le rôle `invite_pro`, log.

### Interface

- `src/routes/_authenticated/_admin/route.tsx` — layout pathless gate qui redirige si l'user n'a pas `gerer_utilisateurs`.
- `src/routes/_authenticated/_admin/utilisateurs.tsx` — page principale.
- Tableau responsive (cartes empilées <768px) : nom, email, rôle, statut, permissions (badges), invité le, dernière connexion, expire le, créé/modifié par.
- Filtres : rôle, statut, avec/sans accès financier, invité pro en attente.
- Dialog « Inviter » — formulaire (zod : email valide, nom, rôle sans admin_principal, permissions multi-select, expiration optionnelle, message optionnel).
- Dialog « Modifier accès » — édition rôle + permissions granulaires.
- Section « Invités pro en attente » — approuver / refuser avec motif.
- Bouton « Suspendre / Réactiver / Révoquer » avec confirmation.
- Confirmation renforcée (saisie du texte `TRANSFERER` + email) pour toute modification touchant `admin_principal`.
- `src/routes/_authenticated/_admin/audit.tsx` — journal filtrable par acteur, cible, action, période. Export CSV/XLSX (réutiliser `export-historique.ts`).

### Ajout AppShell

- Onglet « Admin » (icône Shield) visible seulement si `has('gerer_utilisateurs')` ou `isAdmin`. Sous-menu : Utilisateurs, Audit.

### Tests (Playwright headless, sandbox uniquement)

Créer 8 comptes de test **avec préfixe `test-vv-`** (jamais tes comptes) :

- `test-vv-admin@…`, `test-vv-collab-nofin@…`, `test-vv-collab-fin@…`, `test-vv-part@…`, `test-vv-pro-pending@…`, `test-vv-pro-valide@…`, `test-vv-suspendu@…`, `test-vv-invit-expiree@…`.

Pour chacun, vérifier :

1. Colonnes visibles dans la fiche produit (matrice attendue par rôle).
2. Champs éditables (visibilité, tarifs, prix d'achat) selon permissions.
3. Accès direct à `/produit/<uuid>` d'un produit privé → 404 pour les invités.
4. Tentative UPDATE `user_roles` via console → refus RLS.
5. Tentative d'appel server fn admin sans permission → 401/403.
6. Suspension → sessions révoquées, redirection `/auth`.
7. Invitation expirée → refus d'acceptation.
8. Screenshot de chaque écran de la page Utilisateurs sur mobile/tablette/desktop.

Script sous `/tmp/browser/vv-rbac/run.py`. Nettoyage automatique des 8 comptes en fin de run.

### Livrable

- 1 migration (correctifs Étape 8 + tables Étape 9).
- Server functions admin.
- Pages `/utilisateurs` et `/audit` sous gate `_admin`.
- Rapport de tests Playwright avec matrice de permissions vérifiée.
- Mise à jour `mem://` pour tracer les décisions (rôles, gates, tables).
