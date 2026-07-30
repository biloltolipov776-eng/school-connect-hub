ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS keywords text,
  ADD COLUMN IF NOT EXISTS og_image text,
  ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true;
NOTIFY pgrst, 'reload schema';