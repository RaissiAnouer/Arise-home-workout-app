/**
 * Script to generate a 500-exercise database from the free-exercise-db JSON.
 * Run: node scripts/generate_exercises.js
 * Output: src/data/exercises/database_generated.ts
 */

const fs = require('fs');
const path = require('path');

// Read the source JSON
const rawJson = fs.readFileSync(path.join(__dirname, 'exercises_source.json'), 'utf8');
const exercises = JSON.parse(rawJson);

// ─── Mapping helpers ────────────────────────────────────────────────

const muscleMap = {
  'abdominals': 'Core',
  'abductors': 'Glutes',
  'adductors': 'Hip Flexors',
  'biceps': 'Biceps',
  'calves': 'Calves',
  'chest': 'Chest',
  'forearms': 'Forearms',
  'glutes': 'Glutes',
  'hamstrings': 'Hamstrings',
  'lats': 'Lats',
  'lower back': 'Back',
  'middle back': 'Back',
  'neck': 'Traps',
  'quadriceps': 'Quadriceps',
  'shoulders': 'Shoulders',
  'traps': 'Traps',
  'triceps': 'Triceps',
};

const equipmentMap = {
  'body only': 'Bodyweight',
  'dumbbell': 'Dumbbells',
  'barbell': 'Barbell',
  'kettlebells': 'Kettlebell',
  'cable': 'Cable Machine',
  'machine': 'Machine',
  'bands': 'Resistance Bands',
  'medicine ball': 'Medicine Ball',
  'exercise ball': 'Bodyweight',
  'e-z curl bar': 'Barbell',
  'foam roll': 'Bodyweight',
  'other': 'Bodyweight',
  'null': 'Bodyweight',
};

const difficultyMap = {
  'beginner': 'Beginner',
  'intermediate': 'Intermediate',
  'expert': 'Advanced',
};

const categoryMap = {
  'strength': 'Strength',
  'stretching': 'Flexibility',
  'plyometrics': 'Plyometric',
  'strongman': 'Strength',
  'powerlifting': 'Strength',
  'cardio': 'Cardio',
  'olympic weightlifting': 'Strength',
};

function toMuscle(raw) {
  if (!raw) return 'Full Body';
  const mapped = muscleMap[raw.toLowerCase()];
  return mapped || 'Full Body';
}

function toEquipment(raw) {
  if (!raw) return 'Bodyweight';
  const mapped = equipmentMap[raw.toLowerCase()];
  return mapped || 'Bodyweight';
}

function toDifficulty(raw) {
  if (!raw) return 'Intermediate';
  return difficultyMap[raw.toLowerCase()] || 'Intermediate';
}

function toCategory(raw) {
  if (!raw) return 'Strength';
  return categoryMap[raw.toLowerCase()] || 'Strength';
}

function inferMovementPattern(force, name) {
  if (!force) return 'Push';
  const f = force.toLowerCase();
  if (f === 'push') return 'Push';
  if (f === 'pull') return 'Pull';
  const n = (name || '').toLowerCase();
  if (n.includes('squat') || n.includes('lunge')) return 'Squat';
  if (n.includes('deadlift') || n.includes('hinge') || n.includes('hip thrust')) return 'Hinge';
  if (n.includes('carry') || n.includes('farmer')) return 'Carry';
  if (n.includes('twist') || n.includes('rotation') || n.includes('woodchop')) return 'Rotation';
  return f === 'static' ? 'Push' : 'Push';
}

function inferBodyRegion(primary) {
  const upper = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms', 'Traps', 'Lats'];
  const lower = ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Hip Flexors'];
  if (primary === 'Core') return 'Core';
  if (primary === 'Full Body') return 'Full Body';
  if (upper.includes(primary)) return 'Upper Body';
  if (lower.includes(primary)) return 'Lower Body';
  return 'Full Body';
}

function sanitizeId(id) {
  return id.replace(/[^a-zA-Z0-9_]/g, '_');
}

const IMAGE_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

// ─── Build 500 exercises ────────────────────────────────────────────

// Take first 500 exercises
const selected = exercises.slice(0, 500);

let output = `import {
  Equipment,
  MuscleGroup,
  Difficulty,
  ExerciseCategory,
  MovementPattern,
  BodyRegion,
} from '../exerciseTypes';

export interface ExerciseItem {
  id: string;
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment;
  difficulty: Difficulty;
  category: ExerciseCategory;
  movementPattern: MovementPattern;
  bodyRegion: BodyRegion;
  isCompound: boolean;
  gifUrl: string;
  instructions: string[];
  formTips: string[];
}

export const EXERCISE_DATABASE: Record<string, ExerciseItem> = {
`;

