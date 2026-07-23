import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  STATUT_LABEL, STATUTS, statutSuivant, type Produit, type Statut, CAT_LABEL,
  STATUT_COULEUR, ETATS_TRAVAUX, ETAT_TRAVAUX_LABEL, type EtatTravaux,
  ACTION_REQUISE_LABEL, ACTION_REQUISE_COULEUR, type ActionRequise,
} from "@/lib/produits";
import { eur, dateFr, anciennete } from "@/lib/format";
import { AlertTriangle, Camera, ChevronLeft, Copy as CopyIcon, CheckCircle2, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/produit/$id")({
  head: () => ({
    meta: [
      { title: "Fiche produit — Voyage Vintage" },
      { name: "description", content: "Détails d'un produit vintage du stock." },
    ],
  }),
  component: Fiche,
});

function Fiche() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const q = useQuery({
    queryKey: ["produit", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("produits").select("*").eq("id", id).single();
      if (error) throw error;
      return data as unknown as Produit;
    },
  });

  const updateMut = useMutation({
    mutationFn: async (patch: Partial<Produit>) => {
      const { error } = await supabase.from("produits").update(patch as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["produit", id] });
      qc.invalidateQueries({ queryKey: ["produits"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const photoMut = useMutation({
    mutationFn: async (file: File) => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user!.id;
      const path = `${uid}/${id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("produit-photos").upload(path, file);
      if (upErr) throw upErr;
      const { data: signed } = await supabase.storage.from("produit-photos").createSignedUrl(path, 60 * 60 * 24 * 365);
      const existing = (q.data?.photos as Array<{ url: string; storage_path: string }>) ?? [];
      const next = [...existing, { url: signed?.signedUrl ?? "", storage_path: path }];
      const { error: updErr } = await supabase.from("produits").update({ photos: next as never }).eq("id", id);
      if (updErr) throw updErr;
    },
    onSuccess: () => {
      toast.success("Photo ajoutée.");
      qc.invalidateQueries({ queryKey: ["produit", id] });
      qc.invalidateQueries({ queryKey: ["produits"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Échec de l'upload"),
  });

  if (q.isLoading) return <div className="container-app py-6 text-muted-foreground">Chargement…</div>;
  if (q.isError || !q.data) return <div className="container-app py-6 text-destructive">Produit introuvable.</div>;

  const p = q.data;
  const doubts = p.donnees_douteuses as Record<string, unknown> | null;
  const next = statutSuivant(p.statut);

  return (
    <div className="pb-8">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="container-app py-3 flex items-center justify-between">
          <button onClick={() => navigate({ to: "/stock" })} className="flex items-center gap-1 text-sm">
            <ChevronLeft className="w-4 h-4" /> Retour
          </button>
          <button onClick={() => setEditing((v) => !v)} className="text-sm text-primary font-medium">
            {editing ? "Terminer" : "Modifier"}
          </button>
        </div>
      </div>

      {/* Photos */}
      <div className="bg-secondary/40">
        {p.photos && p.photos.length > 0 ? (
          <div className="flex overflow-x-auto snap-x">
            {p.photos.map((ph, i) => (
              <img key={i} src={ph.url} alt="" className="snap-start w-full aspect-square object-cover shrink-0" />
            ))}
          </div>
        ) : (
          <div className="aspect-square flex items-center justify-center text-muted-foreground text-xs">
            Aucune photo
          </div>
        )}
      </div>

      <div className="container-app py-4 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-brass">
              {p.identifiant} · {CAT_LABEL[p.categorie]}{p.sous_categorie ? ` · ${p.sous_categorie}` : ""}
            </p>
            <h1 className="font-serif text-3xl leading-tight mt-1">{p.designer_ou_marque ?? "—"}</h1>
            <p className="text-sm text-muted-foreground">
              {[p.editeur_ou_label, p.modele, p.annee].filter(Boolean).join(" · ") || "—"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) photoMut.mutate(f); e.target.value = ""; }}
          />
          <button onClick={() => fileRef.current?.click()} disabled={photoMut.isPending}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground py-2.5 text-sm">
            <Camera className="w-4 h-4" />
            {photoMut.isPending ? "Upload…" : "Ajouter une photo"}
          </button>
          {next && (
            <button
              onClick={() => updateMut.mutate({ statut: next }, {
                onSuccess: () => toast.success(`→ ${STATUT_LABEL[next]}`),
              })}
              className="inline-flex items-center justify-center gap-2 rounded-md border bg-card px-3 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Étape suivante
            </button>
          )}
        </div>

        {/* Alertes */}
        {doubts && Object.keys(doubts).length > 0 && (
          <div className="border border-warning/50 bg-warning/10 rounded-lg p-3">
            <p className="text-xs font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Données douteuses
            </p>
            <ul className="text-xs mt-1.5 list-disc pl-5 text-muted-foreground">
              {Object.entries(doubts).map(([k, v]) => (
                <li key={k}>{k.replace(/_/g, " ")}{typeof v === "string" ? ` — ${v}` : ""}</li>
              ))}
            </ul>
          </div>
        )}
        {p.doublon_groupe && (
          <div className="border rounded-lg p-3 text-xs flex items-center gap-2">
            <CopyIcon className="w-3.5 h-3.5" /> Doublon possible détecté à l'import. À valider.
          </div>
        )}

        {/* Statut */}
        <Field label="Statut" editing={editing}
          value={STATUT_LABEL[p.statut]}
          input={
            <select value={p.statut}
              onChange={(e) => updateMut.mutate({ statut: e.target.value as Statut })}
              className="w-full rounded-md border bg-card px-2 py-1.5 text-sm">
              {STATUTS.map((s) => <option key={s} value={s}>{STATUT_LABEL[s]}</option>)}
            </select>
          }
        />

        <SectionTitle>Finances</SectionTitle>
        <Grid>
          <TextField label="Prix d'achat (€)" editing={editing} type="number"
            value={p.prix_achat} onSave={(v) => updateMut.mutate({ prix_achat: v as number })} display={eur(p.prix_achat)} />
          <TextField label="Travaux (€)" editing={editing} type="number"
            value={p.cout_travaux} onSave={(v) => updateMut.mutate({ cout_travaux: v as number })} display={eur(p.cout_travaux)} />
          <TextField label="Transport (€)" editing={editing} type="number"
            value={p.cout_transport} onSave={(v) => updateMut.mutate({ cout_transport: v as number })} display={eur(p.cout_transport)} />
          <ReadOnly label="Coût total" value={eur(p.cout_total)} />
          <TextField label="Prix cible (€)" editing={editing} type="number"
            value={p.prix_vente_cible} onSave={(v) => updateMut.mutate({ prix_vente_cible: v as number })} display={eur(p.prix_vente_cible)} />
          <TextField label="Prix minimum (€)" editing={editing} type="number"
            value={p.prix_minimum_accepte} onSave={(v) => updateMut.mutate({ prix_minimum_accepte: v as number })} display={eur(p.prix_minimum_accepte)} />
          <ReadOnly label="Marge potentielle" value={eur(p.marge_potentielle)} />
          <TextField label="Prix vendu (€)" editing={editing} type="number"
            value={p.prix_vente_reel} onSave={(v) => updateMut.mutate({ prix_vente_reel: v as number })} display={eur(p.prix_vente_reel)} />
        </Grid>

        <SectionTitle>Identification</SectionTitle>
        <Grid>
          <TextField label="Designer / marque" editing={editing} value={p.designer_ou_marque}
            onSave={(v) => updateMut.mutate({ designer_ou_marque: v as string })} display={p.designer_ou_marque ?? "—"} />
          <TextField label="Éditeur / label" editing={editing} value={p.editeur_ou_label}
            onSave={(v) => updateMut.mutate({ editeur_ou_label: v as string })} display={p.editeur_ou_label ?? "—"} />
          <TextField label="Modèle" editing={editing} value={p.modele}
            onSave={(v) => updateMut.mutate({ modele: v as string })} display={p.modele ?? "—"} />
          <TextField label="Année" editing={editing} value={p.annee}
            onSave={(v) => updateMut.mutate({ annee: v as string })} display={p.annee ?? "—"} />
          <TextField label="Matériaux" editing={editing} value={p.materiaux}
            onSave={(v) => updateMut.mutate({ materiaux: v as string })} display={p.materiaux ?? "—"} />
          <TextField label="Couleur" editing={editing} value={p.couleur}
            onSave={(v) => updateMut.mutate({ couleur: v as string })} display={p.couleur ?? "—"} />
          <TextField label="Dimensions" editing={editing} value={p.dimensions}
            onSave={(v) => updateMut.mutate({ dimensions: v as string })} display={p.dimensions ?? "—"} />
          <TextField label="Poids" editing={editing} value={p.poids}
            onSave={(v) => updateMut.mutate({ poids: v as string })} display={p.poids ?? "—"} />
          <TextField label="État" editing={editing} value={p.etat}
            onSave={(v) => updateMut.mutate({ etat: v as string })} display={p.etat ?? "—"} />
          <TextField label="Emplacement" editing={editing} value={p.emplacement_stockage}
            onSave={(v) => updateMut.mutate({ emplacement_stockage: v as string })} display={p.emplacement_stockage ?? "—"} />
        </Grid>

        <SectionTitle>Pilotage</SectionTitle>
        <Grid>
          <TextField label="Prochaine action" editing={editing} value={p.prochaine_action}
            onSave={(v) => updateMut.mutate({ prochaine_action: v as string })} display={p.prochaine_action ?? "—"} />
          <TextField label="Blocage" editing={editing} value={p.blocage}
            onSave={(v) => updateMut.mutate({ blocage: v as string })} display={p.blocage ?? "—"} />
          <TextField label="Effort (1-5)" editing={editing} type="number" value={p.niveau_effort}
            onSave={(v) => updateMut.mutate({ niveau_effort: v as number })} display={p.niveau_effort?.toString() ?? "—"} />
          <TextField label="Date limite" editing={editing} type="date" value={p.date_limite}
            onSave={(v) => updateMut.mutate({ date_limite: v as string })} display={dateFr(p.date_limite)} />
          <ReadOnly label="En stock depuis" value={p.created_at ? anciennete(p.created_at) : "—"} />
          <TextField label="Canal d'achat" editing={editing} value={p.canal_achat}
            onSave={(v) => updateMut.mutate({ canal_achat: v as string })} display={p.canal_achat ?? "—"} />
          <TextField label="Date d'achat" editing={editing} type="date" value={p.date_achat}
            onSave={(v) => updateMut.mutate({ date_achat: v as string })} display={dateFr(p.date_achat)} />
        </Grid>

        <SectionTitle>Description & notes</SectionTitle>
        <TextAreaField label="Description" editing={editing} value={p.description}
          onSave={(v) => updateMut.mutate({ description: v })} />
        <TextAreaField label="Notes" editing={editing} value={p.notes}
          onSave={(v) => updateMut.mutate({ notes: v })} />
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif text-xl text-primary pt-4 border-b pb-1">{children}</h2>;
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function Field({ label, value, input, editing }: { label: string; value: string; input?: React.ReactNode; editing: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      {editing && input ? input : <p className="text-sm mt-0.5">{value}</p>}
    </div>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-sm mt-0.5 font-medium">{value}</p>
    </div>
  );
}

function TextField({
  label, value, display, editing, onSave, type = "text",
}: {
  label: string; value: string | number | null; display: string; editing: boolean;
  onSave: (v: string | number | null) => void; type?: "text" | "number" | "date";
}) {
  const [local, setLocal] = useState<string>(value == null ? "" : String(value));
  if (!editing) return <ReadOnly label={label} value={display} />;
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        type={type} value={local} onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          const v = local === "" ? null : type === "number" ? Number(local) : local;
          if (String(value ?? "") !== String(v ?? "")) onSave(v);
        }}
        className="mt-0.5 w-full rounded-md border bg-card px-2 py-1.5 text-sm"
      />
    </div>
  );
}

function TextAreaField({ label, value, editing, onSave }: {
  label: string; value: string | null; editing: boolean; onSave: (v: string | null) => void;
}) {
  const [local, setLocal] = useState(value ?? "");
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      {editing ? (
        <textarea value={local} onChange={(e) => setLocal(e.target.value)}
          onBlur={() => { if ((value ?? "") !== local) onSave(local || null); }}
          rows={3} className="mt-1 w-full rounded-md border bg-card px-2 py-1.5 text-sm" />
      ) : (
        <p className="text-sm mt-0.5 whitespace-pre-wrap">{value || "—"}</p>
      )}
    </div>
  );
}
