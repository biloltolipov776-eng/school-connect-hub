
GRANT SELECT ON public.templates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.templates TO authenticated;
GRANT ALL ON public.templates TO service_role;

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "templates_select" ON public.templates;
CREATE POLICY "templates_select" ON public.templates FOR SELECT
USING (
  status = 'approved'
  OR auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'teacher')
);

DROP POLICY IF EXISTS "templates_insert" ON public.templates;
CREATE POLICY "templates_insert" ON public.templates FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "templates_update" ON public.templates;
CREATE POLICY "templates_update" ON public.templates FOR UPDATE
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'teacher')
);

DROP POLICY IF EXISTS "templates_delete" ON public.templates;
CREATE POLICY "templates_delete" ON public.templates FOR DELETE
USING (
  auth.uid() = user_id
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'teacher')
);

NOTIFY pgrst, 'reload schema';
