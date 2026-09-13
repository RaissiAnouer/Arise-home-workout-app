-- 007_movement_patterns_blueprint.sql
-- Adds efficiency_score, min_experience_level, fatigue_cost to exercises.
-- Backfills the movement_patterns table and maps exercises to patterns.

-- ── New columns on exercises ──────────────────────────────────────────────

ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS efficiency_score INTEGER NOT NULL DEFAULT 50;

ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS min_experience_level VARCHAR(20) NOT NULL DEFAULT 'beginner';

ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS fatigue_cost VARCHAR(10) NOT NULL DEFAULT 'medium';

-- ── Seed movement_patterns table with canonical taxonomy ──────────────────

INSERT INTO public.movement_patterns (name) VALUES
  ('horizontal_press'),
  ('incline_press'),
  ('vertical_press'),
  ('horizontal_pull'),
  ('vertical_pull'),
  ('squat'),
  ('hinge'),
  ('lunge'),
  ('lateral_delt_isolation'),
  ('rear_delt_isolation'),
  ('bicep_isolation'),
  ('tricep_isolation'),
  ('calf_isolation'),
  ('core_flexion'),
  ('core_rotation'),
  ('core_anti_extension'),
  ('hip_thrust'),
  ('chest_fly'),
  ('pullover'),
  ('shrug'),
  ('wrist_forearm'),
  ('glute_isolation'),
  ('leg_extension_isolation'),
  ('leg_curl_isolation')
ON CONFLICT (name) DO NOTHING;

-- ── Backfill movement_pattern_id based on exercise name heuristics ────────
-- Each UPDATE maps exercises by name pattern to the canonical movement_pattern

-- Horizontal Press
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'horizontal_press')
WHERE (name ILIKE '%bench press%' OR name ILIKE '%push up%' OR name ILIKE '%push-up%' OR name ILIKE '%pushup%'
       OR name ILIKE '%chest press%' OR name ILIKE '%floor press%' OR name ILIKE '%close grip bench%')
  AND (name NOT ILIKE '%incline%' AND name NOT ILIKE '%decline%');

-- Incline Press
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'incline_press')
WHERE name ILIKE '%incline%press%' OR name ILIKE '%incline%push%';

-- Vertical Press
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'vertical_press')
WHERE name ILIKE '%overhead press%' OR name ILIKE '%shoulder press%' OR name ILIKE '%military press%'
   OR name ILIKE '%arnold press%' OR name ILIKE '%pike push%' OR name ILIKE '%handstand push%';

-- Horizontal Pull
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'horizontal_pull')
WHERE name ILIKE '%row%' OR name ILIKE '%inverted row%' OR name ILIKE '%cable row%' OR name ILIKE '%seated row%'
   OR name ILIKE '%bent over row%' OR name ILIKE '%t-bar row%' OR name ILIKE '%pendlay row%';

-- Vertical Pull
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'vertical_pull')
WHERE name ILIKE '%pull up%' OR name ILIKE '%pull-up%' OR name ILIKE '%pullup%'
   OR name ILIKE '%chin up%' OR name ILIKE '%chin-up%' OR name ILIKE '%chinup%'
   OR name ILIKE '%lat pulldown%' OR name ILIKE '%lat pull%';

-- Squat
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'squat')
WHERE (name ILIKE '%squat%' OR name ILIKE '%leg press%' OR name ILIKE '%hack squat%')
  AND name NOT ILIKE '%pistol%';

-- Hinge
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'hinge')
WHERE name ILIKE '%deadlift%' OR name ILIKE '%rdl%' OR name ILIKE '%romanian%'
   OR name ILIKE '%good morning%' OR name ILIKE '%nordic curl%' OR name ILIKE '%back extension%'
   OR name ILIKE '%hyperextension%' OR name ILIKE '%kettlebell swing%';

-- Lunge
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'lunge')
WHERE name ILIKE '%lunge%' OR name ILIKE '%split squat%' OR name ILIKE '%step up%'
   OR name ILIKE '%step-up%' OR name ILIKE '%pistol squat%' OR name ILIKE '%bulgarian%';

-- Hip Thrust
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'hip_thrust')
WHERE name ILIKE '%hip thrust%' OR name ILIKE '%glute bridge%';

-- Lateral Delt Isolation
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'lateral_delt_isolation')
WHERE name ILIKE '%lateral raise%' OR name ILIKE '%side raise%' OR name ILIKE '%upright row%';

-- Rear Delt Isolation
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'rear_delt_isolation')
WHERE name ILIKE '%rear delt%' OR name ILIKE '%reverse fly%' OR name ILIKE '%face pull%';

