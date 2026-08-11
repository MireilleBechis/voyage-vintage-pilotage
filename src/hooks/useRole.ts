import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole, Permission } from "@/lib/produits";

/**
 * Récupère les rôles et permissions de l'utilisateur connecté.
 * - `roles` : tableau des rôles présents dans `user_roles` (peut être vide).
 * - `permissions` : tableau des permissions granulaires (admin implicite → toutes).
 * - Helpers `is*` / `has*` pour gate UI.
 * Ne remplace jamais la RLS : c'est uniquement pour l'affichage.
 */
export function useRole() {
  const q = useQuery({
    queryKey: ["me-role"],
    queryFn: async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) return { roles: [] as AppRole[], permissions: [] as Permission[] };
      const [rolesRes, permsRes] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", uid),
        supabase.from("user_permissions").select("permission").eq("user_id", uid),
      ]);
      const roles = ((rolesRes.data ?? []) as Array<{ role: AppRole }>).map((r) => r.role);
      const permissions = ((permsRes.data ?? []) as Array<{ permission: Permission }>).map((p) => p.permission);
      return { roles, permissions };
    },
    staleTime: 5 * 60 * 1000,
  });

  const roles = q.data?.roles ?? [];
  const permissions = q.data?.permissions ?? [];
  const isAdmin = roles.includes("admin");
  const isCollab = roles.includes("collaborateur");
  const isInvitePart = roles.includes("invite_particulier");
  const isInvitePro = roles.includes("invite_pro");
  const isInvite = isInvitePart || isInvitePro;
  const isInterne = isAdmin || isCollab;

  const has = (perm: Permission) => isAdmin || permissions.includes(perm);

  return {
    isLoading: q.isLoading,
    roles,
    permissions,
    isAdmin,
    isCollab,
    isInvite,
    isInvitePart,
    isInvitePro,
    isInterne,
    has,
  };
}
