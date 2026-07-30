
-- =========================================================================
-- 1. PROFILES: add missing columns
-- =========================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'student';

-- Backfill: user_id = id (profiles.id == auth.users.id by convention here)
UPDATE public.profiles SET user_id = id WHERE user_id IS NULL;
UPDATE public.profiles SET display_name = COALESCE(display_name, full_name);

ALTER TABLE public.profiles ALTER COLUMN user_id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_key ON public.profiles(user_id);

-- Trigger to keep user_id == id
CREATE OR REPLACE FUNCTION public.sync_profile_user_id()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.user_id IS NULL THEN NEW.user_id := NEW.id; END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS sync_profile_user_id_trg ON public.profiles;
CREATE TRIGGER sync_profile_user_id_trg
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_profile_user_id();

-- Sync role column from user_roles for already-assigned roles
UPDATE public.profiles p
SET role = ur.role::text
FROM public.user_roles ur
WHERE ur.user_id = p.id;

-- =========================================================================
-- 2. SITES
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subdomain text NOT NULL UNIQUE,
  title text,
  html_code text DEFAULT '',
  css_code text DEFAULT '',
  js_code text DEFAULT '',
  full_html text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.sites TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sites TO authenticated;
GRANT ALL ON public.sites TO service_role;

ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sites public read" ON public.sites
  FOR SELECT USING (true);

CREATE POLICY "sites owner insert" ON public.sites
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sites owner update" ON public.sites
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "sites owner delete" ON public.sites
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- 3. LOBBIES
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.lobbies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  title text NOT NULL,
  code text NOT NULL UNIQUE,
  language text NOT NULL DEFAULT 'html',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lobbies TO authenticated;
GRANT ALL ON public.lobbies TO service_role;

ALTER TABLE public.lobbies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lobbies read auth" ON public.lobbies
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "lobbies teacher insert" ON public.lobbies
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = teacher_id AND (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin')));

CREATE POLICY "lobbies teacher update" ON public.lobbies
  FOR UPDATE TO authenticated
  USING (auth.uid() = teacher_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = teacher_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "lobbies teacher delete" ON public.lobbies
  FOR DELETE TO authenticated
  USING (auth.uid() = teacher_id OR public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- 4. LOBBY_PARTICIPANTS
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.lobby_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id uuid NOT NULL REFERENCES public.lobbies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  nickname text NOT NULL,
  student_code text DEFAULT '',
  is_online boolean NOT NULL DEFAULT false,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(lobby_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lobby_participants TO authenticated;
GRANT ALL ON public.lobby_participants TO service_role;

ALTER TABLE public.lobby_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lp read" ON public.lobby_participants
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.lobbies l WHERE l.id = lobby_id AND l.teacher_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'teacher')
  );

CREATE POLICY "lp insert" ON public.lobby_participants
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'teacher')
    OR EXISTS (SELECT 1 FROM public.lobbies l WHERE l.id = lobby_id AND l.teacher_id = auth.uid())
  );

CREATE POLICY "lp update" ON public.lobby_participants
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.lobbies l WHERE l.id = lobby_id AND l.teacher_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.lobbies l WHERE l.id = lobby_id AND l.teacher_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "lp delete" ON public.lobby_participants
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.lobbies l WHERE l.id = lobby_id AND l.teacher_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

ALTER PUBLICATION supabase_realtime ADD TABLE public.lobby_participants;
ALTER TABLE public.lobby_participants REPLICA IDENTITY FULL;

-- =========================================================================
-- 5. LOBBY_GRADES
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.lobby_grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id uuid NOT NULL REFERENCES public.lobbies(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  teacher_id uuid NOT NULL,
  grade smallint,
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lobby_grades TO authenticated;
GRANT ALL ON public.lobby_grades TO service_role;

ALTER TABLE public.lobby_grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lg read" ON public.lobby_grades
  FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR teacher_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "lg teacher write" ON public.lobby_grades
  FOR INSERT TO authenticated
  WITH CHECK (teacher_id = auth.uid() AND (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin')));

CREATE POLICY "lg teacher update" ON public.lobby_grades
  FOR UPDATE TO authenticated
  USING (teacher_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "lg teacher delete" ON public.lobby_grades
  FOR DELETE TO authenticated
  USING (teacher_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- 6. RPC: get_admin_users()
-- =========================================================================
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  display_name text,
  avatar_url text,
  role text,
  last_sign_in_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher')
          OR (SELECT email FROM auth.users WHERE id = auth.uid()) = 'alfacompofficial@gmail.com') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::text,
    u.created_at,
    COALESCE(p.display_name, p.full_name) AS display_name,
    p.avatar_url,
    CASE
      WHEN u.email = 'alfacompofficial@gmail.com' THEN 'owner'
      WHEN EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'admin') THEN 'admin'
      WHEN EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role = 'teacher') THEN 'teacher'
      ELSE 'student'
    END AS role,
    u.last_sign_in_at
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  ORDER BY u.created_at DESC;
END $$;

GRANT EXECUTE ON FUNCTION public.get_admin_users() TO authenticated;

-- =========================================================================
-- 7. RPC: update_user_role(target_user_id uuid, new_role text)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.update_user_role(target_user_id uuid, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_email text;
  target_email text;
BEGIN
  SELECT email INTO caller_email FROM auth.users WHERE id = auth.uid();
  SELECT email INTO target_email FROM auth.users WHERE id = target_user_id;

  -- Only owner OR admin can change roles
  IF caller_email <> 'alfacompofficial@gmail.com' AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  -- Cannot change owner role
  IF target_email = 'alfacompofficial@gmail.com' THEN
    RAISE EXCEPTION 'Cannot modify owner role';
  END IF;

  IF new_role NOT IN ('student', 'teacher', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;

  -- Wipe and re-set
  DELETE FROM public.user_roles WHERE user_id = target_user_id;

  IF new_role IN ('teacher', 'admin') THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (target_user_id, new_role::app_role);
  END IF;

  -- Mirror to profiles.role
  UPDATE public.profiles SET role = new_role WHERE id = target_user_id;
END $$;

GRANT EXECUTE ON FUNCTION public.update_user_role(uuid, text) TO authenticated;

-- =========================================================================
-- 8. Give the owner the admin role so admin panel works immediately
-- =========================================================================
INSERT INTO public.user_roles(user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
WHERE email = 'alfacompofficial@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

UPDATE public.profiles p
SET role = 'admin'
FROM auth.users u
WHERE u.id = p.id AND u.email = 'alfacompofficial@gmail.com';
