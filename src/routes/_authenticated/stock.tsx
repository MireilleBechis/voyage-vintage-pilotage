import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listProduitsInterne } from "@/lib/produits-api";
import {
  STATUT_LABEL,
  STATUTS,
  ACTION_REQUISE_LABEL,
  type Produit,
  type ActionRequise,
} from "@/lib/produits";
import {
  listCategories,
  listSousCategories,
  listTypesObjet,
  listMatieres,
  normaliser,
} from "@/lib/referentiels";
import { ProduitCard } from "@/components/ProduitCard";
import { LayoutGrid, List, Plus, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/stock")({
  head: () => ({
    meta: [
      { title: "Stock — La Dolce Vintage" },
      { name: "description", content: "Liste complète du stock vintage avec filtres." },
    ],
  }),
  component: Stock,
});

type Tri = "identifiant" | "anciennete" | "prix_desc" | "prix_asc" | "statut";

const TRIS: Array<{ key: Tri; label: string }> = [
  { key: "identifiant", label: "Identifiant" },
  { key: "anciennete", label: "Plus ancien" },
  { key: "prix_desc", label: "Prix ↓" },
  { key: "prix_asc", label: "Prix ↑" },
  { key: "statut", label: "Statut" },
];

const ACTIONS_FILTRABLES: ActionRequise[] = [
  "identification_a_completer",
  "prix_a_expertiser",
  "prix_incoherent",
  "etat_a_verifier",
  "nettoyage_a_verifier",
  "restauration_a_verifier",
  "a_nettoyer",
  "a_restaurer",
  "photos_manquantes",
  "description_manquante",
  "dimensions_manquantes",
];

type Audience = "actifs" | "archives" | "corbeille";

