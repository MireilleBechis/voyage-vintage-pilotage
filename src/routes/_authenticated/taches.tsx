import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ACTION_LABEL, type TypeAction, type Produit } from "@/lib/produits";
import { dateFr } from "@/lib/format";
import { CheckCircle2, Circle, PlayCircle, XCircle, Plus } from "lucide-react";
import { toast } from "sonner";

export type StatutTache = "a_faire" | "en_cours" | "fait" | "annule";

export interface Tache {
  id: string;
  produit_id: string | null;
  titre: string;
  type_action: TypeAction;
  priorite: number;
  justification_priorite: string | null;
  duree_estimee_min: number | null;
  date_limite: string | null;
  statut: StatutTache;
  notes: string | null;
  date_completion: string | null;
  created_at: string;
}

export const Route = createFileRoute("/_authenticated/taches")({
  head: () => ({
    meta: [
      { title: "Tâches — Voyage Vintage" },
      { name: "description", content: "Toutes les tâches à faire sur le stock vintage." },
    ],
  }),
  component: Taches,
});

const FILTRES = [
  { key: "a_faire", label: "À faire" },
  { key: "en_cours", label: "En cours" },
  { key: "fait", label: "Faites" },
] as const;

function Taches() {
  const qc = useQueryClient();
  const [filtre, setFiltre] = useState<(typeof FILTRES)[number]["key"]>("a_faire");

  const tachesQ = useQuery({
    queryKey: ["taches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("taches")
        .select("*")
        .order("priorite", { ascending: true })
        .order("date_limite", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as unknown as Tache[];
    },
  });

  const produitsQ = useQuery({
    queryKey: ["produits"],
    queryFn: async () => {
      const { data, error } = await supabase.from("produits").select("id, identifiant, designer_ou_marque, modele");
      if (error) throw error;
      return (data ?? []) as unknown as Pick<Produit, "id" | "identifiant" | "designer_ou_marque" | "modele">[];
    },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: StatutTache }) => {
      const patch: Partial<Tache> = { statut };
      if (statut === "fait" || statut === "annule") patch.date_completion = new Date().toISOString();
      else patch.date_completion = null;
      const { error } = await supabase.from("taches").update(patch as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["taches"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const produitsMap = new Map((produitsQ.data ?? []).map((p) => [p.id, p]));
  const taches = (tachesQ.data ?? []).filter((t) => t.statut === filtre);

  const compteurs = {
    a_faire: (tachesQ.data ?? []).filter((t) => t.statut === "a_faire").length,
    en_cours: (tachesQ.data ?? []).filter((t) => t.statut === "en_cours").length,
    fait: (tachesQ.data ?? []).filter((t) => t.statut === "fait").length,
  };

  return (
    <div className="container-app py-6 space-y-4">
      <header>
        <h1 className="font-serif text-3xl text-primary">Tâches</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {compteurs.a_faire} à faire · {compteurs.en_cours} en cours · {compteurs.fait} faites
        </p>
      </header>

      <div className="flex gap-1 border-b">
        {FILTRES.map((f) => (
          <button key={f.key} onClick={() => setFiltre(f.key)}
            className={`px-3 py-2 text-sm border-b-2 -mb-px ${
              filtre === f.key ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground"
            }`}>
            {f.label} <span className="text-xs">({compteurs[f.key]})</span>
          </button>
        ))}
      </div>

      {taches.length === 0 ? (
        <p className="text-sm text-muted-foreground italic text-center py-8">
          Aucune tâche {filtre === "a_faire" ? "à faire" : filtre === "en_cours" ? "en cours" : "faite"}.
        </p>
      ) : (
        <div className="space-y-2">
          {taches.map((t) => (
            <TacheItem key={t.id} t={t} produit={t.produit_id ? produitsMap.get(t.produit_id) : undefined}
              onStatut={(s) => updateMut.mutate({ id: t.id, statut: s })} />
          ))}
        </div>
      )}
    </div>
  );
}

function TacheItem({
  t, produit, onStatut,
}: {
  t: Tache;
  produit: Pick<Produit, "id" | "identifiant" | "designer_ou_marque" | "modele"> | undefined;
  onStatut: (s: StatutTache) => void;
}) {
  const enRetard = t.date_limite && new Date(t.date_limite) < new Date() && t.statut !== "fait";
  return (
    <div className="border rounded-lg bg-card p-3">
      <div className="flex items-start gap-2">
        <button onClick={() => onStatut(t.statut === "fait" ? "a_faire" : "fait")}
          className="mt-0.5 shrink-0 text-primary">
          {t.statut === "fait" ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-widest text-brass">{ACTION_LABEL[t.type_action]}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded border bg-secondary text-secondary-foreground">
              P{t.priorite}
            </span>
            {enRetard && (
              <span className="text-[10px] px-1.5 py-0.5 rounded border border-destructive/40 bg-destructive/10 text-destructive">
                En retard
              </span>
            )}
          </div>
          <p className={`text-sm mt-1 ${t.statut === "fait" ? "line-through text-muted-foreground" : ""}`}>
            {t.titre}
          </p>
          {produit && (
            <Link to="/produit/$id" params={{ id: produit.id }}
              className="text-xs text-primary mt-1 inline-block">
              {produit.identifiant} — {produit.designer_ou_marque ?? "—"}{produit.modele ? ` · ${produit.modele}` : ""}
            </Link>
          )}
          {t.date_limite && (
            <p className="text-[11px] text-muted-foreground mt-0.5">Limite : {dateFr(t.date_limite)}</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {t.statut === "a_faire" && (
            <button onClick={() => onStatut("en_cours")} title="Commencer"
              className="p-1 text-muted-foreground hover:text-primary">
              <PlayCircle className="w-4 h-4" />
            </button>
          )}
          {t.statut !== "annule" && t.statut !== "fait" && (
            <button onClick={() => onStatut("annule")} title="Annuler"
              className="p-1 text-muted-foreground hover:text-destructive">
              <XCircle className="w-4 h-4" />
            </button>
          )}
          {(t.statut === "fait" || t.statut === "annule") && (
            <button onClick={() => onStatut("a_faire")} title="Réactiver"
              className="p-1 text-muted-foreground hover:text-primary">
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
