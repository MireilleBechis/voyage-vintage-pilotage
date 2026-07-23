import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CAT_LABEL, margeReelle, STATUT_COULEUR, STATUT_LABEL, type Produit, type Statut } from "@/lib/produits";
import { eur } from "@/lib/format";
import { differenceInDays, parseISO } from "date-fns";

export const Route = createFileRoute("/_authenticated/finances")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — Voyage Vintage" },
      { name: "description", content: "KPI, répartition du stock par catégorie et statut, capital immobilisé et ancienneté." },
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
  const enLigne = enStock.filter((p) => p.statut === "EN_LIGNE").length;
  const prets = enStock.filter((p) => p.statut === "PRET_A_PUBLIER").length;

  const coutStock = sum(enStock.map((p) => p.cout_total));
  const ventesPot = sum(enStock.map((p) => p.prix_vente_cible));
  const margePot = sum(enStock.map((p) => p.marge_potentielle));
  const ventesReal = sum(vendus.map((p) => p.prix_vente_reel));
  const margeReal = sum(vendus.map((p) => margeReelle(p) ?? 0));
  const immobilise = coutStock - sum(vendus.map((p) => p.prix_vente_reel));
  const rotation = enStock.length > 0 && coutStock > 0
    ? Math.round((margePot / coutStock) * 100)
    : 0;

  const parCat = groupBy(enStock, (p) => p.categorie);
  const parStatut = groupBy(enStock, (p) => p.statut);

  // Ancienneté en stock (jours depuis date_achat, fallback created_at)
  const buckets = { "0-30": 0, "31-90": 0, "91-180": 0, "180+": 0 } as Record<string, number>;
  const bucketsCapital = { "0-30": 0, "31-90": 0, "91-180": 0, "180+": 0 } as Record<string, number>;
  const now = new Date();
  for (const p of enStock) {
    const src = p.date_achat ?? p.created_at;
    if (!src) continue;
    const d = typeof src === "string" ? parseISO(src) : src;
    const days = differenceInDays(now, d);
    const k = days <= 30 ? "0-30" : days <= 90 ? "31-90" : days <= 180 ? "91-180" : "180+";
    buckets[k]++;
    bucketsCapital[k] += Number(p.cout_total ?? 0);
  }

  const topImmobilise = [...enStock]
    .sort((a, b) => Number(b.cout_total ?? 0) - Number(a.cout_total ?? 0))
    .slice(0, 5);

  return (
    <div className="container-app py-6 space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-primary">Tableau de bord</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {list.length} produits — {enStock.length} en stock · {enLigne} en ligne · {prets} prêts · {vendus.length} vendus.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <KPI label="Coût du stock" value={eur(coutStock)} accent />
        <KPI label="Argent immobilisé" value={eur(immobilise)} />
        <KPI label="Ventes potentielles" value={eur(ventesPot)} />
        <KPI label="Marge potentielle" value={eur(margePot)} />
        <KPI label="Ventes réalisées" value={eur(ventesReal)} />
        <KPI label="Marge réelle" value={eur(margeReal)} />
      </div>

      <div className="rounded-xl border bg-card p-3">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Rotation potentielle</p>
        <p className="font-serif text-2xl mt-1">{rotation}%</p>
        <p className="text-[11px] text-muted-foreground mt-1">Marge potentielle rapportée au coût du stock.</p>
      </div>

      <section>
        <h2 className="font-serif text-lg border-b pb-1 mb-3">Répartition par statut</h2>
        <BarList
          items={Object.entries(parStatut).map(([s, items]) => ({
            key: s,
            label: STATUT_LABEL[s as Statut] ?? s,
            count: items.length,
            value: sum(items.map((p) => p.cout_total)),
            colorClass: STATUT_COULEUR[s as Statut] ?? "bg-secondary",
          }))}
          total={enStock.length}
        />
      </section>

      <section>
        <h2 className="font-serif text-lg border-b pb-1 mb-3">Répartition par catégorie</h2>
        <BarList
          items={Object.entries(parCat).map(([cat, items]) => ({
            key: cat,
            label: CAT_LABEL[cat as keyof typeof CAT_LABEL] ?? cat,
            count: items.length,
            value: sum(items.map((p) => p.cout_total)),
            colorClass: "bg-primary/70 text-primary-foreground border-primary/40",
          }))}
          total={enStock.length}
        />
      </section>

      <section>
        <h2 className="font-serif text-lg border-b pb-1 mb-3">Ancienneté en stock</h2>
        <div className="space-y-2">
          {(["0-30", "31-90", "91-180", "180+"] as const).map((k) => {
            const pct = enStock.length ? Math.round((buckets[k] / enStock.length) * 100) : 0;
            return (
              <div key={k}>
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span>{k === "180+" ? "Plus de 180 jours" : `${k} jours`} <span className="text-muted-foreground">· {buckets[k]}</span></span>
                  <span className="text-muted-foreground">{eur(bucketsCapital[k])}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full ${k === "180+" ? "bg-destructive" : k === "91-180" ? "bg-warning" : "bg-primary"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-lg border-b pb-1 mb-3">Top capital immobilisé</h2>
        <div className="space-y-1.5">
          {topImmobilise.map((p) => (
            <Link
              key={p.id}
              to="/produit/$id"
              params={{ id: p.id }}
              className="flex items-center justify-between text-sm border-b pb-1.5 hover:bg-secondary/40 px-1 rounded"
            >
              <span className="truncate mr-2">
                <span className="text-brass text-xs mr-1.5">{p.identifiant}</span>
                {p.titre_commercial ?? (`${p.designer_ou_marque ?? ""} ${p.modele ?? ""}`.trim() || "Sans titre")}
              </span>
              <span className="text-xs text-muted-foreground shrink-0">{eur(p.cout_total)}</span>
            </Link>
          ))}
          {topImmobilise.length === 0 && (
            <p className="text-xs text-muted-foreground italic">Aucun produit en stock.</p>
          )}
        </div>
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

function BarList({
  items,
  total,
}: {
  items: Array<{ key: string; label: string; count: number; value: number; colorClass: string }>;
  total: number;
}) {
  const sorted = [...items].sort((a, b) => b.count - a.count);
  return (
    <div className="space-y-2">
      {sorted.map((it) => {
        const pct = total ? Math.round((it.count / total) * 100) : 0;
        return (
          <div key={it.key}>
            <div className="flex items-center justify-between text-xs mb-0.5">
              <span>{it.label} <span className="text-muted-foreground">· {it.count}</span></span>
              <span className="text-muted-foreground">{eur(it.value)}</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div className={it.colorClass.split(" ")[0]} style={{ width: `${pct}%`, height: "100%" }} />
            </div>
          </div>
        );
      })}
      {sorted.length === 0 && <p className="text-xs text-muted-foreground italic">Rien à afficher.</p>}
    </div>
  );
}

function sum(arr: Array<number | string | null | undefined>): number {
  return arr.reduce<number>((a, b) => a + Number(b ?? 0), 0);
}
function groupBy<T, K extends string>(arr: T[], keyFn: (t: T) => K): Record<K, T[]> {
  const out = {} as Record<K, T[]>;
  for (const it of arr) { const k = keyFn(it); (out[k] ??= []).push(it); }
  return out;
}
