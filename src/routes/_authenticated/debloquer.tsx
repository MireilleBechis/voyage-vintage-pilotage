import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Produit } from "@/lib/produits";
import { ProduitCard } from "@/components/ProduitCard";

export const Route = createFileRoute("/_authenticated/debloquer")({
  head: () => ({
    meta: [
      { title: "À débloquer — Voyage Vintage" },
      { name: "description", content: "Produits sans prix, sans photo ou bloqués." },
    ],
  }),
  component: Debloquer,
});

function Debloquer() {
  const q = useQuery({
    queryKey: ["produits"],
    queryFn: async () => {
      const { data, error } = await supabase.from("produits").select("*").order("cout_total", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Produit[];
    },
  });
  const list = q.data ?? [];
  const sansPrix = list.filter((p) => !p.prix_vente_cible);
  const sansPhoto = list.filter((p) => !p.photos || p.photos.length === 0);
  const sansDesigner = list.filter((p) => !p.designer_ou_marque);
  const bloques = list.filter((p) => p.blocage);

  return (
    <div className="container-app py-6 space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-primary">À débloquer</h1>
        <p className="text-xs text-muted-foreground mt-1">Ce qui empêche de vendre.</p>
      </header>

      <Section title="Prix de vente manquant" count={sansPrix.length} items={sansPrix.slice(0, 30)} />
      <Section title="Sans aucune photo" count={sansPhoto.length} items={sansPhoto.slice(0, 30)} />
      <Section title="Designer / marque manquant" count={sansDesigner.length} items={sansDesigner.slice(0, 30)} />
      <Section title="Blocages signalés" count={bloques.length} items={bloques} />
    </div>
  );
}

function Section({ title, count, items }: { title: string; count: number; items: Produit[] }) {
  return (
    <section>
      <h2 className="font-serif text-lg mb-2 border-b pb-1">{title} <span className="text-xs text-muted-foreground">· {count}</span></h2>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">Rien à débloquer ici.</p>
      ) : (
        <div className="space-y-2">{items.map((p) => <ProduitCard key={p.id} p={p} />)}</div>
      )}
    </section>
  );
}
