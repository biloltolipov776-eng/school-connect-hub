CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id text NOT NULL,
  lesson_id text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  last_code text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id, lesson_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_progress TO authenticated;
GRANT ALL ON public.lesson_progress TO service_role;

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lp own select" ON public.lesson_progress
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "lp own insert" ON public.lesson_progress
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "lp own update" ON public.lesson_progress
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "lp own delete" ON public.lesson_progress
  FOR DELETE TO authenticated USING (user_id = auth.uid());