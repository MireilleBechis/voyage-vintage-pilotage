import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import {
  createProduit,
  prochainIdentifiantProduit,
  setProduitRattachements,
} from "@/lib/produits-api";
import {
  RattachementsEditor,
  RATTACHEMENTS_VIDES,
  type Rattachements,
} from "@/components/RattachementsEditor";

export const Route = createFileRoute("/_authenticated/produit/nouveau")({
  head: () => ({
    meta: [
      { title: "Nouveau produit — Voyage Vintage" },
      { name: "description", content: "Créer une nouvelle fiche produit dans le stock vintage." },
    ],
  }),
  component: NouveauProduit,
});

interface Champs {
  titre_commercial: string;
  designer_ou_marque: string;
  editeur_ou_label: string;
  modele: string;
  annee: string;
  couleur: string;
  etat: string;
  dimensions: string;
  poids: string;
  emplacement_stockage: string;
  canal_achat: string;
  date_achat: string;
  prix_achat: string;
  cout_transport: string;
  cout_travaux: string;
  prix_vente_cible: string;
  description: string;
  notes: string;
}

const VIDE: Champs = {
  titre_commercial: "", designer_ou_marque: "", editeur_ou_label: "", modele: "", annee: "",
  couleur: "", etat: "", dimensions: "", poids: "", emplacement_stockage: "", canal_achat: "",
  date_achat: "", prix_achat: "", cout_transport: "", cout_travaux: "", prix_vente_cible: "",
  description: "", notes: "",
};

function num(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function NouveauProduit() {
  const navigate = useNavigate();
  const [f, setF] = useState<Champs>(VIDE);
  const [rat, setRat] = useState<Rattachements>(RATTACHEMENTS_VIDES);

  const idQ = useQuery({ queryKey: ["prochain_identifiant"], queryFn: prochainIdentifiantProduit });

  const set = (k: keyof Champs) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const mut = useMutation({
    mutationFn: async () => {
      const identifiant = idQ.data ?? (await prochainIdentifiantProduit());
      const id = await createProduit({
        identifiant,
        titre_commercial: f.titre_commercial || null,
        designer_ou_marque: f.designer_ou_marque || null,
        editeur_ou_label: f.editeur_ou_label || null,
        modele: f.modele || null,
        annee: f.annee || null,
        couleur: f.couleur || null,
        etat: f.etat || null,
        dimensions: f.dimensions || null,
        poids: f.poids || null,
        emplacement_stockage: f.emplacement_stockage || null,
        canal_achat: f.canal_achat || null,
        date_achat: f.date_achat || null,
        prix_achat: num(f.prix_achat),
        cout_transport: num(f.cout_transport),
        cout_travaux: num(f.cout_travaux),
        prix_vente_cible: num(f.prix_vente_cible),
        description: f.description || null,
        notes: f.notes || null,
        categorie_shopify_id: rat.categorieShopifyId,
      });
      const matieres: Array<{ matiere_id: string; role: "principale" | "secondaire" }> = [];
      if (rat.matierePrincipale) matieres.push({ matiere_id: rat.matierePrincipale, role: "principale" });
      if (rat.matiereSecondaire) matieres.push({ matiere_id: rat.matiereSecondaire, role: "secondaire" });
      await setProduitRattachements(id, {
        categories: rat.categories,
        sousCategories: rat.sousCategories,
        types: rat.types,
        matieres,
      });
      return id;
    },
    onSuccess: (id) => {
      toast.success("Produit créé");
      navigate({ to: "/produit/$id", params: { id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="container-app py-6 space-y-5">
      <button onClick={() => navigate({ to: "/stock" })} className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ChevronLeft className="w-4 h-4" /> Stock
      </button>

      <header>
        <h1 className="font-serif text-3xl text-primary">Nouveau produit</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Identifiant attribué : <span className="font-mono text-brass">{idQ.data ?? "…"}</span>
        </p>
      </header>

      <section className="rounded-lg border bg-card p-3 space-y-3">
        <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground">Identification</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Titre commercial" value={f.titre_commercial} onChange={set("titre_commercial")} />
          <Field label="Designer / marque" value={f.designer_ou_marque} onChange={set("designer_ou_marque")} />
          <Field label="Éditeur / label" value={f.editeur_ou_label} onChange={set("editeur_ou_label")} />
          <Field label="Modèle" value={f.modele} onChange={set("modele")} />
          <Field label="Année" value={f.annee} onChange={set("annee")} />
          <Field label="Couleur" value={f.couleur} onChange={set("couleur")} />
          <Field label="État" value={f.etat} onChange={set("etat")} />
          <Field label="Dimensions" value={f.dimensions} onChange={set("dimensions")} />
          <Field label="Poids" value={f.poids} onChange={set("poids")} />
          <Field label="Emplacement" value={f.emplacement_stockage} onChange={set("emplacement_stockage")} />
        </div>
      </section>

      <section className="rounded-lg border bg-card p-3 space-y-3">
        <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground">Classement & matières</h2>
        <RattachementsEditor value={rat} onChange={setRat} />
      </section>

      <section className="rounded-lg border bg-card p-3 space-y-3">
        <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground">Achat & prix</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Canal d'achat" value={f.canal_achat} onChange={set("canal_achat")} />
          <Field label="Date d'achat" type="date" value={f.date_achat} onChange={set("date_achat")} />
          <Field label="Prix d'achat (€)" type="number" value={f.prix_achat} onChange={set("prix_achat")} />
          <Field label="Transport (€)" type="number" value={f.cout_transport} onChange={set("cout_transport")} />
          <Field label="Travaux (€)" type="number" value={f.cout_travaux} onChange={set("cout_travaux")} />
          <Field label="Prix de vente cible (€)" type="number" value={f.prix_vente_cible} onChange={set("prix_vente_cible")} />
        </div>
      </section>

      <section className="rounded-lg border bg-card p-3 space-y-3">
        <h2 className="text-[10px] uppercase tracking-widest text-muted-foreground">Description & notes</h2>
        <textarea value={f.description} onChange={set("description")} rows={4}
          placeholder="Description" className="w-full rounded-md border bg-background px-2 py-2 text-sm" />
        <textarea value={f.notes} onChange={set("notes")} rows={3}
          placeholder="Notes internes" className="w-full rounded-md border bg-background px-2 py-2 text-sm" />
      </section>

      <button
        onClick={() => mut.mutate()}
        disabled={mut.isPending}
        className="w-full rounded-md bg-primary text-primary-foreground py-3 text-sm"
      >
        {mut.isPending ? "Création…" : "Créer le produit"}
      </button>
      <p className="text-[11px] text-muted-foreground">
        Les photos s'ajoutent depuis la fiche, juste après la création.
      </p>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text",
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <input type={type} value={value} onChange={onChange}
        className="mt-1 w-full rounded-md border bg-background px-2 py-2 text-sm" />
    </label>
  );
}
