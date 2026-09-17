import { useQuery } from "@tanstack/react-query";
import {
  listCategories,
  listSousCategories,
  listTypesObjet,
  listMatieres,
  type Matiere,
} from "@/lib/referentiels";

export interface Rattachements {
  categories: string[];
  sousCategories: string[];
  types: string[];
  /** id de la matière retenue (enfant si précisée, sinon racine) */
  matierePrincipale: string | null;
  matiereSecondaire: string | null;
  categorieShopifyId: string | null;
}

export const RATTACHEMENTS_VIDES: Rattachements = {
  categories: [],
  sousCategories: [],
  types: [],
  matierePrincipale: null,
  matiereSecondaire: null,
  categorieShopifyId: null,
};

function racineDe(id: string | null, matieres: Matiere[]): string | null {
  if (!id) return null;
  const m = matieres.find((x) => x.id === id);
  if (!m) return null;
  return m.parent_id ?? m.id;
}

function MatiereSelect({
  label,
  value,
  matieres,
  onChange,
}: {
  label: string;
  value: string | null;
  matieres: Matiere[];
  onChange: (v: string | null) => void;
}) {
  const racines = matieres.filter((m) => !m.parent_id && m.actif);
  const racine = racineDe(value, matieres);
  const enfants = matieres.filter((m) => m.parent_id === racine && m.actif);
  const enfantChoisi = value && value !== racine ? value : "";

  return (
    <div className="space-y-2">
      <label className="block">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
        <select
          value={racine ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="mt-1 w-full rounded-md border bg-card px-2 py-2 text-sm"
        >
          <option value="">—</option>
          {racines.map((m) => (
            <option key={m.id} value={m.id}>{m.libelle}</option>
          ))}
        </select>
      </label>
      {enfants.length > 0 && (
        <label className="block">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Préciser ({matieres.find((m) => m.id === racine)?.libelle})
          </span>
          <select
            value={enfantChoisi}
            onChange={(e) => onChange(e.target.value || racine)}
            className="mt-1 w-full rounded-md border bg-card px-2 py-2 text-sm"
          >
            <option value="">Non précisé</option>
            {enfants.map((m) => (
              <option key={m.id} value={m.id}>{m.libelle}</option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}

export function RattachementsEditor({
  value,
  onChange,
}: {
  value: Rattachements;
  onChange: (v: Rattachements) => void;
}) {
  const categoriesQ = useQuery({ queryKey: ["categories"], queryFn: listCategories });
  const sousCategoriesQ = useQuery({ queryKey: ["sous_categories"], queryFn: listSousCategories });
  const typesQ = useQuery({ queryKey: ["types_objet"], queryFn: listTypesObjet });
  const matieresQ = useQuery({ queryKey: ["matieres"], queryFn: listMatieres });

  const categories = (categoriesQ.data ?? []).filter((c) => c.actif);
  const matieres = matieresQ.data ?? [];
  const sousCategories = (sousCategoriesQ.data ?? []).filter(
    (sc) => sc.actif && value.categories.includes(sc.categorie_id),
  );
  const types = (typesQ.data ?? []).filter((t) => t.actif);

  const toggleCategorie = (id: string) => {
    const cats = value.categories.includes(id)
      ? value.categories.filter((c) => c !== id)
      : [...value.categories, id];
    // Les sous-catégories doivent rester rattachées à une catégorie cochée.
    const scValides = (sousCategoriesQ.data ?? [])
      .filter((sc) => value.sousCategories.includes(sc.id) && cats.includes(sc.categorie_id))
      .map((sc) => sc.id);
    const shopify =
      value.categorieShopifyId && cats.includes(value.categorieShopifyId)
        ? value.categorieShopifyId
        : cats.length === 1
          ? cats[0]
          : null;
    onChange({ ...value, categories: cats, sousCategories: scValides, categorieShopifyId: shopify });
  };

  const toggleDans = (key: "sousCategories" | "types", id: string) => {
    const list = value[key].includes(id) ? value[key].filter((x) => x !== id) : [...value[key], id];
    onChange({ ...value, [key]: list });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Catégories</p>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => {
            const on = value.categories.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCategorie(c.id)}
                className={`text-xs rounded-full border px-3 py-1.5 ${on ? "bg-primary text-primary-foreground border-primary" : "bg-card"}`}
              >
                {c.libelle}
              </button>
            );
          })}
        </div>
      </div>

      {sousCategories.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Sous-catégories</p>
          <div className="flex flex-wrap gap-1.5">
            {sousCategories.map((sc) => {
              const on = value.sousCategories.includes(sc.id);
              return (
                <button key={sc.id} type="button" onClick={() => toggleDans("sousCategories", sc.id)}
                  className={`text-xs rounded-full border px-3 py-1.5 ${on ? "bg-primary text-primary-foreground border-primary" : "bg-card"}`}>
                  {sc.libelle}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Types d'objet</p>
        <div className="flex flex-wrap gap-1.5">
          {types.map((t) => {
            const on = value.types.includes(t.id);
            return (
              <button key={t.id} type="button" onClick={() => toggleDans("types", t.id)}
                className={`text-xs rounded-full border px-3 py-1.5 ${on ? "bg-primary text-primary-foreground border-primary" : "bg-card"}`}>
                {t.libelle}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <MatiereSelect
          label="Matière principale"
          value={value.matierePrincipale}
          matieres={matieres}
          onChange={(v) => onChange({ ...value, matierePrincipale: v })}
        />
        <MatiereSelect
          label="Matière secondaire"
          value={value.matiereSecondaire}
          matieres={matieres}
          onChange={(v) => onChange({ ...value, matiereSecondaire: v })}
        />
      </div>

      <label className="block">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Catégorie envoyée à Shopify
        </span>
        <select
          value={value.categorieShopifyId ?? ""}
          onChange={(e) => onChange({ ...value, categorieShopifyId: e.target.value || null })}
          className="mt-1 w-full rounded-md border bg-card px-2 py-2 text-sm"
          disabled={value.categories.length === 0}
        >
          <option value="">—</option>
          {categories
            .filter((c) => value.categories.includes(c.id))
            .map((c) => (
              <option key={c.id} value={c.id}>{c.libelle}</option>
            ))}
        </select>
        <span className="text-[11px] text-muted-foreground">
          Une seule catégorie est transmise à la boutique en ligne.
        </span>
      </label>
    </div>
  );
}
