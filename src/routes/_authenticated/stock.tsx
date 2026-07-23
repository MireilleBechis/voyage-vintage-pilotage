import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CAT_LABEL, CATEGORIES, STATUT_LABEL, STATUTS, type Produit } from "@/lib/produits";
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

function Stock() {
  const [view, setView] = useState<"list" | "cards">("list");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("");
  const [stat, setStat] = useState<string>("");

  const produitsQ = useQuery({
    queryKey: ["produits"],
    queryFn: async () => {
      const { data, error } = await supabase.from("produits").select("*").order("identifiant");
      if (error) throw error;
      return (data ?? []) as unknown as Produit[];
    },
  });

  const filtered = useMemo(() => {
    const list = produitsQ.data ?? [];
    return list.filter((p) => {
      if (cat && p.categorie !== cat) return false;
      if (stat && p.statut !== stat) return false;
      if (q) {
        const s = `${p.identifiant} ${p.designer_ou_marque ?? ""} ${p.modele ?? ""} ${p.editeur_ou_label ?? ""}`.toLowerCase();
        if (!s.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [produitsQ.data, cat, stat, q]);

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
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="text-xs px-2 py-1.5 rounded-md border bg-card">
            <option value="">Toutes catégories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
          </select>
          <select value={stat} onChange={(e) => setStat(e.target.value)} className="text-xs px-2 py-1.5 rounded-md border bg-card">
            <option value="">Tous statuts</option>
            {STATUTS.map((s) => <option key={s} value={s}>{STATUT_LABEL[s]}</option>)}
          </select>
          <div className="ml-auto flex rounded-md border bg-card">
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
