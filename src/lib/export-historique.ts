import * as XLSX from "xlsx";
import { ACTION_HISTORIQUE_LABEL } from "./produits";

export interface HistoriqueRow {
  id: string;
  produit_id?: string | null;
  identifiant?: string | null;
  action: string;
  acteur_email: string | null;
  created_at: string;
  details: Record<string, unknown> | null;
}

function rowsToSheet(rows: HistoriqueRow[]) {
  return rows.map((r) => ({
    Date: new Date(r.created_at).toLocaleString("fr-FR"),
    Identifiant: r.identifiant ?? "",
    Action: ACTION_HISTORIQUE_LABEL[r.action] ?? r.action,
    Acteur: r.acteur_email ?? "",
    Détails: r.details ? JSON.stringify(r.details) : "",
  }));
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportHistoriqueCsv(rows: HistoriqueRow[], filename = "historique.csv") {
  const data = rowsToSheet(rows);
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws, { FS: ";" });
  // BOM for Excel FR
  download(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }), filename);
}

export function exportHistoriqueXlsx(rows: HistoriqueRow[], filename = "historique.xlsx") {
  const data = rowsToSheet(rows);
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Historique");
  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  download(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), filename);
}
