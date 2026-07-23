import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { MoreVertical, ExternalLink, Pencil, RefreshCw, Camera, ListPlus, Copy, Archive, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { updateProduit } from "@/lib/produits-api";
import {
  STATUTS,
  STATUT_LABEL,
  ACTION_LABEL,
  type TypeAction,
  type Produit,
  type Statut,
} from "@/lib/produits";
import {
  archiverProduit,
  dupliquerProduit,
  mettreCorbeille,
  restaurerCorbeille,
} from "@/lib/produit-actions";
import { ArchiveDialog } from "./ArchiveDialog";
import { TrashDialog } from "./TrashDialog";

export function ProduitMenu({ p, onOpenEdit }: { p: Produit; onOpenEdit?: () => void }) {
  const [open, setOpen] = useState(false);
  const [statutOpen, setStatutOpen] = useState(false);
  const [tacheOpen, setTacheOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["produits"] });
    qc.invalidateQueries({ queryKey: ["produit", p.id] });
    qc.invalidateQueries({ queryKey: ["corbeille"] });
    qc.invalidateQueries({ queryKey: ["archives"] });
  };

  const statutMut = useMutation({
    mutationFn: async (s: Statut) => {
      await updateProduit(p.id, { statut: s, statut_modifie_manuellement: true });
    },
    onSuccess: () => { toast.success("Statut mis à jour."); invalidate(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const photoMut = useMutation({
    mutationFn: async (file: File) => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user!.id;
      const path = `${uid}/${p.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("produit-photos").upload(path, file);
      if (upErr) throw upErr;
      const { data: signed } = await supabase.storage
        .from("produit-photos")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      const existing = (p.photos ?? []) as Array<{ url: string; storage_path: string }>;
      const next = [...existing, { url: signed?.signedUrl ?? "", storage_path: path }];
      await updateProduit(p.id, { photos: next });
    },
    onSuccess: () => { toast.success("Photo ajoutée."); invalidate(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const dupMut = useMutation({
    mutationFn: () => dupliquerProduit(p),
    onSuccess: (newId) => {
      toast.success("Produit dupliqué.");
      invalidate();
      navigate({ to: "/produit/$id", params: { id: newId } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  function close() { setOpen(false); }

  function toastAnnuler(message: string, undo: () => Promise<void>) {
    toast(message, {
      duration: 6000,
      action: {
        label: "Annuler",
        onClick: async () => {
          try { await undo(); toast.success("Restauré."); invalidate(); }
          catch (e) { toast.error(e instanceof Error ? e.message : "Erreur"); }
        },
      },
    });
  }

  return (
    <>
      <button
        aria-label="Actions"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        className="p-1.5 rounded hover:bg-secondary text-muted-foreground"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      <input
        ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) photoMut.mutate(f); e.target.value = ""; }}
      />

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={close}>
          <div
            className="absolute bottom-0 left-0 right-0 bg-card border-t rounded-t-2xl p-2 shadow-lg max-w-md mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{p.identifiant}</span>
              {p.designer_ou_marque ? ` · ${p.designer_ou_marque}` : ""}
            </div>
            <MenuItem icon={ExternalLink} label="Ouvrir la fiche"
              onClick={() => { close(); navigate({ to: "/produit/$id", params: { id: p.id } }); }} />
            <MenuItem icon={Pencil} label="Modifier"
              onClick={() => {
                close();
                if (onOpenEdit) onOpenEdit();
                else navigate({ to: "/produit/$id", params: { id: p.id }, search: { edit: 1 } as never });
              }} />
            <MenuItem icon={RefreshCw} label="Changer le statut"
              onClick={() => { setStatutOpen((v) => !v); }} />
            {statutOpen && (
              <div className="pl-8 pr-2 pb-2 grid grid-cols-2 gap-1">
                {STATUTS.map((s) => (
                  <button key={s}
                    onClick={() => { statutMut.mutate(s); setStatutOpen(false); close(); }}
                    className={`text-xs text-left px-2 py-1.5 rounded border bg-background ${p.statut === s ? "font-medium text-primary" : ""}`}
                  >
                    {STATUT_LABEL[s]}
                  </button>
                ))}
              </div>
            )}
            <MenuItem icon={Camera} label="Ajouter une photo"
              onClick={() => { close(); fileRef.current?.click(); }} />
            <MenuItem icon={ListPlus} label="Ajouter une tâche"
              onClick={() => setTacheOpen(true)} />
            <MenuItem icon={Copy} label="Dupliquer"
              onClick={() => { close(); dupMut.mutate(); }} />
            <div className="my-1 border-t" />
            <MenuItem icon={Archive} label="Archiver"
              onClick={() => { setOpen(false); setArchiveOpen(true); }} />
            <MenuItem icon={Trash2} label="Mettre à la corbeille" danger
              onClick={() => { setOpen(false); setTrashOpen(true); }} />
            <button
              onClick={close}
              className="w-full text-center py-3 mt-1 text-sm text-muted-foreground"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {tacheOpen && (
        <AjouterTacheDialog
          produitId={p.id}
          onClose={() => { setTacheOpen(false); close(); }}
        />
      )}

      {archiveOpen && (
        <ArchiveDialog
          produit={p}
          onClose={() => setArchiveOpen(false)}
          onDone={() => { setArchiveOpen(false); invalidate(); }}
        />
      )}

      {trashOpen && (
        <TrashDialog
          produit={p}
          onClose={() => setTrashOpen(false)}
          onArchiverInstead={() => { setTrashOpen(false); setArchiveOpen(true); }}
          onDone={async () => {
            setTrashOpen(false);
            await mettreCorbeille(p.id);
            invalidate();
            toastAnnuler(`${p.identifiant} placé dans la corbeille`, () => restaurerCorbeille(p.id));
          }}
        />
      )}
    </>
  );
}

function MenuItem({
  icon: Icon, label, onClick, danger,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm hover:bg-secondary ${danger ? "text-destructive" : ""}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function AjouterTacheDialog({ produitId, onClose }: { produitId: string; onClose: () => void }) {
  const [titre, setTitre] = useState("");
  const [type, setType] = useState<TypeAction>("autre");
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("taches").insert({
        owner_id: userData.user!.id, produit_id: produitId, titre: titre.trim(), type_action: type,
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Tâche ajoutée.");
      qc.invalidateQueries({ queryKey: ["taches"] });
      qc.invalidateQueries({ queryKey: ["taches", produitId] });
      onClose();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-4 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-serif text-lg">Ajouter une tâche</h3>
        <select value={type} onChange={(e) => setType(e.target.value as TypeAction)}
          className="w-full rounded-md border bg-background px-2 py-2 text-sm">
          {(Object.keys(ACTION_LABEL) as TypeAction[]).map((a) => (
            <option key={a} value={a}>{ACTION_LABEL[a]}</option>
          ))}
        </select>
        <input value={titre} onChange={(e) => setTitre(e.target.value)}
          placeholder="Intitulé de la tâche…"
          className="w-full rounded-md border bg-background px-2 py-2 text-sm" />
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-3 py-2 text-sm">Annuler</button>
          <button onClick={() => titre.trim() && mut.mutate()}
            disabled={!titre.trim() || mut.isPending}
            className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-60">
            Créer
          </button>
        </div>
      </div>
    </div>
  );
}
