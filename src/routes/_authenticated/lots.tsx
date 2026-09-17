import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Search, X } from "lucide-react";
import {
  listLots,
  createLot,
  majLot,
  produitsDuLot,
  ajouterProduitAuLot,
  retirerProduitDuLot,
  LOT_STATUT_LABEL,
  type Lot,
} from "@/lib/lots";
import { listProduitsInterne } from "@/lib/produits-api";
import { STATUT_LABEL } from "@/lib/produits";
import { normaliser } from "@/lib/referentiels";
import { eur } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/lots")({
  head: () => ({
    meta: [
      { title: "Lots — La Dolce Vintage" },
      { name: "description", content: "Regrouper des produits vintage en lots vendables." },
    ],
  }),
  component: Lots,
});

function Lots() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [ouvert, setOuvert] = useState<string | null>(null);

  const lotsQ = useQuery({ queryKey: ["lots"], queryFn: listLots });

  const creerMut = useMutation({
    mutationFn: () => createLot(nouveau.trim()),
    onSuccess: (id) => {
      setNouveau("");
      setOuvert(id);
      toast.success("Lot créé");
      qc.invalidateQueries({ queryKey: ["lots"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtres = useMemo(() => {
    const r = normaliser(q.trim());
    return (lotsQ.data ?? []).filter(
      (l) => !l.trashed_at && (!r || normaliser(`${l.identifiant} ${l.libelle} ${l.description ?? ""}`).includes(r)),
    );
  }, [lotsQ.data, q]);

  return (
    <div className="container-app py-6 space-y-4">
      <header>
        <h1 className="font-serif text-3xl text-primary">Lots</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Chaque produit garde son identifiant, son prix et reste vendable séparément.
        </p>
      </header>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un lot"
          className="w-full pl-9 pr-3 py-2.5 rounded-md border bg-card text-sm" />
      </div>

      <div className="flex gap-2">
        <input value={nouveau} onChange={(e) => setNouveau(e.target.value)} placeholder="Nom du nouveau lot"
          className="flex-1 rounded-md border bg-card px-3 py-2 text-sm" />
        <button onClick={() => creerMut.mutate()} disabled={!nouveau.trim() || creerMut.isPending}
          className="inline-flex items-center gap-1 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm disabled:opacity-50">
          <Plus className="w-4 h-4" /> Créer
        </button>
      </div>

      {lotsQ.isLoading ? (
        <p className="text-muted-foreground">Chargement…</p>
      ) : filtres.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Aucun lot pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {filtres.map((l) => (
            <LotCard key={l.id} lot={l} ouvert={ouvert === l.id} onToggle={() => setOuvert(ouvert === l.id ? null : l.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function LotCard({ lot, ouvert, onToggle }: { lot: Lot; ouvert: boolean; onToggle: () => void }) {
  const qc = useQueryClient();
  const [negocie, setNegocie] = useState(lot.prix_lot_negocie?.toString() ?? "");
  const [rech, setRech] = useState("");

  const produitsQ = useQuery({ queryKey: ["produits", "lots"], queryFn: listProduitsInterne, enabled: ouvert });
  const membresQ = useQuery({ queryKey: ["lot_produits", lot.id], queryFn: () => produitsDuLot(lot.id), enabled: ouvert });

  const membres = new Set(membresQ.data ?? []);
  const tous = (produitsQ.data ?? []).filter((p) => !p.archived_at && !p.trashed_at);
  const dansLot = tous.filter((p) => membres.has(p.id));
  const r = normaliser(rech.trim());
  const candidats = r
    ? tous
        .filter((p) => !membres.has(p.id) && !p.lot_id)
        .filter((p) => normaliser(`${p.identifiant} ${p.designer_ou_marque ?? ""} ${p.modele ?? ""}`).includes(r))
        .slice(0, 8)
    : [];

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["lot_produits", lot.id] });
    qc.invalidateQueries({ queryKey: ["lots"] });
    qc.invalidateQueries({ queryKey: ["produits"] });
  };

  const ajout = useMutation({
    mutationFn: (produitId: string) => ajouterProduitAuLot(lot.id, produitId),
    onSuccess: () => { setRech(""); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const retrait = useMutation({
    mutationFn: (produitId: string) => retirerProduitDuLot(lot.id, produitId),
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });
  const prixMut = useMutation({
    mutationFn: () => majLot(lot.id, { prix_lot_negocie: negocie.trim() === "" ? null : Number(negocie.replace(",", ".")) }),
    onSuccess: () => { toast.success("Prix du lot enregistré"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const calcule = lot.prix_calcule ?? 0;
  const neg = lot.prix_lot_negocie;
  const ecart = neg != null ? neg - calcule : null;
  const ecartPct = ecart != null && calcule > 0 ? (ecart / calcule) * 100 : null;

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <button onClick={onToggle} className="w-full text-left p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] tracking-widest uppercase text-brass">{lot.identifiant}</p>
            <h3 className="font-serif text-xl leading-tight truncate">{lot.libelle}</h3>
            <p className="text-xs text-muted-foreground">
              {lot.nb_produits ?? 0} produit(s) · {LOT_STATUT_LABEL[lot.statut_calcule ?? ""] ?? lot.statut_calcule}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm">{eur(calcule)}</p>
            {neg != null && <p className="text-xs text-primary">{eur(neg)}</p>}
          </div>
        </div>
      </button>

      {ouvert && (
        <div className="border-t p-3 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border p-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Somme des prix cibles</p>
              <p className="text-lg">{eur(calcule)}</p>
            </div>
            <div className="rounded-md border p-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Prix négocié du lot</p>
              <div className="flex gap-1 mt-1">
                <input type="number" value={negocie} onChange={(e) => setNegocie(e.target.value)}
                  className="w-full rounded-md border bg-background px-2 py-1 text-sm" placeholder="—" />
                <button onClick={() => prixMut.mutate()} className="text-xs rounded-md bg-primary text-primary-foreground px-2">OK</button>
              </div>
            </div>
          </div>
          {ecart != null && (
            <p className={`text-xs ${ecart < 0 ? "text-destructive" : "text-primary"}`}>
              Écart : {eur(ecart)}{ecartPct != null ? ` (${ecartPct.toFixed(1)} %)` : ""}
            </p>
          )}

          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Produits du lot</p>
            <div className="space-y-1.5">
              {dansLot.length === 0 && <p className="text-xs text-muted-foreground">Aucun produit.</p>}
              {dansLot.map((p) => (
                <div key={p.id} className="flex items-center gap-2 rounded-md border px-2 py-1.5">
                  <Link to="/produit/$id" params={{ id: p.id }} className="flex-1 min-w-0">
                    <span className="text-[10px] font-mono text-brass">{p.identifiant}</span>{" "}
                    <span className="text-sm">{p.designer_ou_marque ?? "—"} {p.modele ?? ""}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {STATUT_LABEL[p.statut]} · {eur(p.prix_vente_cible)}
                    </span>
                  </Link>
                  <button onClick={() => retrait.mutate(p.id)} className="p-1 text-muted-foreground" aria-label="Retirer du lot">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Ajouter un produit</p>
            <input value={rech} onChange={(e) => setRech(e.target.value)} placeholder="Rechercher (DV-…, marque, modèle)"
              className="w-full rounded-md border bg-background px-2 py-2 text-sm" />
            {candidats.length > 0 && (
              <div className="mt-1.5 space-y-1">
                {candidats.map((p) => (
                  <button key={p.id} onClick={() => ajout.mutate(p.id)}
                    className="w-full text-left rounded-md border px-2 py-1.5 text-sm">
                    <span className="text-[10px] font-mono text-brass">{p.identifiant}</span>{" "}
                    {p.designer_ou_marque ?? "—"} {p.modele ?? ""}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
