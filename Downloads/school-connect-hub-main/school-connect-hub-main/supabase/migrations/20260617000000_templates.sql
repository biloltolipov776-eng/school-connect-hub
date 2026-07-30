-- =========================================================================
-- TEMPLATES TABLE & STORAGE
-- =========================================================================

-- 1. Table
CREATE TABLE IF NOT EXISTS public.templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',

  type text NOT NULL DEFAULT 'html', -- 'html' | 'react'

  -- Preview URL for the iframe (required for both now)
  preview_url text DEFAULT '',
  
  -- Storage path for the uploaded code ZIP
  file_path text DEFAULT '',

  status text NOT NULL DEFAULT 'pending',

  thumbnail_url text DEFAULT '',
  tags text[] DEFAULT '{}',
  author_name text DEFAULT '',

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS templates_status_idx ON public.templates(status);
CREATE INDEX IF NOT EXISTS templates_user_id_idx ON public.templates(user_id);

-- Permissions
GRANT SELECT ON public.templates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.templates TO authenticated;
GRANT ALL ON public.templates TO service_role;

-- Enable RLS
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- SELECT: approved templates visible to everyone; all templates visible to admin
CREATE POLICY "templates_select" ON public.templates
  FOR SELECT USING (
    status = 'approved'
    OR auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
  );

-- INSERT: any authenticated user can submit
CREATE POLICY "templates_insert" ON public.templates
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: only admin or the owner
CREATE POLICY "templates_update" ON public.templates
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id)
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

-- DELETE: only admin
CREATE POLICY "templates_delete" ON public.templates
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_templates_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS templates_updated_at_trg ON public.templates;
CREATE TRIGGER templates_updated_at_trg
  BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION public.update_templates_updated_at();

-- 2. Storage Bucket for template codes
INSERT INTO storage.buckets (id, name, public)
VALUES ('templates_code', 'templates_code', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "templates_code_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'templates_code');

CREATE POLICY "templates_code_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'templates_code');

CREATE POLICY "templates_code_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'templates_code' AND public.has_role(auth.uid(), 'admin'));
