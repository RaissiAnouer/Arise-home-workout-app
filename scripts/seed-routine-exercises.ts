import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { ExerciseMediaDB } from '../src/data/exerciseMedia';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedExercisesTable() {
  console.log("Seeding exercises table with high-quality animation URLs...");

  const exerciseEntries = Object.entries(ExerciseMediaDB).map(([name, animationUrl]) => ({
    name,
    animation_url: animationUrl,
    muscle_group: name.toLowerCase().includes('squat') || name.toLowerCase().includes('lunge') ? 'Quadriceps'
                : name.toLowerCase().includes('press') || name.toLowerCase().includes('push') ? 'Chest'
                : name.toLowerCase().includes('row') || name.toLowerCase().includes('pull') ? 'Back'
                : name.toLowerCase().includes('curl') ? 'Biceps'
                : name.toLowerCase().includes('raise') ? 'Shoulders'
                : name.toLowerCase().includes('raise') || name.toLowerCase().includes('extension') ? 'Triceps'
                : 'Full Body',
    equipment: name.toLowerCase().includes('dumbbell') || name.toLowerCase().includes('db') ? 'Dumbbells'
             : name.toLowerCase().includes('barbell') ? 'Barbell'
             : name.toLowerCase().includes('cable') ? 'Cable Machine'
             : 'Bodyweight',
    is_compound: !name.toLowerCase().includes('raise') && !name.toLowerCase().includes('curl') && !name.toLowerCase().includes('extension'),
  }));

  const { data, error } = await supabase
    .from('exercises')
    .upsert(exerciseEntries, { onConflict: 'name' });

  if (error) {
    console.error("Error seeding exercises table:", error.message);
  } else {
    console.log(`Successfully seeded ${exerciseEntries.length} exercises with high-quality animations!`);
  }
}

seedExercisesTable();
