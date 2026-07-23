import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  CAT_LABEL,
  CATEGORIES,
  STATUT_LABEL,
  STATUTS,
  ACTION_REQUISE_LABEL,
  type Produit,
  type ActionRequise,
} from "@/lib/produits";
import { ProduitCard } from "@/components/ProduitCard";
import { LayoutGrid, List, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/stock")({
  head: () => ({
    meta: [
      { title: "Stock — Voyage Vintage" },
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
  const [stat, setStat] = useState<string>("");
  const [action, setAction] = useState<string>("");
  const [tri, setTri] = useState<Tri>("identifiant");

  const produitsQ = useQuery({
    queryKey: ["produits", audience],
    queryFn: async () => {
      let query = supabase.from("produits").select("*").order("identifiant");
      if (audience === "actifs") {
        query = query.is("archived_at", null).is("trashed_at", null);
      } else if (audience === "archives") {
        query = query.not("archived_at", "is", null).is("trashed_at", null);
      } else {
        query = query.not("trashed_at", "is", null);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as Produit[];
    },
  });

  const filtered = useMemo(() => {
    const list = produitsQ.data ?? [];
    const out = list.filter((p) => {
      if (cat && p.categorie !== cat) return false;
      if (stat && p.statut !== stat) return false;
      if (action && !(p.actions_requises ?? []).includes(action as ActionRequise)) return false;
      if (q) {
        const s = `${p.identifiant} ${p.designer_ou_marque ?? ""} ${p.modele ?? ""} ${p.editeur_ou_label ?? ""}`.toLowerCase();
        if (!s.includes(q.toLowerCase())) return false;
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
  }, [produitsQ.data, cat, stat, action, q, tri]);

  return (
    <div className="container-app py-6">
      <header className="mb-4">
        <h1 className="font-serif text-3xl text-primary">Stock</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {filtered.length} / {produitsQ.data?.length ?? 0} produits
        </p>
      </header>

      <div className="space-y-2 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher (marque, modèle, VV-…)"
            className="w-full pl-9 pr-3 py-2.5 rounded-md border bg-card text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="text-xs px-2 py-1.5 rounded-md border bg-card shrink-0">
            <option value="">Toutes catégories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
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
      ) : view === "list" ? (
        <div className="space-y-2">{filtered.map((p) => <ProduitCard key={p.id} p={p} />)}</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">{filtered.map((p) => <ProduitCard key={p.id} p={p} />)}</div>
      )}
    </div>
  );
}
