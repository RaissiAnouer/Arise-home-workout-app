const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rrwmrcohrxxxzokkhbrl.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY env var");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const toTitleCase = (str) => {
  return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

async function seed() {
  console.log("Fetching Yuhonas free-exercise-db...");
  const res = await fetch('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json');
  const data = await res.json();
  
  console.log(`Fetched ${data.length} exercises. Processing lookup tables...`);

  const uniqueCategories = new Set();
  const uniqueEquipment = new Set();
  const uniqueMuscles = new Set();
  
  data.forEach(ex => {
    if (ex.category) uniqueCategories.add(toTitleCase(ex.category));
    if (ex.equipment) uniqueEquipment.add(toTitleCase(ex.equipment));
    if (ex.primaryMuscles) ex.primaryMuscles.forEach(m => uniqueMuscles.add(toTitleCase(m)));
    if (ex.secondaryMuscles) ex.secondaryMuscles.forEach(m => uniqueMuscles.add(toTitleCase(m)));
  });

  // 1. Upsert Categories
  console.log("Upserting Categories...");
  for (let cat of uniqueCategories) {
    await supabase.from('categories').upsert({ name: cat, slug: cat.toLowerCase().replace(/ /g, '-') }, { onConflict: 'name' });
  }

  // 2. Upsert Equipment
  console.log("Upserting Equipment...");
  for (let eq of uniqueEquipment) {
    await supabase.from('equipment').upsert({ name: eq, slug: eq.toLowerCase().replace(/ /g, '-') }, { onConflict: 'name' });
  }

  // 3. Upsert Muscles
  console.log("Upserting Muscles...");
  for (let mus of uniqueMuscles) {
    await supabase.from('muscles').upsert({ name: mus, region: 'Other' }, { onConflict: 'name' });
  }

  // 4. Fetch all lookups to get IDs
  const { data: cats } = await supabase.from('categories').select('id, name');
  const { data: eqs } = await supabase.from('equipment').select('id, name');
  const { data: mus } = await supabase.from('muscles').select('id, name');
  const { data: diffs } = await supabase.from('difficulties').select('id, name');

  const catMap = cats.reduce((acc, c) => ({...acc, [c.name]: c.id}), {});
  const eqMap = eqs.reduce((acc, c) => ({...acc, [c.name]: c.id}), {});
  const musMap = mus.reduce((acc, c) => ({...acc, [c.name]: c.id}), {});
  const diffMap = diffs.reduce((acc, c) => ({...acc, [c.name]: c.id}), {});

  console.log("Deleting old exercises...");
  // Delete all to avoid mixing dummy data with real data
  await supabase.from('exercise_secondary_muscles').delete().neq('exercise_id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('exercises').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log("Inserting new exercises...");
  let count = 0;
  for (let ex of data) {
    const primaryMuscle = ex.primaryMuscles && ex.primaryMuscles.length > 0 ? toTitleCase(ex.primaryMuscles[0]) : null;
    const diffLevel = ex.level ? toTitleCase(ex.level) : 'Beginner';

    const baseUrl = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
    let thumbUrl = ex.images && ex.images.length > 0 ? baseUrl + ex.images[0] : null;
    let animUrl = ex.images && ex.images.length > 1 ? baseUrl + ex.images[1] : thumbUrl;

    const { data: newEx, error } = await supabase.from('exercises').upsert({
      name: ex.name,
      slug: ex.id || ex.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category_id: ex.category ? catMap[toTitleCase(ex.category)] : null,
      equipment_id: ex.equipment ? eqMap[toTitleCase(ex.equipment)] : null,
      difficulty_id: diffMap[diffLevel] || diffMap['Beginner'],
      primary_muscle_id: primaryMuscle ? musMap[primaryMuscle] : null,
      description: "A great exercise for your " + (primaryMuscle || "body") + ".",
      instructions: JSON.stringify(ex.instructions || []),
      thumbnail_url: thumbUrl,
      animation_url: animUrl, // Second image acts as peak contraction "animation"
      is_compound: ex.mechanic === 'compound'
    }, { onConflict: 'slug' }).select('id').single();

    if (error) {
      console.error(`Error inserting ${ex.name}:`, error.message);
      continue;
    }

    if (ex.secondaryMuscles && ex.secondaryMuscles.length > 0 && newEx) {
      for (let sec of ex.secondaryMuscles) {
        await supabase.from('exercise_secondary_muscles').upsert({
          exercise_id: newEx.id,
          muscle_id: musMap[toTitleCase(sec)]
        }, { onConflict: 'exercise_id,muscle_id' });
      }
    }
    
    count++;
    if (count % 100 === 0) console.log(`Processed ${count} / ${data.length}...`);
  }

  console.log("Seeding complete! Successfully added", count, "exercises.");
}

seed().catch(console.error);