-- Bicep Isolation
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'bicep_isolation')
WHERE name ILIKE '%curl%' AND (name ILIKE '%bicep%' OR name ILIKE '%hammer%' OR name ILIKE '%preacher%'
   OR name ILIKE '%concentration%' OR name ILIKE '%ez bar%' OR name ILIKE '%barbell curl%'
   OR name ILIKE '%dumbbell curl%' OR name ILIKE '%incline curl%' OR name ILIKE '%spider curl%');

-- Tricep Isolation
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'tricep_isolation')
WHERE name ILIKE '%tricep%' OR name ILIKE '%pushdown%' OR name ILIKE '%skull crush%'
   OR name ILIKE '%overhead extension%' OR name ILIKE '%kickback%' OR name ILIKE '%dip%';

-- Chest Fly
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'chest_fly')
WHERE name ILIKE '%fly%' OR name ILIKE '%flye%' OR name ILIKE '%pec deck%' OR name ILIKE '%crossover%';

-- Shrug
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'shrug')
WHERE name ILIKE '%shrug%';

-- Calf Isolation
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'calf_isolation')
WHERE name ILIKE '%calf raise%' OR name ILIKE '%calf press%' OR name ILIKE '%toe raise%';

-- Core Flexion
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'core_flexion')
WHERE (name ILIKE '%crunch%' OR name ILIKE '%sit up%' OR name ILIKE '%sit-up%' OR name ILIKE '%leg raise%'
   OR name ILIKE '%v-up%' OR name ILIKE '%knee raise%' OR name ILIKE '%hanging%raise%')
  AND movement_pattern_id IS NULL;

-- Core Rotation
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'core_rotation')
WHERE (name ILIKE '%russian twist%' OR name ILIKE '%woodchop%' OR name ILIKE '%wood chop%'
   OR name ILIKE '%oblique%' OR name ILIKE '%cable twist%')
  AND movement_pattern_id IS NULL;

-- Core Anti-Extension
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'core_anti_extension')
WHERE (name ILIKE '%plank%' OR name ILIKE '%ab wheel%' OR name ILIKE '%ab rollout%'
   OR name ILIKE '%dead bug%' OR name ILIKE '%bird dog%' OR name ILIKE '%hollow%')
  AND movement_pattern_id IS NULL;

-- Leg Extension Isolation
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'leg_extension_isolation')
WHERE name ILIKE '%leg extension%' AND movement_pattern_id IS NULL;

-- Leg Curl Isolation
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'leg_curl_isolation')
WHERE (name ILIKE '%leg curl%' OR name ILIKE '%hamstring curl%') AND movement_pattern_id IS NULL;

-- Wrist / Forearm
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'wrist_forearm')
WHERE (name ILIKE '%wrist curl%' OR name ILIKE '%forearm%' OR name ILIKE '%grip%') AND movement_pattern_id IS NULL;

-- Pullover
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'pullover')
WHERE name ILIKE '%pullover%' AND movement_pattern_id IS NULL;

-- ── Backfill efficiency_score for top-tier research-backed exercises ──────

-- Compound barbell big lifts — highest tier
UPDATE public.exercises SET efficiency_score = 95 WHERE name ILIKE '%barbell bench press%' AND name NOT ILIKE '%incline%';
UPDATE public.exercises SET efficiency_score = 98 WHERE name ILIKE '%barbell squat%' OR name ILIKE '%back squat%';
UPDATE public.exercises SET efficiency_score = 97 WHERE name ILIKE '%deadlift%' AND name NOT ILIKE '%romanian%' AND name NOT ILIKE '%rdl%' AND name NOT ILIKE '%stiff%';
UPDATE public.exercises SET efficiency_score = 95 WHERE name ILIKE '%pull up%' OR name ILIKE '%pull-up%' OR name ILIKE '%pullup%';
UPDATE public.exercises SET efficiency_score = 90 WHERE name ILIKE '%chin up%' OR name ILIKE '%chin-up%';
UPDATE public.exercises SET efficiency_score = 92 WHERE name ILIKE '%barbell row%' OR name ILIKE '%bent over row%';

-- Incline/stretch-mediated — very high
UPDATE public.exercises SET efficiency_score = 93 WHERE name ILIKE '%incline dumbbell press%' OR name ILIKE '%incline db press%';
UPDATE public.exercises SET efficiency_score = 88 WHERE name ILIKE '%incline barbell press%';
UPDATE public.exercises SET efficiency_score = 90 WHERE name ILIKE '%overhead press%' OR name ILIKE '%military press%';
UPDATE public.exercises SET efficiency_score = 88 WHERE name ILIKE '%dumbbell overhead press%' OR name ILIKE '%seated dumbbell press%';

