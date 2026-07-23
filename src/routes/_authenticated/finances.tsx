import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CAT_LABEL, margeReelle, STATUT_LABEL, type Produit } from "@/lib/produits";
import { eur } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/finances")({
  head: () => ({
    meta: [
      { title: "Finances — Voyage Vintage" },
      { name: "description", content: "Coût du stock, ventes potentielles, marges et argent immobilisé." },
    ],
  }),
  component: Finances,
});

function Finances() {
  const q = useQuery({
    queryKey: ["produits"],
    queryFn: async () => {
      const { data, error } = await supabase.from("produits").select("*");
      if (error) throw error;
      return (data ?? []) as unknown as Produit[];
    },
  });
  const list = q.data ?? [];

  const enStock = list.filter((p) => !["VENDU", "ARCHIVE"].includes(p.statut));
  const vendus = list.filter((p) => p.statut === "VENDU");
  const coutStock = sum(enStock.map((p) => p.cout_total));
  const ventesPot = sum(enStock.map((p) => p.prix_vente_cible));
  const margePot = sum(enStock.map((p) => p.marge_potentielle));
  const ventesReal = sum(vendus.map((p) => p.prix_vente_reel));
  const margeReal = sum(vendus.map((p) => margeReelle(p) ?? 0));
  const immobilise = coutStock - sum(vendus.map((p) => p.prix_vente_reel));

  const parCat = groupBy(list, (p) => p.categorie);
  const parStatut = groupBy(enStock, (p) => p.statut);

  return (
    <div className="container-app py-6 space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-primary">Finances</h1>
        <p className="text-xs text-muted-foreground mt-1">{list.length} produits — {enStock.length} en stock, {vendus.length} vendus.</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <KPI label="Coût du stock" value={eur(coutStock)} accent />
        <KPI label="Ventes potentielles" value={eur(ventesPot)} />
        <KPI label="Marge potentielle" value={eur(margePot)} />
        <KPI label="Argent immobilisé" value={eur(immobilise)} />
        <KPI label="Ventes réalisées" value={eur(ventesReal)} />
        <KPI label="Marge réelle" value={eur(margeReal)} />
      </div>

      <section>
        <h2 className="font-serif text-lg border-b pb-1 mb-2">Par catégorie</h2>
        <div className="space-y-1.5">
          {Object.entries(parCat).sort((a, b) => b[1].length - a[1].length).map(([cat, items]) => (
            <Row key={cat} label={CAT_LABEL[cat as keyof typeof CAT_LABEL] ?? cat}
              count={items.length}
              value={sum(items.map((p) => p.cout_total))}
              value2={sum(items.map((p) => p.prix_vente_cible))} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-lg border-b pb-1 mb-2">Par statut (en stock)</h2>
        <div className="space-y-1.5">
          {Object.entries(parStatut).sort((a, b) => b[1].length - a[1].length).map(([s, items]) => (
            <Row key={s} label={STATUT_LABEL[s as keyof typeof STATUT_LABEL] ?? s}
              count={items.length}
              value={sum(items.map((p) => p.cout_total))}
              value2={sum(items.map((p) => p.prix_vente_cible))} />
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 italic">
          Colonnes : coût immobilisé · potentiel de vente
        </p>
      </section>
    </div>
  );
}

function KPI({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${accent ? "bg-primary text-primary-foreground border-primary" : "bg-card"}`}>
      <p className={`text-[10px] uppercase tracking-widest ${accent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{label}</p>
      <p className="font-serif text-2xl mt-1">{value}</p>
    </div>
  );
}

function Row({ label, count, value, value2 }: { label: string; count: number; value: number; value2: number }) {
  return (
    <div className="flex items-center justify-between text-sm border-b pb-1.5">
      <span>{label} <span className="text-xs text-muted-foreground">· {count}</span></span>
      <span className="text-xs text-muted-foreground">{eur(value)} · <span className="text-foreground">{eur(value2)}</span></span>
    </div>
  );
}

function sum(arr: Array<number | null | undefined>): number {
  return arr.reduce((a, b) => a + Number(b ?? 0), 0);
}
function groupBy<T, K extends string>(arr: T[], keyFn: (t: T) => K): Record<K, T[]> {
  const out = {} as Record<K, T[]>;
  for (const it of arr) { const k = keyFn(it); (out[k] ??= []).push(it); }
  return out;
}
