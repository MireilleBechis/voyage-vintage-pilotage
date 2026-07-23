## Étape 1 — Analyse des 137 produits existants

Voici l'impact prévu **si** j'applique les nouvelles règles de statut. Rien n'est encore modifié en base.

### Répartition des nouveaux statuts principaux

| Nouveau statut | Nombre | Règle |
|---|---:|---|
| À identifier | **24** | marque OU modèle manquant |
| À expertiser | **13** | marque + modèle OK, mais prix de vente cible absent ou = 0 |
| À photographier | **100** | identifiés + prix connu, mais aucune photo |
| Prêt à publier | **0** | aucun ne remplit tous les critères aujourd'hui |

Total : 137 (les 100 restants basculent sur « À photographier » car ils ont marque+modèle+prix mais 0 photo et 0 description ; « À rédiger » viendra après les photos).

### Actions requises (badges cumulables)

| Action | Nombre |
|---|---:|
| Identification à compléter | 24 |
| Prix à expertiser | 13 |
| État à vérifier (nettoyage + restauration = À vérifier) | 137 |
| Photos manquantes | 137 |
| Description manquante | 137 |
| Prix incohérent (< 10 €) | 1 |

### Anomalies détectées

- **23** produits en groupe de doublon potentiel — **conservés**, seulement signalés (peuvent être plusieurs exemplaires du même modèle achetés séparément).
- **29** produits avec `donnees_douteuses` déjà flaggées à l'import.
- **1** produit avec un prix de vente cible suspect (< 10 €).
- **0** photo et **0** description sur l'ensemble du stock — normal, rien n'a encore été saisi manuellement.

### Ce qui ne change pas
- Les 137 identifiants VV-0001 → VV-0137 restent identiques.
- Aucune ligne n'est supprimée, aucun champ existant écrasé (prix d'achat, coûts, marque, modèle, notes…).
- Aucune fusion de doublon.

---

## Ce que la migration Étape 2 fera (après ta validation)

Ajout de colonnes sur `produits` (non destructif) :
- `nettoyage` : `a_verifier | necessaire | non_necessaire | termine` (défaut `a_verifier`)
- `restauration` : `a_verifier | necessaire | non_necessaire | terminee` (défaut `a_verifier`)
- `actions_requises` : liste de badges (recalculée)
- `titre_commercial` : texte
- `statut_origine` : `automatique | manuel`
- `statut_modifie_manuellement` : booléen
- `statut_calcule_le` : horodatage
- Extension de l'enum `statut_produit` avec `ETAT_A_VERIFIER`

Extension de la table `taches` : types `expertiser_prix`, `verifier_etat`, `mesurer`, `tester`, `emballer`, `relancer` + champ `justification_priorite` (existe déjà).

Fonction SQL `recalculer_statut_produit(produit)` qui applique le parcours (À identifier → À expertiser → État à vérifier → À nettoyer → À restaurer → À photographier → À rédiger → Prêt à publier) **en respectant `statut_modifie_manuellement = true`**.

Recalcul initial sur les 137 produits + création automatique de :
- 13 tâches « Rechercher et valider le prix de vente de … »
- 137 tâches « Examiner l'état général du produit »

---

## Étapes suivantes (après validation de l'étape 2)

3. Cartes Stock enrichies (photo, VV, marque/modèle, statut coloré, badges actions, achat/vente cible/marge, prochaine action ; menu ⋯ ; garder liste/grille).
4. Fiche produit complète (7 sections : Identification, Description, État & préparation, Photos, Finances, Vente, Tâches) + modale « Vendu » obligatoire (prix réel + date).
5. Filtres/tris/recherche étendus sur Stock.
6. Pages « Aujourd'hui » (5 priorités max, nouvel ordre), « À débloquer » (compteurs), Tableau de bord (KPI + graphiques répartition).
7. Recette sur ≥ 10 produits représentatifs, résumé + demande de validation en fin de chaque étape.

**Design conservé** : palette crème/bordeaux/laiton, typographie serif, cartes arrondies, sobriété actuelle. Seule la couleur des badges de statut est ajoutée (teintes douces).

---

## Détails techniques

- Migration Postgres unique et idempotente : `ALTER TYPE statut_produit ADD VALUE IF NOT EXISTS 'ETAT_A_VERIFIER'`, `ALTER TABLE produits ADD COLUMN IF NOT EXISTS …`, fonction `recalculer_statut_produit`, puis `UPDATE produits SET statut = recalculer_statut_produit(produits.*)` **filtré sur `statut_modifie_manuellement IS NOT TRUE`**.
- Création des tâches via `INSERT … SELECT … WHERE NOT EXISTS` (idempotent).
- Les nouvelles règles vivent aussi côté client dans `src/lib/produits.ts` (fonction pure `calculerStatut(p)`) pour rester cohérentes avec la fonction SQL et permettre l'aperçu avant application.
- Aucun secret, aucun edge function, aucune réimportation Excel.

**Confirme-tu que je peux lancer la migration de l'Étape 2 avec ces chiffres ?**
