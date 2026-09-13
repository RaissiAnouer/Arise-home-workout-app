-- ============================================================
-- 004_progression_engine.sql
-- Arise Adaptive Progression Engine Tables
-- ============================================================

-- ── workout_sessions ────────────────────────────────────────
-- One row per completed workout session
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_day_number       INTEGER NOT NULL,
  focus                 TEXT NOT NULL,
  duration_seconds      INTEGER DEFAULT 0,
  total_volume_kg       NUMERIC(10, 2) DEFAULT 0,
  completion_percentage NUMERIC(5, 2) DEFAULT 0,  -- 0-100
  workout_score         NUMERIC(5, 2) DEFAULT 0,  -- 0-100, computed post-session
  xp_earned             INTEGER DEFAULT 0,
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ── set_logs ────────────────────────────────────────────────
-- One row per set performed
CREATE TABLE IF NOT EXISTS public.set_logs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id          UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id         UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  set_number          INTEGER NOT NULL,
  target_weight_kg    NUMERIC(7, 2) DEFAULT 0,
  actual_weight_kg    NUMERIC(7, 2) DEFAULT 0,
  target_reps         INTEGER DEFAULT 0,
  actual_reps         INTEGER DEFAULT 0,
  completed           BOOLEAN DEFAULT false,
  rpe                 INTEGER CHECK (rpe >= 1 AND rpe <= 10),  -- Rate of Perceived Exertion
  estimated_1rm       NUMERIC(7, 2),                           -- Epley formula, computed on save
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── exercise_mastery ─────────────────────────────────────────
-- Per-user, per-exercise progression tracking
CREATE TABLE IF NOT EXISTS public.exercise_mastery (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id               UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  total_reps                INTEGER DEFAULT 0,
  total_volume_kg           NUMERIC(12, 2) DEFAULT 0,
  sessions_count            INTEGER DEFAULT 0,
  mastery_xp                NUMERIC(8, 2) DEFAULT 0,   -- 0-1000
  mastery_tier              TEXT DEFAULT 'Novice',      -- Novice/Apprentice/Adept/Expert/Master
  personal_record_weight_kg NUMERIC(7, 2) DEFAULT 0,
  personal_record_reps      INTEGER DEFAULT 0,
  personal_record_volume    NUMERIC(10, 2) DEFAULT 0,  -- weight × reps in single set
  -- Adaptive prescription cache (updated after each session)
  last_prescribed_weight_kg NUMERIC(7, 2) DEFAULT 0,
  last_prescribed_sets      INTEGER DEFAULT 3,
  last_prescribed_reps      INTEGER DEFAULT 10,
  performance_trend         TEXT DEFAULT 'no_history', -- crushing/on_track/struggling/no_history
  last_performed_at         TIMESTAMPTZ,
  UNIQUE(user_id, exercise_id)
);

-- ── player_stats ─────────────────────────────────────────────
-- Derived scores used for rank calculation
CREATE TABLE IF NOT EXISTS public.player_stats (
  user_id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Component scores (0-100 each)
  strength_score        NUMERIC(5, 2) DEFAULT 0,
  endurance_score       NUMERIC(5, 2) DEFAULT 0,
  consistency_score     NUMERIC(5, 2) DEFAULT 0,
  mastery_score         NUMERIC(5, 2) DEFAULT 0,
  achievement_score     NUMERIC(5, 2) DEFAULT 0,
  -- Composite
  rank_score            NUMERIC(5, 2) DEFAULT 0,       -- weighted composite
  -- Streak tracking
  streak_days           INTEGER DEFAULT 0,
  longest_streak        INTEGER DEFAULT 0,
  last_workout_date     DATE,
  -- Key lift 1RMs (kg) — updated whenever user beats a PR
  bench_1rm             NUMERIC(7, 2) DEFAULT 0,
  squat_1rm             NUMERIC(7, 2) DEFAULT 0,
  deadlift_1rm          NUMERIC(7, 2) DEFAULT 0,
  overhead_press_1rm    NUMERIC(7, 2) DEFAULT 0,
  -- Volume tracking
  total_volume_all_time NUMERIC(14, 2) DEFAULT 0,
  total_workouts        INTEGER DEFAULT 0,
  -- Timestamps
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ── Add new columns to profiles ──────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS strength_score      NUMERIC(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS endurance_score     NUMERIC(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS consistency_score   NUMERIC(5, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_days         INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_workout_date   DATE;

-- ── RLS Policies ─────────────────────────────────────────────
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.set_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats     ENABLE ROW LEVEL SECURITY;

-- workout_sessions
CREATE POLICY "Users manage own sessions"
  ON public.workout_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- set_logs
CREATE POLICY "Users manage own set_logs"
  ON public.set_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- exercise_mastery
CREATE POLICY "Users manage own mastery"
  ON public.exercise_mastery FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- player_stats
CREATE POLICY "Users manage own player_stats"
  ON public.player_stats FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sessions_user       ON public.workout_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_set_logs_session    ON public.set_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_set_logs_user_ex    ON public.set_logs(user_id, exercise_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mastery_user        ON public.exercise_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_mastery_user_ex     ON public.exercise_mastery(user_id, exercise_id);

-- ── Trigger: auto-create player_stats row on new user ─────────
CREATE OR REPLACE FUNCTION public.handle_new_player_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.player_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fires whenever a new profile is created
CREATE TRIGGER on_profile_created_create_player_stats
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_player_stats();
