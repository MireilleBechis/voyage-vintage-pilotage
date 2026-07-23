-- Restreindre l'exécution des SECURITY DEFINER helpers : jamais accessibles à anon
REVOKE EXECUTE ON FUNCTION public.has_role_name(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, public.role_permission) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role_name(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, public.role_permission) TO authenticated, service_role;

-- Idem pour has_role existant (pas exposé à anon)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Retirer l'accès de la vue produits_public à anon (déjà GRANT authenticated ci-dessus,
-- mais on supprime tout accès anon éventuel hérité)
REVOKE ALL ON public.produits_public FROM anon, public;
GRANT SELECT ON public.produits_public TO authenticated;

COMMENT ON VIEW public.produits_public IS
  'Catalogue invité — vue en mode SECURITY DEFINER (intentionnel) : bypass la RLS de produits, projection sans champs financiers internes, filtrée par rôle et visibilité. Seul le rôle « authenticated » peut la lire. Ne jamais rétrograder en SECURITY INVOKER : cela obligerait à donner SELECT sur produits aux invités et exposerait toutes les colonnes internes.';