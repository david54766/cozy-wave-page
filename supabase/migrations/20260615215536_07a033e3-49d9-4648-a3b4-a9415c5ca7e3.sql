
CREATE TYPE public.ai_generation_status AS ENUM ('draft','generated','converted','archived','failed');

-- 1) ai_course_generations
CREATE TABLE public.ai_course_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled course outline',
  topic TEXT NOT NULL,
  audience TEXT,
  skill_level TEXT,
  desired_outcome TEXT,
  sections_count INT NOT NULL DEFAULT 4,
  lessons_per_section INT NOT NULL DEFAULT 3,
  tone TEXT,
  additional_instructions TEXT,
  status public.ai_generation_status NOT NULL DEFAULT 'generated',
  generated_outline_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_course_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_course_generations TO authenticated;
GRANT ALL ON public.ai_course_generations TO service_role;
ALTER TABLE public.ai_course_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage ai_course_generations"
  ON public.ai_course_generations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'platform_admin'));

-- 2) ai_lesson_generations
CREATE TABLE public.ai_lesson_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID,
  section_id UUID,
  lesson_id UUID,
  topic TEXT NOT NULL,
  audience TEXT,
  tone TEXT,
  desired_length TEXT,
  key_points TEXT,
  call_to_action TEXT,
  include_summary BOOLEAN NOT NULL DEFAULT true,
  include_quiz BOOLEAN NOT NULL DEFAULT false,
  status public.ai_generation_status NOT NULL DEFAULT 'generated',
  generated_content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_lesson_generations TO authenticated;
GRANT ALL ON public.ai_lesson_generations TO service_role;
ALTER TABLE public.ai_lesson_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage ai_lesson_generations"
  ON public.ai_lesson_generations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'platform_admin'));

-- 3) ai_quiz_generations
CREATE TABLE public.ai_quiz_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID,
  lesson_id UUID,
  topic TEXT NOT NULL,
  question_count INT NOT NULL DEFAULT 5,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  multiple_choice BOOLEAN NOT NULL DEFAULT true,
  status public.ai_generation_status NOT NULL DEFAULT 'generated',
  generated_quiz_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_quiz_generations TO authenticated;
GRANT ALL ON public.ai_quiz_generations TO service_role;
ALTER TABLE public.ai_quiz_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage ai_quiz_generations"
  ON public.ai_quiz_generations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'platform_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'platform_admin'));

-- Reuse update_updated_at_column trigger if exists
CREATE TRIGGER trg_ai_course_generations_updated BEFORE UPDATE ON public.ai_course_generations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ai_lesson_generations_updated BEFORE UPDATE ON public.ai_lesson_generations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ai_quiz_generations_updated BEFORE UPDATE ON public.ai_quiz_generations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
