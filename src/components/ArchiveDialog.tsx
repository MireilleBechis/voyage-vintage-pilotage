import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { archiverProduit } from "@/lib/produit-actions";
import { MOTIFS_ARCHIVAGE, MOTIF_ARCHIVAGE_LABEL, type MotifArchivage, type Produit } from "@/lib/produits";

export function ArchiveDialog({
  produit, onClose, onDone,
}: {
  produit: Produit; onClose: () => void; onDone: () => void;
}) {
  const [motif, setMotif] = useState<MotifArchivage>("retire_vente");
  const mut = useMutation({
    mutationFn: () => archiverProduit(produit.id, motif),
    onSuccess: () => { toast.success(`${produit.identifiant} archivé.`); onDone(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-4 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-serif text-lg">Archiver {produit.identifiant}</h3>
        <p className="text-xs text-muted-foreground">
          Le produit sera masqué du stock actif mais conservé. Il pourra être restauré à tout moment.
        </p>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Motif</label>
          <select value={motif} onChange={(e) => setMotif(e.target.value as MotifArchivage)}
            className="w-full rounded-md border bg-background px-2 py-2 text-sm">
            {MOTIFS_ARCHIVAGE.map((m) => (
              <option key={m} value={m}>{MOTIF_ARCHIVAGE_LABEL[m]}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-3 py-2 text-sm">Annuler</button>
          <button onClick={() => mut.mutate()} disabled={mut.isPending}
            className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-60">
            Archiver
          </button>
        </div>
      </div>
    </div>
  );
}
