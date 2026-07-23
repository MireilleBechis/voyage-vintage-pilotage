import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { supprimerDefinitivement } from "@/lib/produit-actions";
import type { Produit } from "@/lib/produits";
import { eur } from "@/lib/format";
import { AlertTriangle } from "lucide-react";

export function DeleteDialog({
  produit, onClose, onDone,
}: {
  produit: Produit; onClose: () => void; onDone: () => void;
}) {
  const [saisi, setSaisi] = useState("");
  const qc = useQueryClient();
  const tachesQ = useQuery({
    queryKey: ["taches-count", produit.id],
    queryFn: async () => {
      const { count, error } = await supabase.from("taches")
        .select("*", { count: "exact", head: true }).eq("produit_id", produit.id);
      if (error) return 0;
      return count ?? 0;
    },
  });
  const nbPhotos = produit.photos?.length ?? 0;
  const ok = saisi.trim() === produit.identifiant;
  const mut = useMutation({
    mutationFn: () => supprimerDefinitivement(produit.id),
    onSuccess: () => {
      toast.success("Produit supprimé définitivement.");
      qc.invalidateQueries({ queryKey: ["corbeille"] });
      qc.invalidateQueries({ queryKey: ["produits"] });
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const photo = produit.photos?.[0]?.url;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-4 w-full max-w-md space-y-3 border border-destructive/40"
        onClick={(e) => e.stopPropagation()}>
        <h3 className="font-serif text-lg text-destructive flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Suppression définitive
        </h3>
        <div className="flex gap-3 items-start">
          <div className="w-20 h-20 bg-secondary shrink-0 overflow-hidden rounded">
            {photo && <img src={photo} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="text-xs space-y-0.5">
            <p className="text-brass uppercase tracking-widest text-[10px]">{produit.identifiant}</p>
            <p className="font-medium text-sm">{produit.designer_ou_marque ?? "—"}</p>
            <p className="text-muted-foreground">{produit.modele ?? "—"}</p>
            <p>Achat : {eur(produit.prix_achat)} · Cible : {eur(produit.prix_vente_cible)}</p>
            <p>{nbPhotos} photo{nbPhotos > 1 ? "s" : ""} · {tachesQ.data ?? "…"} tâche{(tachesQ.data ?? 0) > 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="border border-destructive/40 bg-destructive/10 rounded-lg p-3 text-xs text-destructive">
          Cette action est irréversible. Le produit, ses photos, ses tâches et ses informations associées
          seront définitivement supprimés.
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Saisir <span className="font-mono text-foreground">{produit.identifiant}</span> pour confirmer
          </label>
          <input value={saisi} onChange={(e) => setSaisi(e.target.value)}
            placeholder={produit.identifiant}
            className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm font-mono" />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="px-3 py-2 text-sm">Annuler</button>
          <button
            onClick={() => mut.mutate()}
            disabled={!ok || mut.isPending}
            className="px-3 py-2 rounded-md bg-destructive text-destructive-foreground text-sm disabled:opacity-40"
          >
            Supprimer définitivement
          </button>
        </div>
      </div>
    </div>
  );
}
