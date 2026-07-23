import { Link } from "@tanstack/react-router";
import { CAT_LABEL, STATUT_LABEL, type Produit } from "@/lib/produits";
import { eur } from "@/lib/format";
import { AlertTriangle, Copy } from "lucide-react";

export function ProduitCard({ p }: { p: Produit }) {
  const photo = p.photos?.[0]?.url;
  return (
    <Link
      to="/produit/$id" params={{ id: p.id }}
      className="block border rounded-xl bg-card overflow-hidden active:scale-[0.99] transition"
    >
      <div className="flex gap-3">
        <div className="w-24 h-24 bg-secondary flex items-center justify-center shrink-0">
          {photo ? (
            <img src={photo} alt={p.designer_ou_marque ?? ""} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-muted-foreground text-center px-1">
              {CAT_LABEL[p.categorie]}
            </span>
          )}
        </div>
        <div className="flex-1 py-2 pr-3 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] tracking-widest uppercase text-brass">{p.identifiant}</p>
              <h3 className="font-serif text-lg leading-tight truncate">{p.designer_ou_marque ?? "—"}</h3>
              <p className="text-xs text-muted-foreground truncate">{p.modele ?? p.type_objet ?? CAT_LABEL[p.categorie]}</p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {p.donnees_douteuses && <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
              {p.doublon_groupe && <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
            </div>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
              {STATUT_LABEL[p.statut]}
            </span>
            <span className="text-sm font-medium">{eur(p.prix_vente_cible)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
