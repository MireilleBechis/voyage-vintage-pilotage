import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { Produit } from "@/lib/produits";
import { restaurerCorbeille } from "@/lib/produit-actions";
import { DeleteDialog } from "@/components/DeleteDialog";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { dateFr } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/corbeille")({
  head: () => ({
    meta: [
      { title: "Corbeille — Voyage Vintage" },
      { name: "description", content: "Produits mis à la corbeille, restauration ou suppression définitive." },
    ],
  }),
  component: Corbeille,
});

function Corbeille() {
  const qc = useQueryClient();
  const isAdmin = useIsAdmin();
  const [toDelete, setToDelete] = useState<Produit | null>(null);

  const q = useQuery({
    queryKey: ["corbeille"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produits_interne")
        .select("*")
        .not("trashed_at", "is", null)
        .order("trashed_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Produit[];
    },
  });

  const restoreMut = useMutation({
    mutationFn: (id: string) => restaurerCorbeille(id),
    onSuccess: () => {
      toast.success("Produit restauré.");
      qc.invalidateQueries({ queryKey: ["corbeille"] });
      qc.invalidateQueries({ queryKey: ["produits"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const list = q.data ?? [];

  return (
    <div className="container-app py-6">
      <header className="mb-4">
        <h1 className="font-serif text-3xl text-primary">Corbeille</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {list.length} produit{list.length > 1 ? "s" : ""} · aucune suppression automatique
        </p>
      </header>

      {q.isLoading ? (
        <p className="text-muted-foreground">Chargement…</p>
      ) : list.length === 0 ? (
        <p className="text-muted-foreground text-sm italic">La corbeille est vide.</p>
      ) : (
        <div className="space-y-2">
          {list.map((p) => (
            <div key={p.id} className="border rounded-lg p-3 bg-card">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-secondary shrink-0 overflow-hidden rounded">
                  {p.photos?.[0]?.url && <img src={p.photos[0].url} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] tracking-widest uppercase text-brass">{p.identifiant}</p>
                  <p className="font-serif text-base truncate">{p.designer_ou_marque ?? "—"}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.modele ?? "—"}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Corbeille le {dateFr(p.trashed_at)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => restoreMut.mutate(p.id)}
                  disabled={restoreMut.isPending}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border bg-background py-2 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restaurer
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setToDelete(p)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-destructive text-destructive py-2 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Supprimer définitivement
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {toDelete && (
        <DeleteDialog
          produit={toDelete}
          onClose={() => setToDelete(null)}
          onDone={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
