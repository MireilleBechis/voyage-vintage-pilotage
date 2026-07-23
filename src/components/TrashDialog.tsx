import { useIsAdmin } from "@/hooks/useIsAdmin";
import type { Produit } from "@/lib/produits";
import { AlertTriangle } from "lucide-react";

export function TrashDialog({
  produit, onClose, onDone, onArchiverInstead,
}: {
  produit: Produit;
  onClose: () => void;
  onDone: () => void | Promise<void>;
  onArchiverInstead: () => void;
}) {
  const isAdmin = useIsAdmin();
  const estVendu = produit.prix_vente_reel != null || produit.statut === "VENDU";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-4 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-serif text-lg">Mettre à la corbeille</h3>

        {estVendu ? (
          <div className="border border-warning/50 bg-warning/10 rounded-lg p-3 text-xs space-y-2">
            <p className="flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" /> Ce produit contient des informations de vente
            </p>
            <p className="text-muted-foreground">
              Elles sont utilisées dans les statistiques financières. Il est recommandé de l'archiver plutôt
              que de le supprimer.
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Le produit sera masqué du stock, des priorités et des calculs financiers. Vous pourrez le
            restaurer depuis la corbeille.
          </p>
        )}

        <div className="flex flex-col gap-2 pt-2">
          <button onClick={onClose} className="w-full py-2 rounded-md border text-sm">
            Annuler
          </button>
          <button onClick={onArchiverInstead}
            className="w-full py-2 rounded-md bg-primary text-primary-foreground text-sm">
            Archiver plutôt
          </button>
          {(!estVendu || isAdmin) && (
            <button onClick={() => onDone()}
              className="w-full py-2 rounded-md border border-destructive text-destructive text-sm">
              {estVendu ? "Continuer vers la corbeille (admin)" : "Mettre à la corbeille"}
            </button>
          )}
          {estVendu && !isAdmin && (
            <p className="text-[10px] text-muted-foreground text-center">
              Seul un administrateur peut envoyer un produit vendu à la corbeille.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
