import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { STATUTS, STATUT_LABEL, type Produit } from "@/lib/produits";
import { eur } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/kanban")({
  head: () => ({
    meta: [
      { title: "Kanban — Voyage Vintage" },
      { name: "description", content: "Produits classés par statut dans le pipeline de vente." },
    ],
  }),
  component: Kanban,
});

function Kanban() {
  const q = useQuery({
    queryKey: ["produits"],
    queryFn: async () => {
      const { data, error } = await supabase.from("produits_interne").select("*").is("archived_at", null).is("trashed_at", null).order("created_at");
      if (error) throw error;
      return (data ?? []) as unknown as Produit[];
    },
  });
  const produits = q.data ?? [];

  return (
    <div className="py-6">
      <header className="container-app mb-4">
        <h1 className="font-serif text-3xl text-primary">Kanban</h1>
        <p className="text-xs text-muted-foreground mt-1">Faites glisser latéralement pour voir toutes les étapes.</p>
      </header>

      <div className="overflow-x-auto snap-x">
        <div className="flex gap-3 px-4 pb-6 min-w-min">
          {STATUTS.map((s) => {
            const items = produits.filter((p) => p.statut === s);
            const valeur = items.reduce((sum, p) => sum + Number(p.prix_vente_cible ?? 0), 0);
            return (
              <section key={s} className="snap-start shrink-0 w-64 bg-secondary/40 rounded-xl p-2.5">
                <header className="flex items-baseline justify-between px-1 mb-2">
                  <h2 className="text-sm font-medium">{STATUT_LABEL[s]}</h2>
                  <span className="text-[10px] text-muted-foreground">{items.length} · {eur(valeur)}</span>
                </header>
                <div className="space-y-1.5">
                  {items.map((p) => (
                    <Link key={p.id} to="/produit/$id" params={{ id: p.id }}
                      className="block bg-card border rounded-md p-2">
                      <p className="text-[10px] uppercase tracking-widest text-brass">{p.identifiant}</p>
                      <p className="text-sm font-serif leading-tight">{p.designer_ou_marque ?? "—"}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{p.modele ?? "—"}</p>
                      <p className="text-xs mt-1">{eur(p.prix_vente_cible)}</p>
                    </Link>
                  ))}
                  {items.length === 0 && (
                    <p className="text-[11px] text-muted-foreground italic text-center py-4">vide</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
