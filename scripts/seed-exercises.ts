import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ─── Configuration ──────────────────────────────────────────────────
const DATASET_URL = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json';
const GITHUB_BASE = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/';
const BATCH_SIZE = 50;

// ─── Types matching the hasaneyldrm dataset ─────────────────────────
type DatasetExercise = {
  id: string;
  name: string;
  body_part: string;
  category: string;
  equipment: string;
  target: string;
  muscle_group: string[];
  image: string;       // relative path to thumbnail: images/XXXX-XXXXXXX.jpg
  gif_url: string;     // relative path to GIF: videos/XXXX-XXXXXXX.gif
  instructions: {
    en: string[];
    [lang: string]: string[];
  };
  [key: string]: any;
};

// ─── Mapping helpers ────────────────────────────────────────────────

/** Map dataset equipment to our schema */
function mapEquipment(raw: string): string {
  const map: Record<string, string> = {
    'body weight': 'Bodyweight',
    'dumbbell': 'Dumbbells',
    'barbell': 'Barbell',
    'cable': 'Cable Machine',
    'leverage machine': 'Machine',
    'kettlebell': 'Kettlebell',
    'band': 'Resistance Bands',
    'smith machine': 'Smith Machine',
    'stability ball': 'Medicine Ball',
    'ez barbell': 'Barbell',
    'olympic barbell': 'Barbell',
    'trap bar': 'Barbell',
    'weighted': 'Bodyweight',
    'medicine ball': 'Medicine Ball',
    'rope': 'Cable Machine',
    'resistance band': 'Resistance Bands',
    'roller': 'Bodyweight',
    'skierg machine': 'Machine',
    'sled machine': 'Machine',
    'elliptical machine': 'Machine',
    'stationary bike': 'Machine',
    'upper body ergometer': 'Machine',
    'bosu ball': 'Bodyweight',
    'assisted': 'Machine',
    'wheel roller': 'Bodyweight',
    'hammer': 'Dumbbells',
    'tire': 'Bodyweight',
    'stepmill machine': 'Machine',
  };
  return map[raw.toLowerCase()] || 'Bodyweight';
}

/** Map dataset body_part to our muscle categories */
function mapMuscle(bodyPart: string, target: string): string {
  // Use target for specificity, body_part as fallback
  const targetMap: Record<string, string> = {
    'pectorals': 'Chest',
    'serratus anterior': 'Chest',
    'upper back': 'Back',
    'lats': 'Lats',
    'spine': 'Back',
    'traps': 'Traps',
    'levator scapulae': 'Traps',
    'delts': 'Shoulders',
    'biceps': 'Biceps',
    'triceps': 'Triceps',
    'forearms': 'Forearms',
    'abs': 'Core',
    'obliques': 'Core',
    'transverse abdominis': 'Core',
    'quads': 'Quadriceps',
    'hamstrings': 'Hamstrings',
    'glutes': 'Glutes',
    'adductors': 'Glutes',
    'abductors': 'Glutes',
    'calves': 'Calves',
    'hip flexors': 'Hip Flexors',
    'cardiovascular system': 'Full Body',
    'sternocleidomastoid': 'Traps',
  };

  const bodyPartMap: Record<string, string> = {
    'chest': 'Chest',
    'back': 'Back',
    'shoulders': 'Shoulders',
    'upper arms': 'Biceps',
    'lower arms': 'Forearms',
    'waist': 'Core',
    'upper legs': 'Quadriceps',
    'lower legs': 'Calves',
    'cardio': 'Full Body',
    'neck': 'Traps',
  };

  return targetMap[target.toLowerCase()] || bodyPartMap[bodyPart.toLowerCase()] || 'Full Body';
}

/** Map dataset category to our categories */
function mapCategory(bodyPart: string): string {
  if (bodyPart.toLowerCase() === 'cardio') return 'Cardio';
  return 'Strength';
}

/** Estimate difficulty from equipment + body part */
function mapDifficulty(equipment: string, bodyPart: string): string {
  const advancedEquipment = ['barbell', 'olympic barbell', 'trap bar', 'smith machine'];
  const beginnerEquipment = ['body weight', 'band', 'resistance band', 'stability ball'];
  
  if (advancedEquipment.includes(equipment.toLowerCase())) return 'Advanced';
  if (beginnerEquipment.includes(equipment.toLowerCase())) return 'Beginner';
  return 'Intermediate';
}

