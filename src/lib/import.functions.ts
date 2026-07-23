import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const importInitialStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // Existing identifiants pour idempotence
    const { data: existing } = await supabase
      .from("produits")
      .select("identifiant")
      .eq("owner_id", userId);
    const existingSet = new Set((existing ?? []).map((r: { identifiant: string }) => r.identifiant));

    // Lazy import — 148KB JSON reste côté serveur
    const dataMod = await import("../data/initial-stock.json");
    const items: Array<Record<string, unknown>> = (dataMod as { default: Array<Record<string, unknown>> }).default;

    const toInsert = items
      .filter((it) => !existingSet.has(it.identifiant as string))
      .map((it) => ({ ...it, owner_id: userId }));

    if (toInsert.length === 0) {
      return { inserted: 0, skipped: items.length, total: items.length };
    }

    // Insert par lots de 50
    let inserted = 0;
    for (let i = 0; i < toInsert.length; i += 50) {
      const chunk = toInsert.slice(i, i + 50);
      const { error, count } = await supabase.from("produits").insert(chunk as never, { count: "exact" });
      if (error) throw new Error(`Import échoué à la ligne ${i}: ${error.message}`);
      inserted += count ?? chunk.length;
    }

    return { inserted, skipped: items.length - inserted, total: items.length };
  });
