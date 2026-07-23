import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];
type Permission = Database["public"]["Enums"]["role_permission"];

async function requireAdmin(ctx: { supabase: import("@supabase/supabase-js").SupabaseClient<Database>; userId: string; claims: unknown }) {
  const { data, error } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Accès refusé : administrateur requis");
}

async function logAudit(
  supabaseAdmin: import("@supabase/supabase-js").SupabaseClient<Database>,
  acteur: { id: string; email?: string | null },
  entry: {
    action: string;
    cible_type?: string;
    cible_id?: string | null;
    cible_email?: string | null;
    details?: Record<string, unknown>;
  },
) {
  await supabaseAdmin.from("audit_log").insert({
    acteur_id: acteur.id,
    acteur_email: acteur.email ?? null,
    action: entry.action,
    cible_type: entry.cible_type ?? null,
    cible_id: entry.cible_id ?? null,
    cible_email: entry.cible_email ?? null,
    details: (entry.details ?? null) as never,
  });
}

/** Liste tous les utilisateurs avec rôles, permissions, statut. Admin only. */
export const listUtilisateurs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: usersRes, error: usersErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    if (usersErr) throw new Error(usersErr.message);

    const ids = usersRes.users.map((u) => u.id);
    const [{ data: roles }, { data: perms }, { data: statuses }, { data: profiles }] = await Promise.all([
      supabaseAdmin.from("user_roles").select("user_id, role").in("user_id", ids),
      supabaseAdmin.from("user_permissions").select("user_id, permission").in("user_id", ids),
      supabaseAdmin.from("user_status").select("*").in("user_id", ids),
      supabaseAdmin.from("profiles").select("id, nom_affichage").in("id", ids),
    ]);

    return usersRes.users.map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      confirmed: !!u.email_confirmed_at,
      nom_affichage: profiles?.find((p) => p.id === u.id)?.nom_affichage ?? null,
      roles: (roles ?? []).filter((r) => r.user_id === u.id).map((r) => r.role as AppRole),
      permissions: (perms ?? []).filter((p) => p.user_id === u.id).map((p) => p.permission as Permission),
      suspendu: statuses?.find((s) => s.user_id === u.id)?.suspendu ?? false,
      motif_suspension: statuses?.find((s) => s.user_id === u.id)?.motif ?? null,
    }));
  });

/** Attribuer un rôle (remplace les rôles existants). */
export const setRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; role: AppRole }) => d)
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    if (data.userId === context.userId) throw new Error("Vous ne pouvez pas modifier votre propre rôle");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: data.userId, role: data.role });
    if (error) throw new Error(error.message);
    const { data: target } = await supabaseAdmin.auth.admin.getUserById(data.userId);
    await logAudit(supabaseAdmin, { id: context.userId, email: (context.claims as { email?: string })?.email }, {
      action: "role.attribue",
      cible_type: "user",
      cible_id: data.userId,
      cible_email: target.user?.email ?? null,
      details: { role: data.role },
    });
    return { ok: true };
  });

/** Mettre à jour les permissions granulaires. */
export const setPermissions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; permissions: Permission[] }) => d)
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("user_permissions").delete().eq("user_id", data.userId);
    if (data.permissions.length > 0) {
      const rows = data.permissions.map((p) => ({
        user_id: data.userId,
        permission: p,
        granted_by: context.userId,
      }));
      const { error } = await supabaseAdmin.from("user_permissions").insert(rows);
      if (error) throw new Error(error.message);
    }
    const { data: target } = await supabaseAdmin.auth.admin.getUserById(data.userId);
    await logAudit(supabaseAdmin, { id: context.userId, email: (context.claims as { email?: string })?.email }, {
      action: "permissions.mises_a_jour",
      cible_type: "user",
      cible_id: data.userId,
      cible_email: target.user?.email ?? null,
      details: { permissions: data.permissions },
    });
    return { ok: true };
  });

/** Suspendre / réactiver un compte. */
export const setSuspension = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; suspendu: boolean; motif?: string }) => d)
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    if (data.userId === context.userId) throw new Error("Vous ne pouvez pas vous suspendre vous-même");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("user_status").upsert({
      user_id: data.userId,
      suspendu: data.suspendu,
      motif: data.motif ?? null,
      suspendu_par: context.userId,
      suspendu_at: data.suspendu ? new Date().toISOString() : null,
    });
    if (error) throw new Error(error.message);
    // Ban / unban côté auth (empêche vraiment la connexion)
    await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      ban_duration: data.suspendu ? "876000h" : "none",
    } as never);
    const { data: target } = await supabaseAdmin.auth.admin.getUserById(data.userId);
    await logAudit(supabaseAdmin, { id: context.userId, email: (context.claims as { email?: string })?.email }, {
      action: data.suspendu ? "compte.suspendu" : "compte.reactive",
      cible_type: "user",
      cible_id: data.userId,
      cible_email: target.user?.email ?? null,
      details: { motif: data.motif ?? null },
    });
    return { ok: true };
  });

/** Créer une invitation (envoie un magic link + enregistre l'invitation). */
export const creerInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    email: string;
    role: AppRole;
    permissions: Permission[];
    message?: string;
    jours_validite?: number;
  }) => d)
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const jours = Math.min(Math.max(data.jours_validite ?? 7, 1), 30);
    const expire_at = new Date(Date.now() + jours * 86_400_000).toISOString();

    const { data: invit, error: invitErr } = await supabaseAdmin
      .from("invitations")
      .insert({
        email: data.email.toLowerCase(),
        role_propose: data.role,
        permissions: data.permissions,
        message: data.message ?? null,
        invite_par: context.userId,
        expire_at,
      })
      .select()
      .single();
    if (invitErr) throw new Error(invitErr.message);

    // Envoi de l'invitation Supabase Auth (magic link)
    const { error: mailErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      data: { invitation_id: invit.id, role_propose: data.role },
    });
    if (mailErr) console.warn("Envoi email invitation :", mailErr.message);

    await logAudit(supabaseAdmin, { id: context.userId, email: (context.claims as { email?: string })?.email }, {
      action: "invitation.creee",
      cible_type: "invitation",
      cible_id: invit.id,
      cible_email: data.email,
      details: { role: data.role, permissions: data.permissions, expire_at },
    });
    return { ok: true, invitation: invit };
  });

export const revoquerInvitation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: inv, error } = await supabaseAdmin
      .from("invitations")
      .update({ statut: "revoquee" })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    await logAudit(supabaseAdmin, { id: context.userId, email: (context.claims as { email?: string })?.email }, {
      action: "invitation.revoquee",
      cible_type: "invitation",
      cible_id: inv.id,
      cible_email: inv.email,
    });
    return { ok: true };
  });

export const listInvitations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("invitations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data;
  });

export const listAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data;
  });