/** Guess movement pattern from target and category */
function mapMovementPattern(target: string, bodyPart: string): string {
  const pushTargets = ['pectorals', 'triceps', 'delts', 'serratus anterior'];
  const pullTargets = ['lats', 'biceps', 'upper back', 'traps', 'forearms', 'levator scapulae'];
  const squatTargets = ['quads', 'adductors', 'abductors'];
  const hingeTargets = ['hamstrings', 'glutes', 'spine'];

  const t = target.toLowerCase();
  if (pushTargets.includes(t)) return 'Push';
  if (pullTargets.includes(t)) return 'Pull';
  if (squatTargets.includes(t)) return 'Squat';
  if (hingeTargets.includes(t)) return 'Hinge';
  if (bodyPart.toLowerCase() === 'cardio') return 'Carry';
  return 'Rotation';
}

// ─── Lookup cache ───────────────────────────────────────────────────
const lookupCache: Record<string, Record<string, string>> = {};

async function getOrCreateId(table: string, name: string): Promise<string | null> {
  if (!name) return null;

  // Check memory cache
  if (!lookupCache[table]) lookupCache[table] = {};
  if (lookupCache[table][name]) return lookupCache[table][name];

  // Check DB
  let { data } = await supabase
    .from(table)
    .select('id')
    .ilike('name', name)
    .maybeSingle();

  if (!data) {
    const insertPayload: any = { name };
    // muscles table has a 'region' field
    if (table === 'muscles') {
      const upperMuscles = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms', 'Traps', 'Lats'];
      const lowerMuscles = ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Hip Flexors'];
      if (upperMuscles.includes(name)) insertPayload.region = 'Upper Body';
      else if (lowerMuscles.includes(name)) insertPayload.region = 'Lower Body';
      else if (name === 'Core') insertPayload.region = 'Core';
      else insertPayload.region = 'Full Body';
    }
    const { data: inserted, error } = await supabase
      .from(table)
      .insert(insertPayload)
      .select('id')
      .single();

    if (error) {
      console.warn(`  ⚠ Error inserting "${name}" into ${table}:`, error.message);
      return null;
    }
    data = inserted;
  }

  lookupCache[table][name] = data!.id;
  return data!.id;
}

