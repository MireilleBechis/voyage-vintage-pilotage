import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ReferentielsTab } from "@/components/ReferentielsTab";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  listUtilisateurs,
  setRole,
  setPermissions,
  setSuspension,
  creerInvitation,
  revoquerInvitation,
  listInvitations,
  listAudit,
} from "@/lib/admin.functions";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ROLES,
  ROLE_LABEL,
  PERMISSIONS,
  PERMISSION_LABEL,
  type AppRole,
  type Permission,
} from "@/lib/produits";
import { fmtDateHeure } from "@/lib/format";
import { UserPlus, Shield, Ban, RotateCcw, Trash2, History } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: data.user.id,
      _role: "admin",
    });
    if (!isAdmin) throw redirect({ to: "/aujourdhui" });
  },
  component: AdminPage,
});

function AdminPage() {
  const [tab, setTab] = useState<"utilisateurs" | "invitations" | "référentiels" | "audit">("utilisateurs");
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl p-4 space-y-4">
        <header className="space-y-1">
          <h1 className="font-serif text-3xl">Administration</h1>
          <p className="text-sm text-muted-foreground">Utilisateurs, accès et journal d'audit.</p>
        </header>
        <div className="flex gap-2 border-b">
          {(["utilisateurs", "invitations", "référentiels", "audit"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-sm capitalize border-b-2 transition ${
                tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground"
              }`}
            >
              {t === "audit" ? "Journal" : t}
            </button>
          ))}
        </div>
        {tab === "utilisateurs" && <UtilisateursTab />}
        {tab === "invitations" && <InvitationsTab />}
        {tab === "référentiels" && <ReferentielsTab />}
        {tab === "audit" && <AuditTab />}
      </div>
    </AppShell>
  );
}

function UtilisateursTab() {
  const list = useServerFn(listUtilisateurs);
  const q = useQuery({ queryKey: ["admin-users"], queryFn: () => list() });
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-users"] });

  if (q.isLoading) return <p className="text-sm text-muted-foreground">Chargement…</p>;
  if (q.error) return <p className="text-sm text-destructive">Erreur : {(q.error as Error).message}</p>;

  return (
    <div className="space-y-3">
      {(q.data ?? []).map((u) => (
        <UserCard key={u.id} u={u} onChanged={invalidate} />
      ))}
    </div>
  );
}

type UserRow = Awaited<ReturnType<typeof listUtilisateurs>>[number];

function UserCard({ u, onChanged }: { u: UserRow; onChanged: () => void }) {
  const roleFn = useServerFn(setRole);
  const permsFn = useServerFn(setPermissions);
  const suspFn = useServerFn(setSuspension);
  const currentRole: AppRole = (u.roles[0] as AppRole | undefined) ?? "collaborateur";
  const [busy, setBusy] = useState(false);

  async function changeRole(role: AppRole) {
    setBusy(true);
    try {
      await roleFn({ data: { userId: u.id, role } });
      toast.success("Rôle mis à jour");
      onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function togglePerm(p: Permission) {
    setBusy(true);
    const next = u.permissions.includes(p)
      ? u.permissions.filter((x) => x !== p)
      : [...u.permissions, p];
    try {
      await permsFn({ data: { userId: u.id, permissions: next } });
      toast.success("Permissions mises à jour");
      onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleSuspension() {
    const suspendu = !u.suspendu;
    const motif = suspendu ? window.prompt("Motif de suspension ?") ?? undefined : undefined;
    if (suspendu && !motif) return;
    setBusy(true);
    try {
      await suspFn({ data: { userId: u.id, suspendu, motif } });
      toast.success(suspendu ? "Compte suspendu" : "Compte réactivé");
      onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium truncate">{u.nom_affichage ?? u.email}</div>
          <div className="text-xs text-muted-foreground truncate">{u.email}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Créé {u.created_at ? fmtDateHeure(u.created_at) : "—"} · Dernière connexion{" "}
            {u.last_sign_in_at ? fmtDateHeure(u.last_sign_in_at) : "jamais"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {u.suspendu && <Badge variant="destructive">Suspendu</Badge>}
          {!u.confirmed && <Badge variant="secondary">Non confirmé</Badge>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Label className="text-xs w-16">Rôle</Label>
        <Select value={currentRole} onValueChange={(v) => changeRole(v as AppRole)} disabled={busy}>
          <SelectTrigger className="w-56 h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" variant={u.suspendu ? "default" : "outline"} onClick={toggleSuspension} disabled={busy}>
          {u.suspendu ? <RotateCcw className="w-4 h-4 mr-1" /> : <Ban className="w-4 h-4 mr-1" />}
          {u.suspendu ? "Réactiver" : "Suspendre"}
        </Button>
      </div>

      <div>
        <Label className="text-xs">Permissions granulaires</Label>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {PERMISSIONS.map((p) => {
            const on = u.permissions.includes(p);
            return (
              <button
                key={p}
                onClick={() => togglePerm(p)}
                disabled={busy}
                className={`text-xs px-2 py-1 rounded border transition ${
                  on
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:bg-secondary"
                }`}
              >
                {PERMISSION_LABEL[p]}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function InvitationsTab() {
  const list = useServerFn(listInvitations);
  const q = useQuery({ queryKey: ["admin-invitations"], queryFn: () => list() });
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-invitations"] });
  const revoke = useServerFn(revoquerInvitation);

  async function onRevoke(id: string) {
    if (!confirm("Révoquer cette invitation ?")) return;
    try {
      await revoke({ data: { id } });
      toast.success("Invitation révoquée");
      invalidate();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="space-y-3">
      <InviteDialog onCreated={invalidate} />
      {q.isLoading && <p className="text-sm text-muted-foreground">Chargement…</p>}
      {(q.data ?? []).map((i) => (
        <Card key={i.id} className="p-3 flex flex-wrap items-center gap-2 justify-between">
          <div className="min-w-0">
            <div className="font-medium text-sm truncate">{i.email}</div>
            <div className="text-xs text-muted-foreground">
              {ROLE_LABEL[i.role_propose as AppRole]} · expire {fmtDateHeure(i.expire_at)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={i.statut === "en_attente" ? "default" : "secondary"}>{i.statut}</Badge>
            {i.statut === "en_attente" && (
              <Button size="sm" variant="ghost" onClick={() => onRevoke(i.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      ))}
      {q.data && q.data.length === 0 && (
        <p className="text-sm text-muted-foreground">Aucune invitation.</p>
      )}
    </div>
  );
}

function InviteDialog({ onCreated }: { onCreated: () => void }) {
  const create = useServerFn(creerInvitation);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("collaborateur");
  const [perms, setPerms] = useState<Permission[]>([]);
  const [msg, setMsg] = useState("");
  const [jours, setJours] = useState(7);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!email.includes("@")) return toast.error("Email invalide");
    setBusy(true);
    try {
      await create({ data: { email, role, permissions: perms, message: msg, jours_validite: jours } });
      toast.success("Invitation envoyée");
      setOpen(false);
      setEmail(""); setPerms([]); setMsg("");
      onCreated();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><UserPlus className="w-4 h-4 mr-2" /> Inviter</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Nouvelle invitation</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Rôle proposé</Label>
            <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Permissions</Label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {PERMISSIONS.map((p) => {
                const on = perms.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      setPerms(on ? perms.filter((x) => x !== p) : [...perms, p])
                    }
                    className={`text-xs px-2 py-1 rounded border ${
                      on ? "bg-primary text-primary-foreground border-primary" : "border-border"
                    }`}
                  >
                    {PERMISSION_LABEL[p]}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <Label>Validité (jours)</Label>
            <Input type="number" min={1} max={30} value={jours} onChange={(e) => setJours(Number(e.target.value))} />
          </div>
          <div>
            <Label>Message (optionnel)</Label>
            <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={2} />
          </div>
          <Button onClick={submit} disabled={busy} className="w-full">
            <Shield className="w-4 h-4 mr-2" /> Envoyer l'invitation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AuditTab() {
  const list = useServerFn(listAudit);
  const q = useQuery({ queryKey: ["admin-audit"], queryFn: () => list() });
  if (q.isLoading) return <p className="text-sm text-muted-foreground">Chargement…</p>;
  return (
    <div className="space-y-2">
      {(q.data ?? []).map((a) => (
        <Card key={a.id} className="p-3 text-sm space-y-1">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{a.action}</span>
            <span className="text-xs text-muted-foreground ml-auto">{fmtDateHeure(a.created_at)}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Par {a.acteur_email ?? "—"}
            {a.cible_email && <> · Cible : {a.cible_email}</>}
          </div>
          {a.details != null && (
            <pre className="text-xs bg-muted/40 p-2 rounded overflow-x-auto">
              {JSON.stringify(a.details, null, 2)}
            </pre>
          )}
        </Card>
      ))}
      {q.data && q.data.length === 0 && <p className="text-sm text-muted-foreground">Aucun événement.</p>}
    </div>
  );
}
