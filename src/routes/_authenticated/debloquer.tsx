import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Produit, ActionRequise } from "@/lib/produits";
import { ACTION_REQUISE_LABEL, ACTION_REQUISE_COULEUR } from "@/lib/produits";
import { ProduitCard } from "@/components/ProduitCard";
import { eur } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/debloquer")({
  head: () => ({
    meta: [
      { title: "À débloquer — Voyage Vintage" },
      { name: "description", content: "Produits qui attendent une action pour être vendus." },
    ],
  }),
  component: Debloquer,
});

const GROUPES: { titre: string; actions: ActionRequise[] }[] = [
  { titre: "Identification à compléter", actions: ["identification_a_completer"] },
  { titre: "Prix à fixer ou à revoir", actions: ["prix_a_expertiser", "prix_incoherent"] },
  { titre: "État à vérifier", actions: ["etat_a_verifier", "nettoyage_a_verifier", "restauration_a_verifier"] },
  { titre: "Travaux à réaliser", actions: ["a_nettoyer", "a_restaurer"] },
  { titre: "Photos manquantes", actions: ["photos_manquantes"] },
  { titre: "Description manquante", actions: ["description_manquante", "dimensions_manquantes"] },
];

function Debloquer() {
  const q = useQuery({
    queryKey: ["produits"],
    queryFn: async () => {
      const { data, error } = await supabase.from("produits").select("*").is("archived_at", null).is("trashed_at", null).order("cout_total", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Produit[];
    },
  });
  const list = (q.data ?? []).filter((p) => !["VENDU", "ARCHIVE"].includes(p.statut));

  const bloques = list.filter((p) => p.blocage);
  const capitalBloque = list
    .filter((p) => (p.actions_requises?.length ?? 0) > 0)
    .reduce((s, p) => s + Number(p.cout_total ?? 0), 0);

  return (
    <div className="container-app py-6 space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-primary">À débloquer</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {eur(capitalBloque)} immobilisés attendent une action.
        </p>
      </header>

      {bloques.length > 0 && (
        <Section titre="Blocages signalés" items={bloques} tone="destructive" />
      )}

      {GROUPES.map((g) => {
        const items = list.filter((p) => (p.actions_requises ?? []).some((a) => g.actions.includes(a)));
        if (items.length === 0) return null;
        const capital = items.reduce((s, p) => s + Number(p.cout_total ?? 0), 0);
        return (
          <section key={g.titre}>
            <div className="flex items-baseline justify-between border-b pb-1 mb-2">
              <h2 className="font-serif text-lg">
                {g.titre} <span className="text-xs text-muted-foreground">· {items.length}</span>
              </h2>
              <span className="text-[11px] text-muted-foreground">{eur(capital)} immobilisés</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {g.actions.map((a) => (
                <span key={a} className={`text-[10px] px-2 py-0.5 rounded-full border ${ACTION_REQUISE_COULEUR[a]}`}>
                  {ACTION_REQUISE_LABEL[a]}
                </span>
              ))}
            </div>
            <div className="space-y-2">
              {items.slice(0, 20).map((p) => <ProduitCard key={p.id} p={p} />)}
              {items.length > 20 && (
                <Link to="/stock" className="block text-center text-xs text-primary py-2">
                  Voir les {items.length - 20} restants dans Stock →
                </Link>
              )}
            </div>
          </section>
        );
      })}

      {list.every((p) => (p.actions_requises?.length ?? 0) === 0) && bloques.length === 0 && (
        <p className="text-sm text-muted-foreground italic text-center py-8">
          Aucun produit à débloquer. Tout est en ordre.
        </p>
      )}
    </div>
  );
}

function Section({ titre, items, tone }: { titre: string; items: Produit[]; tone?: "destructive" }) {
  return (
    <section>
      <h2 className={`font-serif text-lg border-b pb-1 mb-2 ${tone === "destructive" ? "text-destructive" : ""}`}>
        {titre} <span className="text-xs text-muted-foreground">· {items.length}</span>
      </h2>
      <div className="space-y-2">{items.map((p) => <ProduitCard key={p.id} p={p} />)}</div>
    </section>
  );
}