selected.forEach((ex, index) => {
  const id = sanitizeId(ex.id);
  const name = ex.name.replace(/"/g, '\\"');
  const primaryRaw = (ex.primaryMuscles && ex.primaryMuscles[0]) || null;
  const primary = toMuscle(primaryRaw);
  const secondaries = (ex.secondaryMuscles || [])
    .map(m => toMuscle(m))
    .filter(m => m !== primary && m !== 'Full Body');
  // Deduplicate
  const uniqueSecondaries = [...new Set(secondaries)];
  
  const equip = toEquipment(ex.equipment);
  const diff = toDifficulty(ex.level);
  const cat = toCategory(ex.category);
  const movement = inferMovementPattern(ex.force, ex.name);
  const bodyRegion = inferBodyRegion(primary);
  const isCompound = ex.mechanic === 'compound' || ex.mechanic === null;
  
  // Use a high-quality animation based on keywords
  const gifUrl = getHighQualityAnimation(name, primary, movement);
  
  const instructions = (ex.instructions || []).map(i => i.replace(/"/g, '\\"'));
  
  // Generate quality form tips based on muscle group
  const formTips = generateFormTips(primary, name, movement);
  
  output += `  '${id}': {\n`;
  output += `    id: '${id}',\n`;
  output += `    name: "${name}",\n`;
  output += `    primaryMuscle: '${primary}',\n`;
  output += `    secondaryMuscles: [${uniqueSecondaries.map(m => `"${m}"`).join(', ')}],\n`;
  output += `    equipment: '${equip}',\n`;
  output += `    difficulty: '${diff}',\n`;
  output += `    category: '${cat}',\n`;
  output += `    movementPattern: '${movement}',\n`;
  output += `    bodyRegion: '${bodyRegion}',\n`;
  output += `    isCompound: ${isCompound},\n`;
  output += `    gifUrl: "${gifUrl}",\n`;
  output += `    instructions: [${instructions.map(i => `"${i}"`).join(', ')}],\n`;
  output += `    formTips: [${formTips.map(t => `'${t}'`).join(', ')}]\n`;
  output += `  },\n`;
});

output += `};\n`;

// High-quality animation matcher
function getHighQualityAnimation(name, muscle, pattern) {
  const n = name.toLowerCase();
  
  // Specific exercises
  if (n.includes('bench press') && n.includes('incline')) return 'https://static.exercisedb.dev/media/3TZduzM.gif';
  if (n.includes('bench press') && n.includes('dumbbell')) return 'https://static.exercisedb.dev/media/SpYC0Kp.gif';
  if (n.includes('bench press')) return 'https://static.exercisedb.dev/media/EIeI8Vf.gif';
  if (n.includes('lat pulldown') || n.includes('pull down')) return 'https://static.exercisedb.dev/media/LEprlgG.gif';
  if (n.includes('romanian deadlift') || n.includes('rdl')) return 'https://static.exercisedb.dev/media/wQ2c4XD.gif';
  if (n.includes('deadlift')) return 'https://static.exercisedb.dev/media/ila4NZS.gif';
  if (n.includes('lateral raise')) return 'https://static.exercisedb.dev/media/DsgkuIt.gif';
  if (n.includes('triceps pushdown') || n.includes('pressdown')) return 'https://static.exercisedb.dev/media/gAwDzB3.gif';
  if (n.includes('calf raise') && n.includes('seated')) return 'https://static.exercisedb.dev/media/IeDEXTe.gif';
  if (n.includes('calf raise')) return 'https://static.exercisedb.dev/media/8ozhUIZ.gif';
  if (n.includes('leg raise') || n.includes('knee raise')) return 'https://static.exercisedb.dev/media/I3tsCnC.gif';
  if (n.includes('cable row') || n.includes('seated row')) return 'https://static.exercisedb.dev/media/fUBheHs.gif';
  if (n.includes('split squat')) return 'https://static.exercisedb.dev/media/RYcV1kH.gif';
  if (n.includes('face pull')) return 'https://static.exercisedb.dev/media/EAs3xL9.gif';
  if (n.includes('hammer curl')) return 'https://static.exercisedb.dev/media/slDvUAU.gif';
  if (n.includes('bicep curl') || n.includes('dumbbell curl') || n.includes(' curl')) return 'https://static.exercisedb.dev/media/mtXengz.gif';
  if (n.includes('cable crunch') || n.includes('crunch')) return 'https://static.exercisedb.dev/media/8xUv4J7.gif';
  if (n.includes('shoulder press') || n.includes('overhead press')) return 'https://static.exercisedb.dev/media/84RyJf8.gif';
  if (n.includes('triceps extension') || n.includes('skull crusher')) return 'https://static.exercisedb.dev/media/uxJcFUU.gif';
  if (n.includes('pull up') || n.includes('pull-up') || n.includes('chin up')) return 'https://static.exercisedb.dev/media/lBDjFxJ.gif';
  if (n.includes('barbell row') || n.includes('bent over row')) return 'https://static.exercisedb.dev/media/eZyBC3j.gif';
  if (n.includes('squat')) return 'https://static.exercisedb.dev/media/RYcV1kH.gif';
  if (n.includes('leg press')) return 'https://static.exercisedb.dev/media/V07qpXy.gif';
  if (n.includes('leg curl')) return 'https://static.exercisedb.dev/media/17lJ1kr.gif';
  if (n.includes('ab wheel') || n.includes('roller')) return 'https://static.exercisedb.dev/media/8xUv4J7.gif';
  if (n.includes('fly')) return 'https://static.exercisedb.dev/media/27NNGFr.gif';
  if (n.includes('push up') || n.includes('push-up')) return 'https://static.exercisedb.dev/media/I4hDWkc.gif';
  if (n.includes('plank')) return 'https://static.exercisedb.dev/media/X6ytgYZ.gif';
  if (n.includes('hip thrust') || n.includes('glute bridge')) return 'https://static.exercisedb.dev/media/aWedzZX.gif';
  if (n.includes('lunge')) return 'https://static.exercisedb.dev/media/RYcV1kH.gif';
  if (n.includes('sit-up') || n.includes('sit up')) return 'https://static.exercisedb.dev/media/EZeDVzO.gif';

  // Fallbacks by muscle
  if (muscle === 'Chest') return 'https://static.exercisedb.dev/media/EIeI8Vf.gif';
  if (muscle === 'Back') return 'https://static.exercisedb.dev/media/LEprlgG.gif';
  if (muscle === 'Shoulders') return 'https://static.exercisedb.dev/media/84RyJf8.gif';
  if (muscle === 'Biceps') return 'https://static.exercisedb.dev/media/mtXengz.gif';
  if (muscle === 'Triceps') return 'https://static.exercisedb.dev/media/gAwDzB3.gif';
  if (muscle === 'Core') return 'https://static.exercisedb.dev/media/8xUv4J7.gif';
  if (muscle === 'Quadriceps') return 'https://static.exercisedb.dev/media/RYcV1kH.gif';
  if (muscle === 'Hamstrings') return 'https://static.exercisedb.dev/media/wQ2c4XD.gif';
  if (muscle === 'Glutes') return 'https://static.exercisedb.dev/media/aWedzZX.gif';
  if (muscle === 'Calves') return 'https://static.exercisedb.dev/media/8ozhUIZ.gif';

  // Absolute fallback
  return 'https://static.exercisedb.dev/media/RYcV1kH.gif';
}

function generateFormTips(muscle, name, movement) {
  const tips = {
    'Chest': ['Keep shoulder blades retracted', 'Control the negative portion', 'Full range of motion through the chest'],
    'Back': ['Squeeze shoulder blades together at peak contraction', 'Avoid using momentum', 'Keep a neutral spine throughout'],
    'Shoulders': ['Avoid shrugging the traps', 'Control the weight at all times', 'Keep elbows at the proper angle'],
    'Biceps': ['Keep elbows pinned to your sides', 'Squeeze at the top of the movement', 'Avoid swinging the weight'],
    'Triceps': ['Lock out fully at the top', 'Keep elbows close to your body', 'Control the eccentric phase'],
    'Forearms': ['Maintain a firm grip throughout', 'Use controlled movements', 'Full range of wrist motion'],
    'Core': ['Brace your core throughout', 'Avoid arching the lower back', 'Breathe steadily throughout the movement'],
    'Quadriceps': ['Push through your heels', 'Keep knees tracking over toes', 'Maintain an upright torso'],
    'Hamstrings': ['Maintain a slight bend in the knees', 'Feel the stretch in the hamstrings', 'Hip hinge with a flat back'],
    'Glutes': ['Squeeze glutes at the top', 'Drive through the heels', 'Maintain posterior pelvic tilt at peak'],
    'Calves': ['Full range of motion', 'Pause at the top for peak contraction', 'Controlled descent for maximum stretch'],
    'Hip Flexors': ['Keep movements slow and controlled', 'Avoid compensating with the lower back', 'Focus on the mind-muscle connection'],
    'Traps': ['Shrug directly upward', 'Hold at the top briefly', 'Avoid rolling the shoulders'],
    'Lats': ['Drive elbows down and back', 'Initiate with the lats not the biceps', 'Full stretch at the bottom'],
    'Full Body': ['Maintain proper form throughout', 'Engage your core', 'Breathe rhythmically'],
  };
  return tips[muscle] || tips['Full Body'];
}

// Write output
const outPath = path.join(__dirname, '..', 'src', 'data', 'exercises', 'database.ts');
fs.writeFileSync(outPath, output, 'utf8');

console.log(`✅ Generated ${selected.length} exercises to database.ts`);