-- Hinge/posterior — high
UPDATE public.exercises SET efficiency_score = 90 WHERE name ILIKE '%romanian deadlift%' OR name ILIKE '%rdl%';
UPDATE public.exercises SET efficiency_score = 88 WHERE name ILIKE '%hip thrust%';
UPDATE public.exercises SET efficiency_score = 85 WHERE name ILIKE '%nordic curl%';
UPDATE public.exercises SET efficiency_score = 82 WHERE name ILIKE '%good morning%';

-- Machine/cable compounds — solid
UPDATE public.exercises SET efficiency_score = 78 WHERE name ILIKE '%leg press%';
UPDATE public.exercises SET efficiency_score = 75 WHERE name ILIKE '%lat pulldown%';
UPDATE public.exercises SET efficiency_score = 75 WHERE name ILIKE '%cable row%' OR name ILIKE '%seated row%';
UPDATE public.exercises SET efficiency_score = 72 WHERE name ILIKE '%dumbbell row%';

-- Bodyweight compounds
UPDATE public.exercises SET efficiency_score = 88 WHERE name ILIKE '%push up%' OR name ILIKE '%push-up%' OR name ILIKE '%pushup%';
UPDATE public.exercises SET efficiency_score = 80 WHERE name ILIKE '%dip%';
UPDATE public.exercises SET efficiency_score = 82 WHERE name ILIKE '%lunge%' OR name ILIKE '%bulgarian%';

-- Isolation — moderate
UPDATE public.exercises SET efficiency_score = 65 WHERE name ILIKE '%bicep curl%' OR name ILIKE '%barbell curl%';
UPDATE public.exercises SET efficiency_score = 65 WHERE name ILIKE '%hammer curl%';
UPDATE public.exercises SET efficiency_score = 62 WHERE name ILIKE '%tricep pushdown%' OR name ILIKE '%cable pushdown%';
UPDATE public.exercises SET efficiency_score = 60 WHERE name ILIKE '%lateral raise%';
UPDATE public.exercises SET efficiency_score = 60 WHERE name ILIKE '%face pull%';
UPDATE public.exercises SET efficiency_score = 55 WHERE name ILIKE '%calf raise%';

-- Core
UPDATE public.exercises SET efficiency_score = 70 WHERE name ILIKE '%plank%' AND efficiency_score = 50;
UPDATE public.exercises SET efficiency_score = 68 WHERE name ILIKE '%cable crunch%' AND efficiency_score = 50;
UPDATE public.exercises SET efficiency_score = 65 WHERE name ILIKE '%hanging%raise%' AND efficiency_score = 50;
UPDATE public.exercises SET efficiency_score = 62 WHERE name ILIKE '%ab wheel%' OR name ILIKE '%ab rollout%';

-- ── Backfill fatigue_cost ─────────────────────────────────────────────────

UPDATE public.exercises SET fatigue_cost = 'high'
WHERE name ILIKE '%deadlift%' OR name ILIKE '%squat%' OR name ILIKE '%barbell row%';

UPDATE public.exercises SET fatigue_cost = 'low'
WHERE name ILIKE '%curl%' OR name ILIKE '%raise%' OR name ILIKE '%fly%' OR name ILIKE '%flye%'
   OR name ILIKE '%calf%' OR name ILIKE '%shrug%' OR name ILIKE '%plank%' OR name ILIKE '%face pull%';

-- Everything else stays at default 'medium'

-- ── Backfill min_experience_level ─────────────────────────────────────────

UPDATE public.exercises SET min_experience_level = 'advanced'
WHERE name ILIKE '%nordic curl%' OR name ILIKE '%pistol squat%' OR name ILIKE '%muscle up%'
   OR name ILIKE '%handstand%' OR name ILIKE '%snatch%' OR name ILIKE '%clean and jerk%';

UPDATE public.exercises SET min_experience_level = 'intermediate'
WHERE name ILIKE '%deadlift%' OR name ILIKE '%barbell squat%' OR name ILIKE '%back squat%'
   OR name ILIKE '%barbell row%' OR name ILIKE '%overhead press%' OR name ILIKE '%military press%'
   OR name ILIKE '%dip%' OR name ILIKE '%pull up%' OR name ILIKE '%pull-up%';

-- Everything else stays at default 'beginner'
