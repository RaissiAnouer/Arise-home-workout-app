-- Seed Exercises with High Quality Animation URLs
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    animation_url TEXT,
    muscle_group TEXT,
    equipment TEXT,
    is_compound BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'exercises' AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users" ON public.exercises FOR SELECT USING (true);
    END IF;
END $$;

-- Insert / Upsert Routine Exercises with High Quality Animation URLs
INSERT INTO public.exercises (name, animation_url, muscle_group, equipment, is_compound)
VALUES
  ('Barbell Squat', 'https://static.exercisedb.dev/media/RYcV1kH.gif', 'Quadriceps', 'Barbell', true),
  ('Bench Press', 'https://static.exercisedb.dev/media/EIeI8Vf.gif', 'Chest', 'Barbell', true),
  ('Lat Pulldown', 'https://static.exercisedb.dev/media/LEprlgG.gif', 'Back', 'Cable Machine', true),
  ('Romanian Deadlift', 'https://static.exercisedb.dev/media/wQ2c4XD.gif', 'Hamstrings', 'Barbell', true),
  ('Lateral Raise', 'https://static.exercisedb.dev/media/DsgkuIt.gif', 'Shoulders', 'Dumbbells', false),
  ('Triceps Pushdown', 'https://static.exercisedb.dev/media/gAwDzB3.gif', 'Triceps', 'Cable Machine', false),
  ('Standing Calf Raise', 'https://static.exercisedb.dev/media/8ozhUIZ.gif', 'Calves', 'Machine', false),
  ('Hanging Leg Raise', 'https://static.exercisedb.dev/media/I3tsCnC.gif', 'Core', 'Pull-up Bar', false),
  ('Deadlift', 'https://static.exercisedb.dev/media/ila4NZS.gif', 'Back', 'Barbell', true),
  ('Incline Dumbbell Press', 'https://static.exercisedb.dev/media/ns0SIbU.gif', 'Chest', 'Dumbbells', true),
  ('Seated Cable Row', 'https://static.exercisedb.dev/media/fUBheHs.gif', 'Back', 'Cable Machine', true),
  ('Bulgarian Split Squat', 'https://static.exercisedb.dev/media/RYcV1kH.gif', 'Quadriceps', 'Dumbbells', true),
  ('Face Pull', 'https://static.exercisedb.dev/media/EAs3xL9.gif', 'Shoulders', 'Cable Machine', false),
  ('Dumbbell Curl', 'https://static.exercisedb.dev/media/mtXengz.gif', 'Biceps', 'Dumbbells', false),
  ('Seated Calf Raise', 'https://static.exercisedb.dev/media/IeDEXTe.gif', 'Calves', 'Machine', false),
  ('Cable Crunch', 'https://static.exercisedb.dev/media/8xUv4J7.gif', 'Core', 'Cable Machine', false),
  ('Shoulder Press', 'https://static.exercisedb.dev/media/84RyJf8.gif', 'Shoulders', 'Dumbbells', true),
  ('Overhead Triceps Extension', 'https://static.exercisedb.dev/media/uxJcFUU.gif', 'Triceps', 'Dumbbells', false),
  ('Pull-ups', 'https://static.exercisedb.dev/media/lBDjFxJ.gif', 'Back', 'Pull-up Bar', true),
  ('Barbell Row', 'https://static.exercisedb.dev/media/eZyBC3j.gif', 'Back', 'Barbell', true),
  ('Chest Supported Row', 'https://static.exercisedb.dev/media/7vG5o25.gif', 'Back', 'Dumbbells', true),
  ('Hammer Curl', 'https://static.exercisedb.dev/media/slDvUAU.gif', 'Biceps', 'Dumbbells', false),
  ('Back Squat', 'https://static.exercisedb.dev/media/RYcV1kH.gif', 'Quadriceps', 'Barbell', true),
  ('Leg Press', 'https://static.exercisedb.dev/media/V07qpXy.gif', 'Quadriceps', 'Machine', true),
  ('Leg Curl', 'https://static.exercisedb.dev/media/17lJ1kr.gif', 'Hamstrings', 'Machine', false),
  ('Calf Raise', 'https://static.exercisedb.dev/media/VW88JNd.gif', 'Calves', 'Bodyweight', false),
  ('Ab Wheel Rollout', 'https://static.exercisedb.dev/media/8xUv4J7.gif', 'Core', 'Bodyweight', false),
  ('Overhead Press', 'https://static.exercisedb.dev/media/kTbSH9h.gif', 'Shoulders', 'Barbell', true),
  ('Pull-up', 'https://static.exercisedb.dev/media/lBDjFxJ.gif', 'Back', 'Pull-up Bar', true),
  ('Chest Press Machine', 'https://static.exercisedb.dev/media/wDN97Ca.gif', 'Chest', 'Machine', true),
  ('Cable Row', 'https://static.exercisedb.dev/media/fUBheHs.gif', 'Back', 'Cable Machine', true),
  ('Rear Delt Fly', 'https://static.exercisedb.dev/media/EAs3xL9.gif', 'Shoulders', 'Dumbbells', false),
  ('Skull Crushers', 'https://static.exercisedb.dev/media/iZop9xO.gif', 'Triceps', 'Barbell', false),
  ('Front Squat', 'https://static.exercisedb.dev/media/zG0zs85.gif', 'Quadriceps', 'Barbell', true),
  ('Barbell Hip Thrust', 'https://static.exercisedb.dev/media/aWedzZX.gif', 'Glutes', 'Barbell', true),
  ('Walking Lunges', 'https://static.exercisedb.dev/media/RYcV1kH.gif', 'Quadriceps', 'Bodyweight', true),
  ('Leg Extension', 'https://static.exercisedb.dev/media/Y1MsI1l.gif', 'Quadriceps', 'Machine', false),
  ('Incline Bench Press', 'https://static.exercisedb.dev/media/3TZduzM.gif', 'Chest', 'Barbell', true),
  ('Machine Chest Press', 'https://static.exercisedb.dev/media/wDN97Ca.gif', 'Chest', 'Machine', true),
  ('Dumbbell Shoulder Press', 'https://static.exercisedb.dev/media/84RyJf8.gif', 'Shoulders', 'Dumbbells', true),
  ('Cable Fly', 'https://static.exercisedb.dev/media/27NNGFr.gif', 'Chest', 'Cable Machine', false),
  ('EZ Bar Curl', 'https://static.exercisedb.dev/media/OVTZ65k.gif', 'Biceps', 'Barbell', false),
  ('Preacher Curl', 'https://static.exercisedb.dev/media/OVTZ65k.gif', 'Biceps', 'Barbell', false),
  ('Cable Curl', 'https://static.exercisedb.dev/media/QTXKWPh.gif', 'Biceps', 'Cable Machine', false),
  ('Push-ups', 'https://static.exercisedb.dev/media/I4hDWkc.gif', 'Chest', 'Bodyweight', true),
  ('Pike Push-ups', 'https://static.exercisedb.dev/media/XPUDTt7.gif', 'Shoulders', 'Bodyweight', true),
  ('Bulgarian Split Squats', 'https://static.exercisedb.dev/media/RYcV1kH.gif', 'Quadriceps', 'Bodyweight', true),
  ('Glute Bridge', 'https://static.exercisedb.dev/media/aWedzZX.gif', 'Glutes', 'Bodyweight', false),
  ('Plank', 'https://static.exercisedb.dev/media/X6ytgYZ.gif', 'Core', 'Bodyweight', false),
  ('Chin-ups', 'https://static.exercisedb.dev/media/T2mxWqc.gif', 'Biceps', 'Pull-up Bar', true),
  ('Nordic Curl', 'https://static.exercisedb.dev/media/17lJ1kr.gif', 'Hamstrings', 'Bodyweight', false),
  ('Hanging Knee Raise', 'https://static.exercisedb.dev/media/03lzqwk.gif', 'Core', 'Pull-up Bar', false),
  ('Decline Push-ups', 'https://static.exercisedb.dev/media/i5cEhka.gif', 'Chest', 'Bodyweight', true),
  ('Diamond Push-ups', 'https://static.exercisedb.dev/media/soIB2rj.gif', 'Triceps', 'Bodyweight', true),
  ('Bench Dips', 'https://static.exercisedb.dev/media/gtO1ErP.gif', 'Triceps', 'Bodyweight', false),
  ('Australian Rows', 'https://static.exercisedb.dev/media/bZGHsAZ.gif', 'Back', 'Bodyweight', true),
  ('Reverse Snow Angels', 'https://static.exercisedb.dev/media/EAs3xL9.gif', 'Shoulders', 'Bodyweight', false),
  ('Superman', 'https://static.exercisedb.dev/media/4GqRrAk.gif', 'Back', 'Bodyweight', false),
  ('Squats', 'https://static.exercisedb.dev/media/BReCuOn.gif', 'Quadriceps', 'Bodyweight', true),
  ('Jump Squats', 'https://static.exercisedb.dev/media/LIlE5Tn.gif', 'Quadriceps', 'Bodyweight', true),
  ('Single Leg Glute Bridge', 'https://static.exercisedb.dev/media/aWedzZX.gif', 'Glutes', 'Bodyweight', false),
  ('Calf Raises', 'https://static.exercisedb.dev/media/bJYHBIN.gif', 'Calves', 'Bodyweight', false),
  ('Leg Raises', 'https://static.exercisedb.dev/media/UGhRD1A.gif', 'Core', 'Bodyweight', false),
  ('Hollow Hold', 'https://static.exercisedb.dev/media/X6ytgYZ.gif', 'Core', 'Bodyweight', false),
  ('Single Leg RDL', 'https://static.exercisedb.dev/media/wQ2c4XD.gif', 'Hamstrings', 'Bodyweight', true),
  ('Side Plank', 'https://static.exercisedb.dev/media/X6ytgYZ.gif', 'Core', 'Bodyweight', false),
  ('Goblet Squat', 'https://static.exercisedb.dev/media/yn8yg1r.gif', 'Quadriceps', 'Dumbbells', true),
  ('Dumbbell Bench Press', 'https://static.exercisedb.dev/media/SpYC0Kp.gif', 'Chest', 'Dumbbells', true),
  ('One Arm Row', 'https://static.exercisedb.dev/media/C0MA9bC.gif', 'Back', 'Dumbbells', true),
  ('Skull Crusher', 'https://static.exercisedb.dev/media/iZop9xO.gif', 'Triceps', 'Dumbbells', false),
  ('Weighted Sit-up', 'https://static.exercisedb.dev/media/EZeDVzO.gif', 'Core', 'Dumbbells', false),
  ('Arnold Press', 'https://static.exercisedb.dev/media/Xy4jlWA.gif', 'Shoulders', 'Dumbbells', true),
  ('Step-ups', 'https://static.exercisedb.dev/media/aXtJhlg.gif', 'Quadriceps', 'Dumbbells', true),
  ('Russian Twist', 'https://static.exercisedb.dev/media/XVDdcoj.gif', 'Core', 'Dumbbells', false),
  ('Dumbbell Fly', 'https://static.exercisedb.dev/media/yz9nUhF.gif', 'Chest', 'Dumbbells', false),
  ('Close Grip DB Press', 'https://static.exercisedb.dev/media/7jGOBF3.gif', 'Triceps', 'Dumbbells', true),
  ('Dumbbell Pullover', 'https://static.exercisedb.dev/media/9XjtHvS.gif', 'Back', 'Dumbbells', true),
  ('Reverse Curl', 'https://static.exercisedb.dev/media/4Jc36XM.gif', 'Biceps', 'Dumbbells', false)
ON CONFLICT (name) DO UPDATE SET
  animation_url = EXCLUDED.animation_url,
  muscle_group = EXCLUDED.muscle_group,
  equipment = EXCLUDED.equipment,
  is_compound = EXCLUDED.is_compound;
