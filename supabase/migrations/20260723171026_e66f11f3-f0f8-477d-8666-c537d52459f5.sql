
-- Lock down SECURITY DEFINER / helper functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.marge_reelle(public.produits) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.marge_reelle(public.produits) TO authenticated;

-- Storage RLS: users manage only files under their uid/ prefix
CREATE POLICY "photos_read_own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'produit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "photos_insert_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'produit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "photos_update_own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'produit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "photos_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'produit-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "docs_read_own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'produit-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "docs_insert_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'produit-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "docs_update_own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'produit-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "docs_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'produit-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