// ─── Main ───────────────────────────────────────────────────────────
async function main() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║  ARISE — Exercise Database Seeder                ║');
  console.log('║  Source: hasaneyldrm/exercises-dataset (1,324)    ║');
  console.log('║  Includes: GIF animations + thumbnails           ║');
  console.log('╚═══════════════════════════════════════════════════╝');
  console.log('');

  // ── Step 1: Download the dataset ──────────────────────────────
  console.log('📥 Downloading exercise dataset...');
  const res = await fetch(DATASET_URL);
  if (!res.ok) {
    console.error(`Failed to download dataset: ${res.status} ${res.statusText}`);
    process.exit(1);
  }
  let allExercises: DatasetExercise[] = await res.json();
  console.log(`   ✅ Downloaded ${allExercises.length} raw exercises\n`);

  // ── Step 1.5: Filter out non-popular exercises ────────────────
  console.log('🧹 Filtering out non-popular exercises...');
  
  const popularKeywords = [
    'bench press', 'squat', 'deadlift', 'push up', 'pull up', 'chin up',
    'barbell row', 'dumbbell row', 'overhead press', 'military press', 'shoulder press',
    'bicep curl', 'hammer curl', 'tricep extension', 'skull crusher', 'pushdown',
    'leg press', 'leg extension', 'leg curl', 'calf raise',
    'lat pulldown', 'cable row', 'seated row', 'front raise', 'lateral raise',
    'crunch', 'plank', 'russian twist', 'lunge', 'bulgarian split squat',
    'romanian deadlift', 'hip thrust', 'glute bridge', 'chest fly', 'pec deck',
    'dips', 'shrug', 'face pull', 'mountain climber', 'burpee', 'sit-up', 'leg raise'
  ];

  const obscureKeywords = [
    'band', 'bosu ball', 'stability ball', 'medicine ball', 'kettlebell',
    'one arm', 'single arm', 'single leg', 'kneeling', 'seated barbell', 
    'seated dumbbell', 'reverse grip', 'underhand', 'z bar', 'ez bar',
    'smith machine', 'lever', 'sled', 'skierg', 'stepmill',
    'archer', 'spiderman', 'clap', 'plyo', 'assisted', '3/4', '45°', 'air bike',
    'wall', 'partner', 'isometric', 'suspension', 'trx', 'slider'
  ];

  allExercises = allExercises.filter(ex => {
    const nameLower = ex.name.toLowerCase();
    const hasObscureKeyword = obscureKeywords.some(kw => nameLower.includes(kw));
    return !hasObscureKeyword;
  });

  const coreKeywords = [
    'barbell bench press', 'dumbbell bench press', 'push up', 'pull up', 'chin up',
    'barbell squat', 'dumbbell squat', 'leg press', 'romanian deadlift', 'deadlift',
    'barbell row', 'dumbbell row', 'lat pulldown', 'overhead press', 'lateral raise',
    'bicep curl', 'tricep pushdown', 'calf raise', 'plank', 'crunch'
  ];

  allExercises.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    
    // Exact or very close matches for core keywords get top priority
    const aCore = coreKeywords.some(kw => aName === kw || aName.startsWith(kw));
    const bCore = coreKeywords.some(kw => bName === kw || bName.startsWith(kw));
    if (aCore && !bCore) return -1;
    if (!aCore && bCore) return 1;

    const aPopular = popularKeywords.some(kw => aName.includes(kw));
    const bPopular = popularKeywords.some(kw => bName.includes(kw));
    if (aPopular && !bPopular) return -1;
    if (!aPopular && bPopular) return 1;
    return 0;
  });
  
  allExercises = allExercises.slice(0, 200);

  console.log(`   ✅ Kept ${allExercises.length} exercises (limited to 200, popular first)\n`);

  // ── Step 2: Clear existing data ───────────────────────────────
  console.log('🗑️  Clearing existing exercises...');
  const { error: deleteSecondary } = await supabase
    .from('exercise_secondary_muscles')
    .delete()
    .neq('exercise_id', '00000000-0000-0000-0000-000000000000');
  if (deleteSecondary) console.warn('   ⚠ Could not clear secondary muscles:', deleteSecondary.message);

  const { error: deleteExercises } = await supabase
    .from('exercises')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteExercises) console.warn('   ⚠ Could not clear exercises:', deleteExercises.message);
  console.log('   ✅ Cleared\n');

  // ── Step 3: Process & insert in batches ───────────────────────
  console.log(`🏋️  Processing ${allExercises.length} exercises in batches of ${BATCH_SIZE}...\n`);
  
  let successCount = 0;
  let errorCount = 0;
  const startTime = Date.now();

  for (let batchStart = 0; batchStart < allExercises.length; batchStart += BATCH_SIZE) {
    const batch = allExercises.slice(batchStart, batchStart + BATCH_SIZE);
    const rows = [];

    for (const ex of batch) {
      try {
        // Map fields
        const equipmentName = mapEquipment(ex.equipment);
        const muscleName = mapMuscle(ex.body_part, ex.target);
        const categoryName = mapCategory(ex.body_part);
        const difficultyName = mapDifficulty(ex.equipment, ex.body_part);
        const patternName = mapMovementPattern(ex.target, ex.body_part);

        // Get/create lookup IDs
        const [catId, eqId, diffId, muscleId, patternId] = await Promise.all([
          getOrCreateId('categories', categoryName),
          getOrCreateId('equipment', equipmentName),
          getOrCreateId('difficulties', difficultyName),
          getOrCreateId('muscles', muscleName),
          getOrCreateId('movement_patterns', patternName),
        ]);

        // Build full URLs for GIF and thumbnail
        const gifUrl = ex.gif_url
          ? `${GITHUB_BASE}${ex.gif_url}`
          : null;
        const thumbnailUrl = ex.image
          ? `${GITHUB_BASE}${ex.image}`
          : null;

        // Get English instructions
        const instructions = ex.instructions?.en || [];

        // Generate tips and common mistakes from the exercise context
        const tips = generateTips(ex.target, ex.equipment, ex.body_part);
        const mistakes = generateMistakes(ex.target, ex.equipment, ex.body_part);

        // Determine sets/reps based on category
        const isCardio = ex.body_part.toLowerCase() === 'cardio';
        const reps = isCardio ? '30-60 sec' : (difficultyName === 'Beginner' ? '12-15' : '8-12');
        const sets = isCardio ? '3' : (difficultyName === 'Advanced' ? '4' : '3');
        const restSeconds = isCardio ? 30 : (difficultyName === 'Advanced' ? 90 : 60);

        // Estimate calories
        const calories = isCardio
          ? Math.floor(Math.random() * 15) + 20
          : Math.floor(Math.random() * 10) + 8;

        rows.push({
          name: ex.name,
          slug: `${ex.id}-${ex.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`,
          description: buildDescription(ex),
          instructions: JSON.stringify(instructions),
          tips: JSON.stringify(tips),
          mistakes: JSON.stringify(mistakes),
          category_id: catId,
          equipment_id: eqId,
          difficulty_id: diffId,
          primary_muscle_id: muscleId,
          movement_pattern_id: patternId,
          calories,
          duration: isCardio ? Math.floor(Math.random() * 5) + 5 : Math.floor(Math.random() * 3) + 2,
          reps,
          sets,
          rest_seconds: restSeconds,
          animation_url: gifUrl,
          thumbnail_url: thumbnailUrl,
          is_compound: ex.muscle_group && ex.secondary_muscles.length > 1,
        });
      } catch (err: any) {
        console.error(`   ❌ Error processing "${ex.name}":`, err.message);
        errorCount++;
      }
    }

    // Batch insert
    if (rows.length > 0) {
      const { error } = await supabase.from('exercises').insert(rows);
      if (error) {
        console.error(`   ❌ Batch insert error (rows ${batchStart + 1}-${batchStart + rows.length}):`, error.message);
        errorCount += rows.length;
      } else {
        successCount += rows.length;
      }
    }

    // Progress log
    const progress = Math.min(batchStart + BATCH_SIZE, allExercises.length);
    const pct = Math.round((progress / allExercises.length) * 100);
    const bar = '█'.repeat(Math.floor(pct / 4)) + '░'.repeat(25 - Math.floor(pct / 4));
    process.stdout.write(`\r   [${bar}] ${pct}% (${progress}/${allExercises.length})`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n');

  // ── Step 4: Insert secondary muscles ──────────────────────────
  console.log('💪 Inserting secondary muscles...');
  let secondaryCount = 0;

  // Get all inserted exercises to map names → IDs
  const { data: insertedExercises } = await supabase
    .from('exercises')
    .select('id, slug');

  if (insertedExercises) {
    const exerciseMap = new Map(insertedExercises.map(e => [e.slug, e.id]));

    for (const ex of allExercises) {
      if (!ex.muscle_group || ex.secondary_muscles.length === 0) continue;

      const slug = `${ex.id}-${ex.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`;
      const exerciseId = exerciseMap.get(slug);
      if (!exerciseId) continue;

      for (const mg of ex.secondary_muscles) {
        const muscleName = mg.charAt(0).toUpperCase() + mg.slice(1);
        const muscleId = await getOrCreateId('muscles', muscleName);
        if (!muscleId) continue;

        const { error } = await supabase
          .from('exercise_secondary_muscles')
          .insert({ exercise_id: exerciseId, muscle_id: muscleId })
          .select()
          .maybeSingle();

        if (!error) secondaryCount++;
      }
    }
  }
  console.log(`   ✅ Inserted ${secondaryCount} secondary muscle links\n`);

  // ── Step 5: Verification ──────────────────────────────────────
  const { count } = await supabase
    .from('exercises')
    .select('*', { count: 'exact', head: true });

  console.log('╔═══════════════════════════════════════════════════╗');
  console.log(`║  ✅ SEEDING COMPLETE                              ║`);
  console.log(`║  Inserted: ${String(successCount).padEnd(6)} exercises               ║`);
  console.log(`║  Errors:   ${String(errorCount).padEnd(6)}                          ║`);
  console.log(`║  DB Total: ${String(count || 0).padEnd(6)} rows                     ║`);
  console.log(`║  Time:     ${String(elapsed + 's').padEnd(6)}                          ║`);
  console.log('╚═══════════════════════════════════════════════════╝');

  // Print sample URLs
  console.log('\n📸 Sample URLs:');
  const { data: samples } = await supabase
    .from('exercises')
    .select('name, thumbnail_url, animation_url')
    .limit(5);

  if (samples) {
    for (const s of samples) {
      console.log(`   ${s.name}`);
      console.log(`     🖼️  ${s.thumbnail_url}`);
      console.log(`     🎞️  ${s.animation_url}\n`);
    }
  }
}

// ─── Helper: generate contextual tips ───────────────────────────
function generateTips(target: string, equipment: string, bodyPart: string): string[] {
  const tips: string[] = [];

  // Target-specific tips
  const targetTips: Record<string, string[]> = {
    'pectorals': ['Squeeze your chest at the top of the movement.', 'Keep your shoulder blades retracted and depressed.'],
    'lats': ['Focus on pulling with your elbows, not your hands.', 'Squeeze your lats at the bottom of each rep.'],
    'delts': ['Avoid using momentum — control the weight throughout.', 'Keep a slight bend in your elbows.'],
    'biceps': ['Keep your elbows pinned to your sides.', 'Avoid swinging the weight — use strict form.'],
    'triceps': ['Lock out fully at the top for maximum contraction.', 'Keep your elbows close to your body.'],
    'quads': ['Push through your heels for maximum quad engagement.', 'Keep your knees tracking over your toes.'],
    'hamstrings': ['Focus on the eccentric (lowering) phase.', 'Squeeze at the point of peak contraction.'],
    'glutes': ['Drive through your heels and squeeze at the top.', 'Keep your core tight throughout the movement.'],
    'abs': ['Exhale as you contract and inhale as you release.', 'Keep your lower back pressed against the floor.'],
    'calves': ['Pause at the top for a 2-second squeeze.', 'Use a full range of motion — go all the way down.'],
    'traps': ['Shrug straight up, not rolling your shoulders.', 'Hold the peak contraction for 1-2 seconds.'],
    'forearms': ['Use a controlled tempo — no jerking movements.', 'Vary your grip width to target different areas.'],
  };

  const t = target.toLowerCase();
  if (targetTips[t]) {
    tips.push(...targetTips[t]);
  }

  // Universal tips
  tips.push('Breathe steadily — exhale during effort, inhale during release.');
  tips.push('Control the eccentric phase for better muscle activation.');

  return tips.slice(0, 4);
}

// ─── Helper: generate common mistakes ───────────────────────────
function generateMistakes(target: string, equipment: string, bodyPart: string): string[] {
  const mistakes: string[] = [];

  const targetMistakes: Record<string, string[]> = {
    'pectorals': ['Flaring elbows too wide, which stresses the shoulders.', 'Bouncing the weight off the chest.'],
    'lats': ['Using too much bicep — focus on back engagement.', 'Rounding the lower back during the movement.'],
    'delts': ['Lifting too heavy and using momentum.', 'Shrugging the shoulders up during lateral raises.'],
    'biceps': ['Swinging the body to lift heavier weight.', 'Not fully extending the arms at the bottom.'],
    'triceps': ['Flaring elbows outward.', 'Using too much shoulder involvement.'],
    'quads': ['Letting knees cave inward during squats.', 'Leaning too far forward and losing balance.'],
    'hamstrings': ['Rounding the lower back during deadlift variations.', 'Using too much momentum and not controlling the weight.'],
    'glutes': ['Not going deep enough in the range of motion.', 'Overarching the lower back at the top.'],
    'abs': ['Pulling on the neck during crunches.', 'Using hip flexors instead of engaging the abs.'],
    'calves': ['Bouncing at the bottom without full stretch.', 'Using too much weight with partial reps.'],
    'traps': ['Rolling shoulders during shrugs.', 'Using too heavy a weight and shortening range of motion.'],
  };

  const t = target.toLowerCase();
  if (targetMistakes[t]) {
    mistakes.push(...targetMistakes[t]);
  }

  // Universal mistakes
  mistakes.push('Rushing through reps without proper form.');

  return mistakes.slice(0, 3);
}

// ─── Helper: build a description ────────────────────────────────
function buildDescription(ex: DatasetExercise): string {
  const parts: string[] = [];
  
  const equipStr = ex.equipment.toLowerCase() === 'body weight'
    ? 'bodyweight'
    : ex.equipment.toLowerCase();

  parts.push(
    `${ex.name} is a ${equipStr} exercise that primarily targets the ${ex.target}.`
  );

  if (ex.muscle_group && ex.secondary_muscles.length > 0) {
    parts.push(
      `Secondary muscles involved include ${ex.secondary_muscles.join(', ')}.`
    );
  }

  parts.push(
    `This exercise falls under the ${ex.body_part.toLowerCase()} category.`
  );

  return parts.join(' ');
}

main().catch(console.error);
