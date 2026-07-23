
# Voyage Vintage – Pilotage · Plan

Application web privée, mobile-first, en français, mono-utilisatrice. Backend Lovable Cloud (auth email/mot de passe, base Postgres, stockage photos). Aucune connexion Shopify/Leboncoin dans cette v1 — seuls les champs sont préparés.

---

## 1. Analyse du fichier Excel

Fichier : `hifi_stock_1_version_3.xlsx`, 8 feuilles.

**Objets réels détectés** (après filtrage des titres, sous-catégories, lignes vides, lignes de totaux) :

| Feuille | Objets réels | Lignes brutes | Colonne-clé |
|---|---|---|---|
| enceintes | 87 | 1066 | `marque` |
| chaises | 13 | 991 | `DESIGNER` |
| fauteuils | 6 | 976 | `DESIGNER` |
| tables | 13 | 997 | `DESIGNER` (sous-catégories : dining / basses) |
| meubles | 5 | 986 | `DESIGNER` (sous-catégorie : enfilade) |
| canape | 3 | 991 | `DESIGNER` |
| luminaires | 10 | 998 | `DESIGNER` |
| TOTAL | — | (agrégat) | ignorée |

**Total à importer : 137 objets** dans une seule table `produits`.

### Anomalies détectées (à signaler, pas à corriger)
- **19 lignes** avec `prix d'achat` nul ou à 0 → marquées `donnees_douteuses.prix_achat_manquant`.
- **Années incohérentes** : ex. `197` (chaise Finn Juhl), `82` (Niels Vodder), `"1950'S"` texte → conservées telles quelles, drapeau `annee_suspecte`.
- **~14 groupes de doublons potentiels** (même marque/designer + même modèle) — importés tous, badge « doublon possible » sur la fiche, écran « Qualité des données » pour valider/ignorer.
- **Feuille enceintes** utilise `marque` au lieu de `DESIGNER` et n'a pas les colonnes `edition/label`, `année`, `canal achat` → champs laissés vides, `source_feuille = "enceintes"` conservée.
- Colonnes `coût total`, `marge idéale`, `marge réelle` du fichier sont **recalculées** dans l'app à partir des composants ; les valeurs originales sont conservées dans `import_original` (JSON) pour audit.
- Colonne `VENDU` du fichier n'est jamais renseignée → aucun objet n'est marqué vendu à l'import ; statut initial = `A_IDENTIFIER`.

### Identifiants
- Format `VV-0001` … `VV-0137`, attribués par ordre de feuille puis d'apparition, stables (colonne `identifiant` unique).

---

## 2. Structure de la base (Lovable Cloud)

### Table `produits`
Tous les champs demandés, plus les champs de traçabilité import :

Identité : `id` (uuid), `identifiant` (VV-0001, unique), `categorie` (enum), `sous_categorie` (texte), `designer_ou_marque`, `editeur_ou_label`, `modele`, `annee` (texte, préserve `"1950'S"`), `description`, `materiaux`, `couleur`, `etat` (enum), `dimensions`, `poids`, `emplacement_stockage`.

Achat : `canal_achat`, `date_achat`, `prix_achat` (numeric €), `cout_travaux`, `cout_transport`, `cout_total` (colonne générée = achat + travaux + transport).

Vente : `prix_vente_cible`, `prix_minimum_accepte`, `prix_vente_reel`, `marge_potentielle` (générée = cible − total), `marge_reelle` (générée, non-nulle uniquement si `statut = VENDU` et `prix_vente_reel` renseigné), `date_vente`.

Pilotage : `statut` (enum, ci-dessous), `prochaine_action` (texte), `blocage` (texte), `niveau_effort` (1-5), `date_limite`, `date_creation` (auto), `anciennete_stock_jours` (calculée), `notes`.

Média & docs : `photos` (jsonb array de {url, storage_path, ordre}), `documents_authenticite` (jsonb array), `liens_annonces` (jsonb array de {plateforme, url}), `plateformes_publication` (text[]).

Import & qualité : `source_feuille`, `source_ligne`, `import_original` (jsonb : ligne brute), `donnees_douteuses` (jsonb : flags), `doublon_possible_de` (uuid nullable).

**Enum `statut_produit`** : `A_IDENTIFIER`, `A_EXPERTISER`, `A_NETTOYER`, `A_RESTAURER`, `A_PHOTOGRAPHIER`, `A_REDIGER`, `PRET_A_PUBLIER`, `EN_LIGNE`, `RESERVE`, `VENDU`, `ARCHIVE`.

**Enum `categorie_produit`** : `enceintes`, `chaises`, `fauteuils`, `tables`, `meubles`, `canapes`, `luminaires`, `autre`.

### Table `taches`
`id`, `titre`, `produit_id` (FK), `type_action` (enum : `nettoyage`, `restauration`, `photo`, `redaction`, `publication`, `livraison`, `expertise`, `autre`), `priorite` (1-5), `justification_priorite`, `duree_estimee_min`, `date_limite`, `statut` (`a_faire`, `en_cours`, `fait`, `annule`), `notes`, `date_creation`, `date_completion`.

### Table `profiles`
Profil utilisateur unique (nom, préférences), lié à `auth.users`. RLS stricte : chaque utilisateur ne voit que ses propres produits/tâches.

### Storage
- Bucket privé `produit-photos` — RLS : lecture/écriture seulement par le propriétaire.
- Bucket privé `produit-documents` pour certificats d'authenticité.

