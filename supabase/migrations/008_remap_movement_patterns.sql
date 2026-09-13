-- 008_remap_movement_patterns.sql
-- Remap exercises from broad patterns (Push, Pull, etc.) to fine-grained patterns
-- (horizontal_press, vertical_press, bicep_isolation, etc.)
-- This forces updates even when movement_pattern_id is already set.

-- ── Horizontal Press ──────────────────────────────────────────────────────
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'horizontal_press')
WHERE (name ILIKE '%bench press%' OR name ILIKE '%push up%' OR name ILIKE '%push-up%' OR name ILIKE '%pushup%'
       OR name ILIKE '%chest press%' OR name ILIKE '%floor press%' OR name ILIKE '%close grip bench%')
  AND name NOT ILIKE '%incline%' AND name NOT ILIKE '%decline%';

-- ── Incline Press ─────────────────────────────────────────────────────────
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'incline_press')
WHERE name ILIKE '%incline%press%' OR name ILIKE '%incline%push%';

-- ── Vertical Press ────────────────────────────────────────────────────────
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'vertical_press')
WHERE name ILIKE '%overhead press%' OR name ILIKE '%shoulder press%' OR name ILIKE '%military press%'
   OR name ILIKE '%arnold press%' OR name ILIKE '%pike push%' OR name ILIKE '%handstand push%';

-- ── Chest Fly ─────────────────────────────────────────────────────────────
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'chest_fly')
WHERE name ILIKE '%fly%' OR name ILIKE '%flye%' OR name ILIKE '%pec deck%' OR name ILIKE '%crossover%';

-- ── Vertical Pull ─────────────────────────────────────────────────────────
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'vertical_pull')
WHERE name ILIKE '%pull up%' OR name ILIKE '%pull-up%' OR name ILIKE '%pullup%'
   OR name ILIKE '%chin up%' OR name ILIKE '%chin-up%' OR name ILIKE '%chinup%'
   OR name ILIKE '%lat pulldown%' OR name ILIKE '%lat pull%';

-- ── Horizontal Pull ──────────────────────────────────────────────────────
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'horizontal_pull')
WHERE name ILIKE '%row%' OR name ILIKE '%inverted row%' OR name ILIKE '%cable row%' OR name ILIKE '%seated row%'
   OR name ILIKE '%bent over row%' OR name ILIKE '%t-bar row%' OR name ILIKE '%pendlay row%';

-- ── Squat ─────────────────────────────────────────────────────────────────
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'squat')
WHERE (name ILIKE '%squat%' OR name ILIKE '%leg press%' OR name ILIKE '%hack squat%')
  AND name NOT ILIKE '%pistol%' AND name NOT ILIKE '%split%';

-- ── Hinge ─────────────────────────────────────────────────────────────────
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'hinge')
WHERE name ILIKE '%deadlift%' OR name ILIKE '%rdl%' OR name ILIKE '%romanian%'
   OR name ILIKE '%good morning%' OR name ILIKE '%nordic curl%' OR name ILIKE '%back extension%'
   OR name ILIKE '%hyperextension%' OR name ILIKE '%kettlebell swing%';

-- ── Lunge ─────────────────────────────────────────────────────────────────
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'lunge')
WHERE name ILIKE '%lunge%' OR name ILIKE '%split squat%' OR name ILIKE '%step up%'
   OR name ILIKE '%step-up%' OR name ILIKE '%pistol squat%' OR name ILIKE '%bulgarian%';

-- ── Hip Thrust ────────────────────────────────────────────────────────────
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'hip_thrust')
WHERE name ILIKE '%hip thrust%' OR name ILIKE '%glute bridge%' OR name ILIKE '%hip extension%';

-- ── Lateral Delt Isolation ────────────────────────────────────────────────
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'lateral_delt_isolation')
WHERE name ILIKE '%lateral raise%' OR name ILIKE '%side raise%' OR name ILIKE '%upright row%';

-- ── Rear Delt Isolation ──────────────────────────────────────────────────
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'rear_delt_isolation')
WHERE name ILIKE '%rear delt%' OR name ILIKE '%reverse fly%' OR name ILIKE '%face pull%';

-- ── Bicep Isolation ──────────────────────────────────────────────────────
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'bicep_isolation')
WHERE name ILIKE '%curl%' AND NOT (name ILIKE '%leg curl%' OR name ILIKE '%hamstring curl%' OR name ILIKE '%nordic curl%');

-- ── Tricep Isolation ─────────────────────────────────────────────────────
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'tricep_isolation')
WHERE name ILIKE '%tricep%' OR name ILIKE '%pushdown%' OR name ILIKE '%skull crush%'
   OR name ILIKE '%overhead extension%' OR name ILIKE '%kickback%'
   OR (name ILIKE '%dip%' AND name NOT ILIKE '%hip%');

-- ── Calf Isolation ───────────────────────────────────────────────────────
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'calf_isolation')
WHERE name ILIKE '%calf raise%' OR name ILIKE '%calf press%' OR name ILIKE '%toe raise%';

-- ── Core Flexion ─────────────────────────────────────────────────────────
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'core_flexion')
WHERE name ILIKE '%crunch%' OR name ILIKE '%sit up%' OR name ILIKE '%sit-up%' OR name ILIKE '%leg raise%'
   OR name ILIKE '%v-up%' OR name ILIKE '%knee raise%' OR name ILIKE '%hanging%raise%';

-- ── Core Rotation ────────────────────────────────────────────────────────
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'core_rotation')
WHERE name ILIKE '%russian twist%' OR name ILIKE '%woodchop%' OR name ILIKE '%wood chop%'
   OR name ILIKE '%oblique%' OR name ILIKE '%cable twist%';

-- ── Core Anti-Extension ──────────────────────────────────────────────────
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'core_anti_extension')
WHERE name ILIKE '%plank%' OR name ILIKE '%ab wheel%' OR name ILIKE '%ab rollout%'
   OR name ILIKE '%dead bug%' OR name ILIKE '%bird dog%' OR name ILIKE '%hollow%';

-- ── Leg Extension Isolation ──────────────────────────────────────────────
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'leg_extension_isolation')
WHERE name ILIKE '%leg extension%';

-- ── Leg Curl Isolation ───────────────────────────────────────────────────
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'leg_curl_isolation')
WHERE name ILIKE '%leg curl%' OR name ILIKE '%hamstring curl%';

-- ── Shrug ─────────────────────────────────────────────────────────────────
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'shrug')
WHERE name ILIKE '%shrug%';

-- ── Wrist / Forearm ──────────────────────────────────────────────────────
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'wrist_forearm')
WHERE name ILIKE '%wrist curl%' OR name ILIKE '%forearm%' OR name ILIKE '%grip%';

-- ── Pullover ─────────────────────────────────────────────────────────────
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'pullover')
WHERE name ILIKE '%pullover%';

-- ── Glute Isolation ──────────────────────────────────────────────────────
UPDATE public.exercises SET movement_pattern_id = (SELECT id FROM movement_patterns WHERE name = 'glute_isolation')
WHERE name ILIKE '%glute%' AND name NOT ILIKE '%bridge%' AND name NOT ILIKE '%thrust%'
  AND name NOT ILIKE '%squat%' AND name NOT ILIKE '%deadlift%';
