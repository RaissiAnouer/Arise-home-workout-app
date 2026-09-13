-- 006_efficient_exercises_boost.sql
-- Boosts the popularity scores of the most efficient exercises based on EMG and stretch-mediated hypertrophy research.

-- Chest
UPDATE public.exercises SET popularity = 100 WHERE name ILIKE '%incline dumbbell press%';
UPDATE public.exercises SET popularity = 100 WHERE name ILIKE '%incline db press%';

-- Back
UPDATE public.exercises SET popularity = 100 WHERE name ILIKE '%pull up%' OR name ILIKE '%pull-up%';
UPDATE public.exercises SET popularity = 95 WHERE name ILIKE '%barbell row%';

-- Quads
UPDATE public.exercises SET popularity = 100 WHERE name ILIKE '%barbell squat%';
UPDATE public.exercises SET popularity = 95 WHERE name ILIKE '%leg press%';

-- Hamstrings
UPDATE public.exercises SET popularity = 100 WHERE name ILIKE '%nordic curl%';
UPDATE public.exercises SET popularity = 95 WHERE name ILIKE '%romanian deadlift%' OR name ILIKE '%rdl%';

-- Glutes
UPDATE public.exercises SET popularity = 100 WHERE name ILIKE '%hip thrust%';
UPDATE public.exercises SET popularity = 90 WHERE name ILIKE '%step up%' OR name ILIKE '%step-up%';

-- Shoulders
UPDATE public.exercises SET popularity = 100 WHERE name ILIKE '%dumbbell overhead press%' OR name ILIKE '%seated dumbbell press%';

-- Abs
UPDATE public.exercises SET popularity = 95 WHERE name ILIKE '%cable crunch%';
UPDATE public.exercises SET popularity = 90 WHERE name ILIKE '%bicycle crunch%' OR name ILIKE '%bicycle maneuver%';
