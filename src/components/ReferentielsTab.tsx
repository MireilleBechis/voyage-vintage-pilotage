import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  listCategories,
  listSousCategories,
  listTypesObjet,
  listMatieres,
  listCategorieChamps,
  slugify,
  CHAMPS_SPECIFIQUES,
  CHAMP_LABEL_DEFAUT,
  type ChampSpecifique,
} from "@/lib/referentiels";

type Table = "categories" | "sous_categories" | "types_objet" | "matieres";

async function renommer(table: Table, id: string, libelle: string) {
  const patch: Record<string, unknown> = { libelle };
  if (table !== "matieres") patch.slug = slugify(libelle);
  const { error } = await supabase.from(table).update(patch as never).eq("id", id);
  if (error) throw error;
}

async function basculerActif(table: Table, id: string, actif: boolean) {
  const { error } = await supabase.from(table).update({ actif } as never).eq("id", id);
  if (error) throw error;
}

async function deplacer(table: Table, id: string, ordre: number) {
  const { error } = await supabase.from(table).update({ ordre } as never).eq("id", id);
  if (error) throw error;
}

interface Ligne {
  id: string;
  libelle: string;
  ordre: number;
  actif: boolean;
}

function ListeEditable({
  titre,
  table,
  lignes,
  onAjouter,
  indent,
}: {
  titre: string;
  table: Table;
  lignes: Ligne[];
  onAjouter: (libelle: string) => Promise<void>;
  indent?: (l: Ligne) => boolean;
}) {
  const qc = useQueryClient();
  const [nouveau, setNouveau] = useState("");
  const refresh = () => qc.invalidateQueries();

  const action = useMutation({
    mutationFn: async (fn: () => Promise<void>) => fn(),
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="rounded-lg border bg-card p-3 space-y-3">
      <h3 className="font-serif text-xl">{titre}</h3>
      <div className="space-y-1.5">
        {lignes.map((l, i) => (
          <div key={l.id} className={`flex items-center gap-2 rounded-md border px-2 py-1.5 ${indent?.(l) ? "ml-5" : ""}`}>
            <input
              defaultValue={l.libelle}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v && v !== l.libelle) action.mutate(() => renommer(table, l.id, v));
              }}
              className={`flex-1 bg-transparent text-sm outline-none ${l.actif ? "" : "line-through text-muted-foreground"}`}
            />
            <button onClick={() => action.mutate(() => deplacer(table, l.id, Math.max(0, l.ordre - 1)))}
              className="p-1 text-muted-foreground" aria-label="Monter" disabled={i === 0}>
              <ChevronUp className="w-4 h-4" />
            </button>
            <button onClick={() => action.mutate(() => deplacer(table, l.id, l.ordre + 1))}
              className="p-1 text-muted-foreground" aria-label="Descendre">
              <ChevronDown className="w-4 h-4" />
            </button>
            <button onClick={() => action.mutate(() => basculerActif(table, l.id, !l.actif))}
              className="text-[11px] rounded border px-2 py-1">
              {l.actif ? "Désactiver" : "Réactiver"}
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={nouveau} onChange={(e) => setNouveau(e.target.value)} placeholder="Ajouter…"
          className="flex-1 rounded-md border bg-background px-2 py-1.5 text-sm" />
        <button
          onClick={() => {
            const v = nouveau.trim();
            if (!v) return;
            action.mutate(async () => { await onAjouter(v); setNouveau(""); });
          }}
          className="inline-flex items-center gap-1 rounded-md bg-primary text-primary-foreground px-2.5 text-sm"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Une valeur déjà utilisée ne se supprime pas : désactivez-la pour la retirer des menus.
      </p>
    </section>
  );
}

export function ReferentielsTab() {
  const qc = useQueryClient();
  const categoriesQ = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const sousQ = useQuery({ queryKey: ["sous_categories"], queryFn: listSousCategories });
  const typesQ = useQuery({ queryKey: ["types_objet"], queryFn: listTypesObjet });
  const matieresQ = useQuery({ queryKey: ["matieres"], queryFn: listMatieres });
  const champsQ = useQuery({ queryKey: ["categorie_champs"], queryFn: listCategorieChamps });

  const categories = categoriesQ.data ?? [];
  const [catPourSous, setCatPourSous] = useState<string>("");
  const [parentMatiere, setParentMatiere] = useState<string>("");
  const [catChamps, setCatChamps] = useState<string>("");

  const matieres = matieresQ.data ?? [];
  const matieresOrdonnees = matieres
    .filter((m) => !m.parent_id)
    .flatMap((r) => [r, ...matieres.filter((m) => m.parent_id === r.id)]);

  const champsAction = useMutation({
    mutationFn: async (fn: () => Promise<void>) => fn(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categorie_champs"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const champsDeLaCat = (champsQ.data ?? []).filter((c) => c.categorie_id === catChamps);

  return (
    <div className="space-y-4">
      <ListeEditable
        titre="Catégories"
        table="categories"
        lignes={categories}
        onAjouter={async (libelle) => {
          const { error } = await supabase.from("categories").insert({ libelle, slug: slugify(libelle), ordre: categories.length });
          if (error) throw error;
        }}
      />

      <section className="rounded-lg border bg-card p-3 space-y-2">
        <h3 className="font-serif text-xl">Sous-catégories</h3>
        <select value={catPourSous} onChange={(e) => setCatPourSous(e.target.value)}
          className="w-full rounded-md border bg-background px-2 py-2 text-sm">
          <option value="">Choisir une catégorie…</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.libelle}</option>)}
        </select>
        {catPourSous && (
          <ListeEditable
            titre=""
            table="sous_categories"
            lignes={(sousQ.data ?? []).filter((sc) => sc.categorie_id === catPourSous)}
            onAjouter={async (libelle) => {
              const { error } = await supabase.from("sous_categories").insert({
                libelle, slug: slugify(libelle), categorie_id: catPourSous, ordre: 99,
              });
              if (error) throw error;
            }}
          />
        )}
      </section>

      <ListeEditable
        titre="Types d'objet"
        table="types_objet"
        lignes={typesQ.data ?? []}
        onAjouter={async (libelle) => {
          const { error } = await supabase.from("types_objet").insert({ libelle, slug: slugify(libelle), ordre: 99 });
          if (error) throw error;
        }}
      />

      <div className="space-y-2">
        <select value={parentMatiere} onChange={(e) => setParentMatiere(e.target.value)}
          className="w-full rounded-md border bg-card px-2 py-2 text-sm">
          <option value="">Nouvelle matière : à la racine</option>
          {matieres.filter((m) => !m.parent_id).map((m) => (
            <option key={m.id} value={m.id}>Sous « {m.libelle} »</option>
          ))}
        </select>
        <ListeEditable
          titre="Matières"
          table="matieres"
          lignes={matieresOrdonnees}
          indent={(l) => !!matieres.find((m) => m.id === l.id)?.parent_id}
          onAjouter={async (libelle) => {
            const { error } = await supabase.from("matieres").insert({
              libelle, parent_id: parentMatiere || null, ordre: 99,
            });
            if (error) throw error;
          }}
        />
      </div>

      <section className="rounded-lg border bg-card p-3 space-y-3">
        <h3 className="font-serif text-xl">Champs par catégorie</h3>
        <p className="text-[11px] text-muted-foreground">
          Ces champs n'apparaissent dans la fiche que pour les catégories cochées sur le produit.
        </p>
        <select value={catChamps} onChange={(e) => setCatChamps(e.target.value)}
          className="w-full rounded-md border bg-background px-2 py-2 text-sm">
          <option value="">Choisir une catégorie…</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.libelle}</option>)}
        </select>
        {catChamps && (
          <div className="space-y-1.5">
            {CHAMPS_SPECIFIQUES.map((champ: ChampSpecifique) => {
              const actif = champsDeLaCat.find((c) => c.champ === champ);
              return (
                <div key={champ} className="flex items-center gap-2 rounded-md border px-2 py-1.5">
                  <span className="flex-1 text-sm">{CHAMP_LABEL_DEFAUT[champ]}</span>
                  {actif && (
                    <label className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <input type="checkbox" checked={actif.obligatoire}
                        onChange={(e) => champsAction.mutate(async () => {
                          const { error } = await supabase.from("categorie_champs")
                            .update({ obligatoire: e.target.checked }).eq("id", actif.id);
                          if (error) throw error;
                        })} />
                      obligatoire
                    </label>
                  )}
                  <button
                    className="text-[11px] rounded border px-2 py-1"
                    onClick={() => champsAction.mutate(async () => {
                      if (actif) {
                        const { error } = await supabase.from("categorie_champs").delete().eq("id", actif.id);
                        if (error) throw error;
                      } else {
                        const { error } = await supabase.from("categorie_champs").insert({
                          categorie_id: catChamps, champ, libelle: CHAMP_LABEL_DEFAUT[champ], ordre: 99, obligatoire: false,
                        });
                        if (error) throw error;
                      }
                    })}
                  >
                    {actif ? "Retirer" : "Ajouter"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