function Stock() {
  const [view, setView] = useState<"list" | "cards">("list");
  const [audience, setAudience] = useState<Audience>("actifs");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("");
  const [sousCat, setSousCat] = useState<string>("");
  const [typeObjet, setTypeObjet] = useState<string>("");
  const [matiere, setMatiere] = useState<string>("");
  const [stat, setStat] = useState<string>("");
  const [action, setAction] = useState<string>("");
  const [tri, setTri] = useState<Tri>("identifiant");

  const categoriesQ = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const sousCategoriesQ = useQuery({ queryKey: ["sous_categories"], queryFn: listSousCategories });
  const typesQ = useQuery({ queryKey: ["types_objet"], queryFn: listTypesObjet });
  const matieresQ = useQuery({ queryKey: ["matieres"], queryFn: listMatieres });

  const produitsQ = useQuery({
    queryKey: ["produits", audience],
    queryFn: async () => {
      const all = await listProduitsInterne();
      const filtered = all.filter((p) => {
        if (audience === "actifs") return !p.archived_at && !p.trashed_at;
        if (audience === "archives") return !!p.archived_at && !p.trashed_at;
        return !!p.trashed_at;
      });
      return filtered.sort((a, b) => a.identifiant.localeCompare(b.identifiant));
    },
  });

  const sousCategoriesVisibles = (sousCategoriesQ.data ?? []).filter(
    (sc) => !cat || sc.categorie_id === cat,
  );

  const filtered = useMemo(() => {
    const list = produitsQ.data ?? [];
    const recherche = normaliser(q.trim());
    const out = list.filter((p) => {
      if (cat && !(p.categorie_ids ?? []).includes(cat)) return false;
      if (sousCat && !(p.sous_categorie_ids ?? []).includes(sousCat)) return false;
      if (typeObjet && !(p.type_objet_ids ?? []).includes(typeObjet)) return false;
      if (matiere && !(p.matieres ?? []).some((m) => m.matiere_id === matiere)) return false;
      if (stat && p.statut !== stat) return false;
      if (action && !(p.actions_requises ?? []).includes(action as ActionRequise)) return false;
      if (recherche) {
        const champs = [
          p.identifiant,
          p.titre_commercial,
          p.designer_ou_marque,
          p.editeur_ou_label,
          p.modele,
          p.description,
          ...(p.categories_libelles ?? []),
          ...(p.sous_categories_libelles ?? []),
          ...(p.types_libelles ?? []),
          ...(p.matieres ?? []).map((m) => m.libelle),
        ]
          .filter(Boolean)
          .join(" ");
        if (!normaliser(champs).includes(recherche)) return false;
      }
      return true;
    });
    const cmp = (a: Produit, b: Produit) => {
      switch (tri) {
        case "anciennete":
          return (a.created_at ?? "").localeCompare(b.created_at ?? "");
        case "prix_desc":
          return (b.prix_vente_cible ?? 0) - (a.prix_vente_cible ?? 0);
        case "prix_asc":
          return (a.prix_vente_cible ?? 0) - (b.prix_vente_cible ?? 0);
        case "statut":
          return STATUTS.indexOf(a.statut) - STATUTS.indexOf(b.statut);
        default:
          return a.identifiant.localeCompare(b.identifiant);
      }
    };
    return [...out].sort(cmp);
  }, [produitsQ.data, cat, sousCat, typeObjet, matiere, stat, action, q, tri]);

  return (
    <div className="container-app py-6">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-primary">Stock</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {filtered.length} / {produitsQ.data?.length ?? 0} produits
          </p>
        </div>
        <Link
          to="/produit/nouveau"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Nouveau produit
        </Link>
      </header>

      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher (marque, modèle, catégorie, matière, DV-…)"
            className="w-full pl-9 pr-3 py-2.5 rounded-md border bg-card text-sm"
          />
        </div>
        <div className="flex gap-1 rounded-md border bg-card p-0.5 text-xs">
          {(["actifs","archives","corbeille"] as Audience[]).map((a) => (
            <button key={a} onClick={() => setAudience(a)}
              className={`px-2 py-1 rounded ${audience === a ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
              {a === "actifs" ? "Actifs" : a === "archives" ? "Archivés" : "Corbeille"}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <select
            value={cat}
            onChange={(e) => { setCat(e.target.value); setSousCat(""); }}
            className="text-xs px-2 py-1.5 rounded-md border bg-card shrink-0"
          >
            <option value="">Toutes catégories</option>
            {(categoriesQ.data ?? []).filter((c) => c.actif).map((c) => (
              <option key={c.id} value={c.id}>{c.libelle}</option>
            ))}
          </select>
          <select value={sousCat} onChange={(e) => setSousCat(e.target.value)} className="text-xs px-2 py-1.5 rounded-md border bg-card shrink-0">
            <option value="">Toutes sous-catégories</option>
            {sousCategoriesVisibles.filter((sc) => sc.actif).map((sc) => (
              <option key={sc.id} value={sc.id}>{sc.libelle}</option>
            ))}
          </select>
          <select value={typeObjet} onChange={(e) => setTypeObjet(e.target.value)} className="text-xs px-2 py-1.5 rounded-md border bg-card shrink-0">
            <option value="">Tous types</option>
            {(typesQ.data ?? []).filter((t) => t.actif).map((t) => (
              <option key={t.id} value={t.id}>{t.libelle}</option>
            ))}
          </select>
          <select value={matiere} onChange={(e) => setMatiere(e.target.value)} className="text-xs px-2 py-1.5 rounded-md border bg-card shrink-0">
            <option value="">Toutes matières</option>
            {(matieresQ.data ?? []).filter((m) => m.actif).map((m) => (
              <option key={m.id} value={m.id}>{m.parent_id ? "— " : ""}{m.libelle}</option>
            ))}
          </select>
          <select value={stat} onChange={(e) => setStat(e.target.value)} className="text-xs px-2 py-1.5 rounded-md border bg-card shrink-0">
            <option value="">Tous statuts</option>
            {STATUTS.map((s) => <option key={s} value={s}>{STATUT_LABEL[s]}</option>)}
          </select>
          <select value={action} onChange={(e) => setAction(e.target.value)} className="text-xs px-2 py-1.5 rounded-md border bg-card shrink-0">
            <option value="">Toutes actions</option>
            {ACTIONS_FILTRABLES.map((a) => <option key={a} value={a}>{ACTION_REQUISE_LABEL[a]}</option>)}
          </select>
          <select value={tri} onChange={(e) => setTri(e.target.value as Tri)} className="text-xs px-2 py-1.5 rounded-md border bg-card shrink-0">
            {TRIS.map((t) => <option key={t.key} value={t.key}>Tri : {t.label}</option>)}
          </select>
          <div className="ml-auto flex rounded-md border bg-card shrink-0">
            <button onClick={() => setView("list")} className={`p-1.5 ${view === "list" ? "bg-primary text-primary-foreground" : ""}`}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setView("cards")} className={`p-1.5 ${view === "cards" ? "bg-primary text-primary-foreground" : ""}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {produitsQ.isLoading ? (
        <p className="text-muted-foreground">Chargement…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">Aucun produit ne correspond.</p>
          <Link to="/produit/nouveau" className="mt-4 inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-2 text-sm">
            <Plus className="w-4 h-4" /> Créer un produit
          </Link>
        </div>
      ) : view === "list" ? (
        <div className="space-y-2">{filtered.map((p) => <ProduitCard key={p.id} p={p} />)}</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">{filtered.map((p) => <ProduitCard key={p.id} p={p} />)}</div>
      )}
    </div>
  );
}
