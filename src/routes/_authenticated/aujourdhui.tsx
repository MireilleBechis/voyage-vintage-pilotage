import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calculerPriorites } from "@/lib/priorite";
import { STATUT_LABEL, statutSuivant, type Produit } from "@/lib/produits";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { CheckCircle2, Sparkles, Upload } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { importInitialStock } from "@/lib/import.functions";

export const Route = createFileRoute("/_authenticated/aujourdhui")({
  head: () => ({
    meta: [
      { title: "Aujourd'hui — Voyage Vintage" },
      { name: "description", content: "Priorités du jour pour piloter le stock vintage." },
    ],
  }),
  component: Aujourdhui,
});

function Aujourdhui() {
  const qc = useQueryClient();
  const importFn = useServerFn(importInitialStock);

  const produitsQ = useQuery({
    queryKey: ["produits"],
    queryFn: async () => {
      const { data, error } = await supabase.from("produits").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Produit[];
    },
  });

  const importMut = useMutation({
    mutationFn: async () => importFn(),
    onSuccess: (r) => {
      toast.success(`Import : ${r.inserted} produits ajoutés (${r.skipped} déjà présents).`);
      qc.invalidateQueries({ queryKey: ["produits"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur d'import"),
  });

  const completeMut = useMutation({
    mutationFn: async (p: Produit) => {
      const next = statutSuivant(p.statut);
      if (!next) throw new Error("Aucune étape suivante.");
      const { error } = await supabase.from("produits").update({ statut: next }).eq("id", p.id);
      if (error) throw error;
      return next;
    },
    onSuccess: (next) => {
      toast.success(`Statut avancé vers « ${STATUT_LABEL[next]} ».`);
      qc.invalidateQueries({ queryKey: ["produits"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const produits = produitsQ.data ?? [];
  const priorites = calculerPriorites(produits);
  const today = new Date();

  if (produitsQ.isLoading) return <div className="container-app py-6 text-muted-foreground">Chargement…</div>;

  if (produits.length === 0) {
    return (
      <div className="container-app py-10">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-brass">Voyage Vintage</p>
          <h1 className="font-serif text-4xl text-primary mt-2">Aujourd'hui</h1>
        </header>
        <div className="border rounded-xl bg-card p-6 text-center">
          <Sparkles className="w-8 h-8 mx-auto text-brass" />
          <h2 className="font-serif text-2xl mt-3">Importer le stock initial</h2>
          <p className="text-sm text-muted-foreground mt-2">
            137 produits détectés dans le fichier Excel. Prêts à être importés (les valeurs douteuses seront signalées, les doublons possibles marqués).
          </p>
          <button
            onClick={() => importMut.mutate()} disabled={importMut.isPending}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2.5 disabled:opacity-60"
          >
            <Upload className="w-4 h-4" />
            {importMut.isPending ? "Import en cours…" : "Importer les 137 produits"}
          </button>
        </div>
      </div>
    );
  }

  const enStock = produits.filter((p) => !["VENDU", "ARCHIVE"].includes(p.statut));
  const aDebloquer = enStock.filter((p) => (p.actions_requises?.length ?? 0) > 0).length;
  const pretsAPublier = enStock.filter((p) => p.statut === "PRET_A_PUBLIER").length;
  const enLigne = enStock.filter((p) => p.statut === "EN_LIGNE" || p.statut === "RESERVE").length;
  const margePot = enStock.reduce((s, p) => s + Number(p.marge_potentielle ?? 0), 0);

  return (
    <div className="container-app py-6">
      <header className="mb-5">
        <p className="text-xs uppercase tracking-[0.3em] text-brass">
          {today.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="font-serif text-4xl text-primary mt-1">Aujourd'hui</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {priorites.length} priorité{priorites.length > 1 ? "s" : ""} · {enStock.length} produits en stock
        </p>
      </header>

      <div className="grid grid-cols-4 gap-2 mb-6">
        <MiniKPI label="À débloquer" value={aDebloquer} to="/debloquer" tone="warning" />
        <MiniKPI label="Prêts" value={pretsAPublier} to="/stock" tone="primary" />
        <MiniKPI label="En ligne" value={enLigne} to="/stock" />
        <MiniKPI label="Marge pot." value={margePot > 0 ? `${Math.round(margePot / 1000)}k` : "—"} to="/finances" />
      </div>

      {priorites.length === 0 ? (
        <div className="border rounded-xl bg-card p-6 text-center text-muted-foreground">
          Rien d'urgent aujourd'hui. Bravo.
        </div>
      ) : (
        <div className="space-y-3">
          {priorites.map((it, idx) => (
            <article key={it.produit.id} className="border rounded-xl bg-card overflow-hidden">
              <Link
                to="/produit/$id" params={{ id: it.produit.id }}
                className="block p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <p className="text-[10px] tracking-widest uppercase text-brass">{it.produit.identifiant}</p>
                    </div>
                    <h3 className="font-serif text-xl mt-2 leading-tight">{it.produit.designer_ou_marque ?? "—"}</h3>
                    <p className="text-xs text-muted-foreground">{it.produit.modele ?? it.produit.type_objet ?? "—"}</p>
                    <p className="text-sm mt-2 italic text-primary">« {it.raison} »</p>
                  </div>
                </div>
              </Link>
              <div className="border-t px-4 py-2.5 flex items-center justify-between bg-secondary/30">
                <span className="text-xs text-muted-foreground">{it.action_suggeree}</span>
                <button
                  onClick={() => completeMut.mutate(it.produit)}
                  disabled={completeMut.isPending}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary"
                >
                  <CheckCircle2 className="w-4 h-4" /> Marquer terminé
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
