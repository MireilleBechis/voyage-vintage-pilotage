import { Link } from "@tanstack/react-router";
import {
  CAT_LABEL,
  STATUT_LABEL,
  STATUT_COULEUR,
  ACTION_REQUISE_LABEL,
  ACTION_REQUISE_COULEUR,
  type Produit,
  type ActionRequise,
} from "@/lib/produits";
import { eur, anciennete } from "@/lib/format";
import { AlertTriangle, Copy, Lock, Archive } from "lucide-react";
import { ProduitMenu } from "./ProduitMenu";

export function ProduitCard({ p }: { p: Produit }) {
  const photo = p.photos?.[0]?.url;
  const actions = (p.actions_requises ?? []) as ActionRequise[];
  const shown = actions.slice(0, 2);
  const rest = actions.length - shown.length;

  return (
    <div className="border rounded-xl bg-card overflow-hidden flex gap-3 relative">
      <Link
        to="/produit/$id"
        params={{ id: p.id }}
        className="flex-1 flex gap-3 active:scale-[0.99] transition min-w-0"
      >
        <div className="w-24 h-24 bg-secondary flex items-center justify-center shrink-0 relative">
          {photo ? (
            <img src={photo} alt={p.designer_ou_marque ?? ""} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-muted-foreground text-center px-1">
              {CAT_LABEL[p.categorie]}
            </span>
          )}
          {p.photos && p.photos.length > 1 && (
            <span className="absolute bottom-1 right-1 text-[9px] bg-background/80 border rounded px-1">
              {p.photos.length}
            </span>
          )}
        </div>
        <div className="flex-1 py-2 pr-2 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] tracking-widest uppercase text-brass">{p.identifiant}</p>
              <h3 className="font-serif text-lg leading-tight truncate">
                {p.designer_ou_marque ?? "—"}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {p.modele ?? p.type_objet ?? CAT_LABEL[p.categorie]}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {p.archived_at && (
                <Archive className="w-3.5 h-3.5 text-muted-foreground" aria-label="Archivé" />
              )}
              {p.statut_modifie_manuellement && (
                <Lock className="w-3.5 h-3.5 text-muted-foreground" aria-label="Statut verrouillé" />
              )}
              {p.donnees_douteuses && <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
              {p.doublon_groupe && <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
            </div>
          </div>

          <div className="flex items-center justify-between mt-1.5 gap-2">
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded border ${STATUT_COULEUR[p.statut]}`}
            >
              {STATUT_LABEL[p.statut]}
            </span>
            <span className="text-sm font-medium">{eur(p.prix_vente_cible)}</span>
          </div>

          {shown.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {shown.map((a) => (
                <span
                  key={a}
                  className={`text-[9px] px-1.5 py-0.5 rounded border ${ACTION_REQUISE_COULEUR[a]}`}
                >
                  {ACTION_REQUISE_LABEL[a]}
                </span>
              ))}
              {rest > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded border bg-secondary text-secondary-foreground">
                  +{rest}
                </span>
              )}
            </div>
          )}

          <p className="text-[10px] text-muted-foreground mt-1.5">
            En stock depuis {anciennete(p.created_at)}
          </p>
        </div>
      </Link>
      <div className="pr-1 pt-1 shrink-0">
        <ProduitMenu p={p} />
      </div>
    </div>
  );
}
