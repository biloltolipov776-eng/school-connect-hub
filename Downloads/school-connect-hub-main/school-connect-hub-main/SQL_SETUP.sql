# SQL скрипт для Supabase - Нужно выполнить в SQL Editor

## КОПИРУЙ И ВСТАВЬ ВСЕ ЭТО В Supabase SQL Editor:

/*=== 1. Функция для проверки учителя или админа ===*/
CREATE OR REPLACE FUNCTION public.is_teacher_or_admin(user_id UUID)
RETURNS BOOLEAN AS }
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role IN ('admin', 'teacher')
  );
END;
} LANGUAGE plpgsql SECURITY DEFINER;

/*=== 2. Таблица сообщений в лобби ===*/
CREATE TABLE IF NOT EXISTS public.lobby_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lobby_id UUID NOT NULL REFERENCES public.lobbies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lobby_messages_lobby_id ON public.lobby_messages(lobby_id);
CREATE INDEX IF NOT EXISTS idx_lobby_messages_user_id ON public.lobby_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_lobby_messages_created_at ON public.lobby_messages(created_at);

/*=== 3. Таблица участников лобби ===*/
CREATE TABLE IF NOT EXISTS public.lobby_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lobby_id UUID NOT NULL REFERENCES public.lobbies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  student_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(lobby_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_lobby_participants_lobby_id ON public.lobby_participants(lobby_id);
CREATE INDEX IF NOT EXISTS idx_lobby_participants_user_id ON public.lobby_participants(user_id);

/*=== 4. Таблица оценок в лобби ===*/
CREATE TABLE IF NOT EXISTS public.lobby_grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lobby_id UUID NOT NULL REFERENCES public.lobbies(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES public.lobby_participants(id) ON DELETE CASCADE,
  grade FLOAT,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lobby_grades_lobby_id ON public.lobby_grades(lobby_id);
CREATE INDEX IF NOT EXISTS idx_lobby_grades_participant_id ON public.lobby_grades(participant_id);

/*=== 5. RLS ПОЛИТИКИ ===*/

/* Сообщения: всем видно, могут писать только авторизованные */
ALTER TABLE public.lobby_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lobby_messages_select ON public.lobby_messages;
CREATE POLICY lobby_messages_select ON public.lobby_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lobby_participants 
      WHERE lobby_id = lobby_messages.lobby_id 
      AND user_id = auth.uid()
    )
    OR is_teacher_or_admin(auth.uid())
  );

DROP POLICY IF EXISTS lobby_messages_insert ON public.lobby_messages;
CREATE POLICY lobby_messages_insert ON public.lobby_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.lobby_participants 
      WHERE lobby_id = lobby_messages.lobby_id 
      AND user_id = auth.uid()
    )
  );

/* Участники: видят свое лобби и админ всё видит */
ALTER TABLE public.lobby_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lobby_participants_select ON public.lobby_participants;
CREATE POLICY lobby_participants_select ON public.lobby_participants
  FOR SELECT USING (
    user_id = auth.uid() OR is_teacher_or_admin(auth.uid())
  );

DROP POLICY IF EXISTS lobby_participants_insert ON public.lobby_participants;
CREATE POLICY lobby_participants_insert ON public.lobby_participants
  FOR INSERT WITH CHECK (
    is_teacher_or_admin(auth.uid())
  );

DROP POLICY IF EXISTS lobby_participants_delete ON public.lobby_participants;
CREATE POLICY lobby_participants_delete ON public.lobby_participants
  FOR DELETE USING (
    is_teacher_or_admin(auth.uid())
  );

/* Оценки: учители могут редактировать, ученики видят только свои */
ALTER TABLE public.lobby_grades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lobby_grades_select ON public.lobby_grades;
CREATE POLICY lobby_grades_select ON public.lobby_grades
  FOR SELECT USING (
    is_teacher_or_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.lobby_participants p
      WHERE p.id = participant_id AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS lobby_grades_insert ON public.lobby_grades;
CREATE POLICY lobby_grades_insert ON public.lobby_grades
  FOR INSERT WITH CHECK (
    is_teacher_or_admin(auth.uid())
  );

DROP POLICY IF EXISTS lobby_grades_update ON public.lobby_grades;
CREATE POLICY lobby_grades_update ON public.lobby_grades
  FOR UPDATE USING (
    is_teacher_or_admin(auth.uid())
  );

DROP POLICY IF EXISTS lobby_grades_delete ON public.lobby_grades;
CREATE POLICY lobby_grades_delete ON public.lobby_grades
  FOR DELETE USING (
    is_teacher_or_admin(auth.uid())
  );

/*=== 6. ОБНОВИТЬ АДМИНА (опционально) ===*/
-- Если нужно сделать кого-то админом, раскомментируй и поменяй email:
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE email = 'your_email@example.com';
