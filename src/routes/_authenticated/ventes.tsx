import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listProduitsInterne } from "@/lib/produits-api";
import type { Produit, Statut } from "@/lib/produits";
import { ProduitCard } from "@/components/ProduitCard";

const TABS: { key: Statut; label: string }[] = [
  { key: "EN_LIGNE", label: "En ligne" },
  { key: "RESERVE", label: "Réservé" },
  { key: "VENDU", label: "Vendu" },
];

export const Route = createFileRoute("/_authenticated/ventes")({
  head: () => ({
    meta: [
      { title: "Ventes — La Dolce Vintage" },
      { name: "description", content: "Objets en ligne, réservés et vendus." },
    ],
  }),
  component: Ventes,
});

function Ventes() {
  const [tab, setTab] = useState<Statut>("EN_LIGNE");
  const q = useQuery({
    queryKey: ["produits"],
    queryFn: async () => {
      const all = await listProduitsInterne();
      return all
        .filter((p) => !p.trashed_at)
        .sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""));
    },
  });
  const list = (q.data ?? []).filter((p) => p.statut === tab);

  return (
    <div className="container-app py-6">
      <header className="mb-4">
        <h1 className="font-serif text-3xl text-primary">Ventes</h1>
      </header>

      <div className="flex gap-1 bg-secondary/50 p-1 rounded-lg mb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 text-xs rounded-md ${tab === t.key ? "bg-primary text-primary-foreground" : ""}`}
          >
            {t.label} ({(q.data ?? []).filter((p) => p.statut === t.key).length})
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">Aucun produit dans cette catégorie.</p>
      ) : (
        <div className="space-y-2">{list.map((p) => <ProduitCard key={p.id} p={p} />)}</div>
      )}
    </div>
  );
}
