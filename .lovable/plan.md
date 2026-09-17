# Audit lecture seule — La Dolce Vintage

Aucune modification effectuée. Constats vérifiés par lecture des migrations, de la définition réelle des vues en base et du code front.

## 1. Vue `produits_public` — colonnes sensibles : CONFORME

La définition réelle en base ne contient **aucune** colonne financière interne : pas de `prix_achat`, `cout_travaux`, `cout_transport`, `cout_total`, `marge_potentielle`, `prix_minimum_accepte`, `prix_minimum_interne`, `notes`, `owner_id`, `import_original`.
Elle expose uniquement : identité produit, photos, `prix_public_ttc`, `prix_pro_ht` (conditionné au rôle pro/interne), TVA, dates. Filtre `WHERE` correct par rôle et visibilité, archivés/corbeille exclus. `anon` révoqué.

Sévérité : aucune. Le bug initial est bien corrigé.

## 2. NOUVEAU problème critique : la vue `produits_public` est accessible en écriture

Privilèges réels en base :

```text
produits_public  ->  authenticated = arwdDxtm   (SELECT, INSERT, UPDATE, DELETE, ...)
produits_public  ->  reloptions = security_invoker=off
```

Conséquences :
- La vue est auto-modifiable par Postgres pour toutes ses colonnes simples (`prix_public_ttc`, `description`, `visibilite`, `disponibilite`, `photos`, `titre_commercial`, ...).
- Avec `security_invoker=off`, une écriture s'exécute avec les droits du propriétaire de la vue et **contourne totalement la RLS de `produits`**.
- Un simple `invite_particulier` peut donc, via `PATCH /rest/v1/produits_public` ou `DELETE`, modifier ou supprimer les lignes qu'il voit — alors que tout l'effort de verrouillage porte sur `produits` et les RPC.

Sévérité : **critique**. Le correctif attendu est un `REVOKE INSERT, UPDATE, DELETE ON public.produits_public FROM authenticated` (garder `SELECT`).

À noter : `produits_interne` n'a aucun grant pour `authenticated` — bon, tout passe par les RPC. Aucun accès direct restant à `produits` côté front (seul `import.functions.ts` l'utilise, côté serveur via `supabaseAdmin`).

## 3. Calcul « Argent immobilisé » — BUGGÉ

`src/routes/_authenticated/finances.tsx:38`

```ts
const immobilise = coutStock - sum(vendus.map((p) => p.prix_vente_reel));
```

Problèmes :
- Elle retranche le **chiffre d'affaires des ventes** d'un **coût de stock** : deux grandeurs sans rapport. Le capital immobilisé est simplement le coût total des articles encore en stock, donc déjà égal à `coutStock` (ligne 33).
- Le résultat devient négatif dès que les ventes cumulées dépassent le coût du stock restant, ce qui affiche une valeur absurde.
- Les statuts sont en revanche corrects : `enStock` exclut `VENDU`/`ARCHIVE`, et la liste est déjà filtrée des archivés/corbeille (ligne 23). `RESERVE` est compté en stock, ce qui est défendable mais à confirmer.

Correctif attendu : `immobilise = coutStock`, ou une définition explicite (ex. coût des seuls articles pas encore en ligne) ; dans ce cas, supprimer le doublon avec la KPI « Coût du stock ».

Sévérité : **haute** (chiffre affiché faux sur le tableau de bord).

Effet de bord lié : pour un collaborateur sans permission finance, `cout_total` / `marge_potentielle` reviennent à `null` de la vue, et `sum()` les convertit en `0` — le tableau de bord affiche silencieusement « 0 € » au lieu d'indiquer que la donnée est masquée. Sévérité : moyenne (UX/lisibilité, pas une fuite).

## 4. Autres incohérences relevées

| # | Fichier | Problème | Sévérité |
|---|---------|----------|----------|
| a | `src/lib/produits.ts:307-327` | La liste `PERMISSIONS` ne contient pas les permissions granulaires ajoutées en base : `voir_couts`, `voir_prix_minimum`, `modifier_prix_achat`, `modifier_prix_public`, `modifier_prix_pro`, `modifier_prix_minimum`. L'écran Administration ne peut donc pas les attribuer, alors que les vues et RPC les contrôlent → les collaborateurs restent bloqués sur ces droits. | Haute (fonctionnelle) |
| b | `src/lib/produits.ts:238-246` | `ETATS_TRAVAUX` déclare `en_cours` (inexistant dans les enums `etat_nettoyage` / `etat_restauration`) et utilise `termine` pour la restauration alors que la base attend `terminee`. Un enregistrement avec ces valeurs échoue côté base. | Haute |
| c | `src/lib/produits.ts:157` | `statut_origine: "automatique" \| "manuel" \| "import"` — `import` n'existe pas dans l'enum `origine_statut`. | Faible |
| d | `src/lib/produits.ts:90-99` | `TypeAction` couvre 9 valeurs alors que l'enum `type_action` en compte 16 (`expertiser_prix`, `verifier_etat`, `mesurer`, `tester`, `emballer`, `relancer`, ...) : les libellés retombent sur `undefined` si une tâche utilise ces types. | Moyenne |
| e | `src/lib/produits-api.ts` / `useRole.ts` | Usage massif de `as never` pour contourner les types Supabase non régénérés pour les RPC et `user_permissions` : aucun contrôle de typage sur les payloads envoyés aux fonctions sécurisées. | Moyenne (dette) |
| f | `src/routes/_authenticated/finances.tsx:96` | `STATUT_COULEUR[...].split(" ")[0]` réutilise une classe de badge (`bg-warning/15`) comme couleur de barre : rendu quasi invisible pour plusieurs statuts. | Faible (cosmétique) |

## Synthèse

- Correct : projection de `produits_public` (colonnes + filtre rôle), verrouillage de `produits` et `produits_interne`, absence d'accès direct depuis le navigateur, blocage `anon`.
- Critique : droits d'écriture `authenticated` sur `produits_public` avec `security_invoker=off` → contournement de RLS.
- Haute : « Argent immobilisé » faux ; permissions granulaires absentes du front ; enums travaux désalignés.
- Moyenne/faible : masquage financier rendu en « 0 € », types d'action incomplets, `as never`, couleurs de barres.

Dis-moi si tu veux que je prépare un plan de correction pour tout ou partie de ces points.
