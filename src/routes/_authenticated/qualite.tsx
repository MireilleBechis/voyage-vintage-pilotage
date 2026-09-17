import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listProduitsInterne, updateProduit } from "@/lib/produits-api";
import type { Produit } from "@/lib/produits";
import { AlertTriangle, CheckCircle2, Copy as CopyIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/qualite")({
  head: () => ({
    meta: [
      { title: "Qualité des données — La Dolce Vintage" },
      { name: "description", content: "Anomalies, prix absents et doublons possibles à revoir." },
    ],
  }),
  component: Qualite,
});

function Qualite() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["produits"],
    queryFn: async () => {
      const all = await listProduitsInterne();
      return all.filter((p) => !p.archived_at && !p.trashed_at);
    },
  });
  const list = q.data ?? [];

  const douteux = list.filter((p) => p.donnees_douteuses && Object.keys(p.donnees_douteuses).length > 0);

  const groupes: Record<string, Produit[]> = {};
  for (const p of list) {
    if (p.doublon_groupe && !p.doublon_valide) {
      (groupes[p.doublon_groupe] ??= []).push(p);
    }
  }

  const validerMut = useMutation({
    mutationFn: async ({ id, valide }: { id: string; valide: boolean }) => {
      await updateProduit(id, { doublon_valide: valide });
    },
    onSuccess: () => {
      toast.success("Marqué comme vérifié.");
      qc.invalidateQueries({ queryKey: ["produits"] });
    },
  });

  return (
    <div className="container-app py-6 space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-primary">Qualité des données</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {douteux.length} produits avec valeurs douteuses · {Object.keys(groupes).length} groupes de doublons possibles
        </p>
      </header>

      <section>
        <h2 className="font-serif text-lg border-b pb-1 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" /> Valeurs douteuses
        </h2>
        {douteux.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Aucune anomalie.</p>
        ) : (
          <div className="space-y-2">
            {douteux.map((p) => (
              <Link key={p.id} to="/produit/$id" params={{ id: p.id }}
                className="block border rounded-lg bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-brass">{p.identifiant}</p>
                    <p className="font-serif text-base">{p.designer_ou_marque ?? "—"}</p>
                  </div>
                  <div className="text-[11px] text-warning text-right">
                    {Object.keys(p.donnees_douteuses ?? {}).map((k) => (
                      <div key={k}>{k.replace(/_/g, " ")}</div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-serif text-lg border-b pb-1 mb-3 flex items-center gap-2">
          <CopyIcon className="w-4 h-4" /> Doublons possibles
        </h2>
        <p className="text-[11px] text-muted-foreground italic mb-3">
          Aucune fusion automatique. Marquez « ce n'est pas un doublon » ou allez sur la fiche pour agir.
        </p>
        {Object.keys(groupes).length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Aucun groupe à revoir.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupes).map(([key, items]) => (
              <div key={key} className="border rounded-lg bg-card p-3">
                <p className="text-xs text-muted-foreground mb-2">{key.replace("|", " · ")}</p>
                <div className="space-y-1.5">
                  {items.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <Link to="/produit/$id" params={{ id: p.id }} className="flex-1">
                        <span className="text-brass text-[10px] uppercase tracking-widest">{p.identifiant}</span>{" "}
                        {p.designer_ou_marque} — {p.modele ?? "—"}
                      </Link>
                      <button onClick={() => validerMut.mutate({ id: p.id, valide: true })}
                        className="text-[11px] text-primary inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Pas un doublon
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
