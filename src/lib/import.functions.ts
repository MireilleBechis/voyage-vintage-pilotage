import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const importInitialStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    // La table `produits` n'est plus accessible depuis le client Supabase user :
    // les GRANTs ont été révoqués. On passe par le client service_role côté serveur.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("produits")
      .select("identifiant")
      .eq("owner_id", userId);
    const existingSet = new Set((existing ?? []).map((r: { identifiant: string }) => r.identifiant));

    const dataMod = await import("../data/initial-stock.json");
    const items: Array<Record<string, unknown>> = (dataMod as { default: Array<Record<string, unknown>> }).default;

    // --- Référentiels : on récupère l'existant et on crée les valeurs manquantes.
    type Ref = { id: string; slug: string };
    const charger = async (table: "categories" | "types_objet") => {
      const { data } = await supabaseAdmin.from(table).select("id, slug");
      const map = new Map<string, string>();
      for (const r of (data ?? []) as unknown as Ref[]) map.set(r.slug, r.id);
      return map;
    };
    const cats = await charger("categories");
    const types = await charger("types_objet");

    // Les matières n'ont pas de slug : on indexe par libellé normalisé.
    const { data: matData } = await supabaseAdmin.from("matieres").select("id, libelle");
    const matieres = new Map<string, string>();
    for (const r of (matData ?? []) as unknown as Array<{ id: string; libelle: string }>) {
      matieres.set(slugify(r.libelle), r.id);
    }

    const { data: scData } = await supabaseAdmin.from("sous_categories").select("id, slug, categorie_id");
    const sousCats = new Map<string, string>();
    for (const r of (scData ?? []) as Array<{ id: string; slug: string }>) sousCats.set(r.slug, r.id);

    async function assurer(
      table: "categories" | "types_objet",
      map: Map<string, string>,
      libelle: string,
    ): Promise<string | null> {
      const lib = libelle.trim();
      if (!lib) return null;
      const slug = slugify(lib);
      if (!slug) return null;
      const found = map.get(slug);
      if (found) return found;
      const { data, error } = await supabaseAdmin
        .from(table)
        .insert({ libelle: lib, slug, ordre: 999, actif: true })
        .select("id")
        .single();
      if (error || !data) return null;
      map.set(slug, data.id);
      return data.id;
    }

    async function assurerMatiere(libelle: string): Promise<string | null> {
      const lib = libelle.trim();
      if (!lib) return null;
      const cle = slugify(lib);
      if (!cle) return null;
      const found = matieres.get(cle);
      if (found) return found;
      const { data, error } = await supabaseAdmin
        .from("matieres")
        .insert({ libelle: lib, ordre: 999, actif: true })
        .select("id")
        .single();
      if (error || !data) return null;
      matieres.set(cle, data.id);
      return data.id;
    }

    async function assurerSousCategorie(libelle: string, categorieId: string | null): Promise<string | null> {
      const lib = libelle.trim();
      if (!lib || !categorieId) return null;
      const slug = slugify(lib);
      const found = sousCats.get(slug);
      if (found) return found;
      const { data, error } = await supabaseAdmin
        .from("sous_categories")
        .insert({ libelle: lib, slug, categorie_id: categorieId, ordre: 999, actif: true })
        .select("id")
        .single();
      if (error || !data) return null;
      sousCats.set(slug, data.id);
      return data.id;
    }

    let inserted = 0;
    for (const it of items) {
      const identifiant = it.identifiant as string;
      if (existingSet.has(identifiant)) continue;

      const categorieLib = (it.categorie as string | undefined) ?? "";
      const sousCategorieLib = (it.sous_categorie as string | undefined) ?? "";
      const typeLib = (it.type_objet as string | undefined) ?? "";
      const materiauxLib = (it.materiaux as string | undefined) ?? "";

      const payload = { ...it } as Record<string, unknown>;
      delete payload.categorie;
      delete payload.sous_categorie;
      delete payload.type_objet;
      delete payload.materiaux;
      payload.owner_id = userId;

      const { data: produit, error } = await supabaseAdmin
        .from("produits")
        .insert(payload as never)
        .select("id")
        .single();
      if (error || !produit) throw new Error(`Import échoué (${identifiant}) : ${error?.message}`);
      inserted += 1;

      const categorieId = await assurer("categories", cats, categorieLib);
      const sousCategorieId = await assurerSousCategorie(sousCategorieLib, categorieId);
      const typeId = await assurer("types_objet", types, typeLib);
      // La matière importée est libre : on la crée à la racine si elle n'existe pas.
      const matiereId = await assurerMatiere(materiauxLib.split(/[,/;]/)[0] ?? "");

      if (categorieId) {
        await supabaseAdmin.from("produit_categories").insert({ produit_id: produit.id, categorie_id: categorieId });
        await supabaseAdmin.from("produits").update({ categorie_shopify_id: categorieId }).eq("id", produit.id);
      }
      if (sousCategorieId) {
        await supabaseAdmin
          .from("produit_sous_categories")
          .insert({ produit_id: produit.id, sous_categorie_id: sousCategorieId });
      }
      if (typeId) {
        await supabaseAdmin.from("produit_types").insert({ produit_id: produit.id, type_objet_id: typeId });
      }
      if (matiereId) {
        await supabaseAdmin
          .from("produit_matieres")
          .insert({ produit_id: produit.id, matiere_id: matiereId, role: "principale" });
      }
    }

    return { inserted, skipped: items.length - inserted, total: items.length };
  });
