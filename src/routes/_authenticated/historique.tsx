import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { ACTION_HISTORIQUE_LABEL } from "@/lib/produits";
import { dateFr } from "@/lib/format";
import { exportHistoriqueCsv, exportHistoriqueXlsx, type HistoriqueRow } from "@/lib/export-historique";
import { Download, FileSpreadsheet } from "lucide-react";

export const Route = createFileRoute("/_authenticated/historique")({
  component: HistoriquePage,
  head: () => ({ meta: [
    { title: "Historique — Voyage Vintage" },
    { name: "description", content: "Journal des actions sur les produits (archivage, corbeille, modifications)." },
  ] }),
});

function HistoriquePage() {
  const q = useQuery({
    queryKey: ["historique-global"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produit_historique")
        .select("id, produit_id, identifiant, action, acteur_email, created_at, details")
        .order("created_at", { ascending: false })
        .limit(2000);
      if (error) throw error;
      return (data ?? []) as unknown as HistoriqueRow[];
    },
  });
  const rows = q.data ?? [];
  return (
    <AppShell>
      <div className="p-4 max-w-md mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl">Historique</h1>
          <div className="flex gap-2">
            <button
              onClick={() => exportHistoriqueCsv(rows)}
              disabled={rows.length === 0}
              className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-md border bg-card disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
            <button
              onClick={() => exportHistoriqueXlsx(rows)}
              disabled={rows.length === 0}
              className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-md border bg-card disabled:opacity-40"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{rows.length} action{rows.length > 1 ? "s" : ""} enregistrée{rows.length > 1 ? "s" : ""}.</p>
        {q.isLoading && <p className="text-xs text-muted-foreground">Chargement…</p>}
        <ul className="text-xs space-y-1">
          {rows.map((h) => (
            <li key={h.id} className="flex justify-between gap-2 border-b py-1.5">
              <span className="min-w-0">
                <span className="font-mono text-brass">{h.identifiant ?? "—"}</span>{" "}
                <span className="font-medium">{ACTION_HISTORIQUE_LABEL[h.action] ?? h.action}</span>
                {h.acteur_email && <span className="text-muted-foreground"> · {h.acteur_email}</span>}
              </span>
              <span className="text-muted-foreground shrink-0">{dateFr(h.created_at)}</span>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
