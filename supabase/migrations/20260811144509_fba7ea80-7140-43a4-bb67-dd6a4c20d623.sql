REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.produits_public FROM authenticated;
REVOKE ALL ON public.produits_public FROM PUBLIC, anon;
GRANT SELECT ON public.produits_public TO authenticated;
GRANT ALL ON public.produits_public TO service_role;