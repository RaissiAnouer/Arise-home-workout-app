-- 005_exercise_popularity.sql
-- Adds a popularity column to the exercises table and seeds initial scores for major compound movements.

ALTER TABLE public.exercises
ADD COLUMN IF NOT EXISTS popularity INTEGER DEFAULT 0;

-- Boost popularity for foundational compound exercises
UPDATE public.exercises SET popularity = 100 WHERE name ILIKE '%bench press%';
UPDATE public.exercises SET popularity = 95 WHERE name ILIKE '%squat%';
UPDATE public.exercises SET popularity = 90 WHERE name ILIKE '%deadlift%';
UPDATE public.exercises SET popularity = 85 WHERE name ILIKE '%pull up%' OR name ILIKE '%pull-up%' OR name ILIKE '%chin up%';
UPDATE public.exercises SET popularity = 85 WHERE name ILIKE '%push up%' OR name ILIKE '%push-up%';
UPDATE public.exercises SET popularity = 80 WHERE name ILIKE '%overhead press%' OR name ILIKE '%military press%' OR name ILIKE '%shoulder press%';
UPDATE public.exercises SET popularity = 80 WHERE name ILIKE '%barbell row%' OR name ILIKE '%dumbbell row%';
UPDATE public.exercises SET popularity = 75 WHERE name ILIKE '%romanian deadlift%' OR name ILIKE '%rdl%';
UPDATE public.exercises SET popularity = 70 WHERE name ILIKE '%lat pulldown%' OR name ILIKE '%cable row%' OR name ILIKE '%seated row%';
UPDATE public.exercises SET popularity = 70 WHERE name ILIKE '%leg press%';
UPDATE public.exercises SET popularity = 65 WHERE name ILIKE '%bicep curl%' OR name ILIKE '%hammer curl%';
UPDATE public.exercises SET popularity = 65 WHERE name ILIKE '%tricep extension%' OR name ILIKE '%pushdown%' OR name ILIKE '%skull crusher%';
UPDATE public.exercises SET popularity = 60 WHERE name ILIKE '%leg extension%' OR name ILIKE '%leg curl%';
UPDATE public.exercises SET popularity = 60 WHERE name ILIKE '%lateral raise%' OR name ILIKE '%front raise%';
UPDATE public.exercises SET popularity = 50 WHERE name ILIKE '%crunch%' OR name ILIKE '%plank%' OR name ILIKE '%lunge%';