### Sécurité
- RLS activée partout, policies scopées à `auth.uid()`.
- Aucune modification automatique de `prix_vente_*` : les triggers ne touchent que `cout_total`, `marge_potentielle`, `marge_reelle`, `anciennete_stock_jours`.

---

## 3. Logique « Aujourd'hui » (5 priorités max)

Score de priorité, ordre décroissant :

1. **Engagement urgent** : `statut ∈ {RESERVE, VENDU}` avec `date_limite ≤ +3j` ou `prochaine_action` renseignée → « Réservé : livraison à organiser ».
2. **Prêt à publier + forte marge** : `statut = PRET_A_PUBLIER` trié par `marge_potentielle` desc → « Marge potentielle élevée : 850 € ».
3. **Fort capital immobilisé débloquable** : `cout_total ≥ seuil` (top quartile) ET `statut ∈ {A_PHOTOGRAPHIER, A_REDIGER, PRET_A_PUBLIER}` → « 1 200 € immobilisés — il ne manque que les photos ».
4. **Information manquante** : `prix_vente_cible` null OU 0 photo OU `designer_ou_marque` vide → « Prix de vente non renseigné ».
5. **Travaux moins urgents** : `statut ∈ {A_NETTOYER, A_RESTAURER}` trié par `niveau_effort` asc puis `marge_potentielle` desc.

Chaque carte affiche : titre, produit, justification textuelle claire, bouton **« Marquer l'action comme terminée »** qui :
- marque la tâche `fait`,
- fait avancer le `statut` du produit dans le parcours (A_IDENTIFIER → A_EXPERTISER → A_NETTOYER → A_RESTAURER → A_PHOTOGRAPHIER → A_REDIGER → PRET_A_PUBLIER → EN_LIGNE),
- propose automatiquement la tâche suivante correspondante.

---

## 4. Écrans (mobile-first)

1. **Auth** — connexion email/mot de passe.
2. **Aujourd'hui** — 5 cartes de priorité + barre de progression du jour (tâches faites / prévues).
3. **Stock** — bascule liste ↔ cartes photo ; filtres : catégorie, designer, statut, marge, prix, emplacement, plateforme ; recherche plein texte.
4. **Kanban** — colonnes = statuts ; drag horizontal sur mobile ; compteur & valeur par colonne.
5. **Fiche produit** — toutes les infos, galerie photos (bouton **« Ajouter une photo »** utilisant l'appareil photo), tâches liées, historique statuts, badge « doublon possible » si applicable, section « données douteuses ».
6. **À débloquer** — produits sans prix / sans photo / sans designer / avec `blocage` renseigné.
7. **Finances** — coût total du stock, ventes potentielles (Σ `prix_vente_cible`), marges potentielles, ventes réalisées, argent immobilisé (coût − recettes), graphes par catégorie et par statut.
8. **Ventes** — sous-onglets En ligne / Réservé / Vendu, avec marges réelles.
9. **Qualité des données** — anomalies, prix absents, valeurs suspectes, groupes de doublons possibles (bouton « Ce n'est pas un doublon » / « Fusionner » — jamais automatique).

Bandeau global : total objets, valeur immobilisée, alertes du jour.

Format : € FR (`1 250 €`), dates `dd/MM/yyyy`, fuseau `Europe/Paris`.

---

## 5. Pile technique

- **Frontend** : TanStack Start + React + Tailwind, shadcn/ui personnalisé, design mobile-first, palette sobre (fond crème, accent bordeaux/laiton — cohérent avec l'univers vintage).
- **Backend** : Lovable Cloud (Postgres + Auth + Storage).
- **Import Excel** : script d'import unique lançable depuis l'écran « Qualité des données » (bouton « Importer le stock initial ») pour rejouer si besoin, idempotent grâce à `identifiant` unique.
- **Champs Shopify préparés** (non branchés) : `plateformes_publication` inclut `shopify`, `liens_annonces` accepte `{plateforme: 'shopify', url, external_id}`, colonne future `shopify_product_id` prévue dans le schéma mais laissée vide.

---

## 6. Livrables de la v1

- Base + RLS + storage buckets créés.
- Auth email/mot de passe.
- 137 produits importés avec identifiants VV-0001…VV-0137, données douteuses flaguées, doublons signalés.
- 9 écrans ci-dessus, tous fonctionnels sur mobile.
- Zéro modification automatique de prix. Toutes les alertes sont visibles, toute correction est manuelle.

---

## 7. Points en attente de ta validation

- **Ordre d'import** : je propose d'attribuer VV-0001 aux enceintes (feuille 1), puis chaises, fauteuils, tables, meubles, canapes, luminaires. OK ?
- **Seuil « fort capital immobilisé »** : par défaut = quartile supérieur des `cout_total`. OK ?
- **Parcours automatique** après « Marquer terminé » : ordre proposé ci-dessus. Tu veux qu'on saute certaines étapes (ex. tous les meubles ne passent pas par restauration) ?
- **Design** : je propose une palette crème/bordeaux/laiton, typographie serif titres + sans-serif corps. Tu veux que je te montre 2-3 directions visuelles avant de coder l'UI ?

Une fois validé, je crée le backend, j'importe les 137 produits, puis je construis les écrans dans l'ordre : Auth → Aujourd'hui → Fiche produit → Stock → les autres.
