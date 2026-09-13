export interface DietMeal {
  type: string;
  name: string;
  emoji: string;
  calories?: number;
  protein?: string;
  carbs?: string;
  fats?: string;
  description?: string;
}

export interface DietDay {
  dayNumber: number;
  title?: string;
  totalCalories?: number;
  totalProtein?: string;
  meals: DietMeal[];
}

export interface DietPlan {
  id: string;
  title: string;
  subtitle: string;
  goal: 'BUILD MUSCLE' | 'LOSE WEIGHT' | 'KEEP FIT';
  calories: string;
  macros: {
    protein: string;
    carbs: string;
    fats: string;
  };
  overview: string;
  days: DietDay[];
}

export function getEmojiForMealType(type: string): string {
  const t = type.toLowerCase();
  if (t.includes('breakfast')) return '🥞';
  if (t.includes('morning snack')) return '🍏';
  if (t.includes('pre-workout') || t.includes('afternoon snack') || t.includes('snack')) return '🥪';
  if (t.includes('lunch')) return '🥗';
  if (t.includes('dinner')) return '🍲';
  if (t.includes('evening') || t.includes('night') || t.includes('recovery')) return '🥛';
  return '🍽️';
}

// Helper to generate a day
function createDay(
  dayNumber: number,
  title: string,
  totalCalories: number,
  totalProtein: string,
  meals: Omit<DietMeal, 'emoji'>[]
): DietDay {
  return {
    dayNumber,
    title,
    totalCalories,
    totalProtein,
    meals: meals.map((m) => ({
      ...m,
      emoji: getEmojiForMealType(m.type),
    })),
  };
}

// -------------------------------------------------------------
// 1. BUILD MUSCLE (Hypertrophy & Clean Bulk ~2800 kcal)
// -------------------------------------------------------------
const MUSCLE_GAIN_DAYS: DietDay[] = [
  createDay(1, 'High-Protein Kickoff', 2850, '185g', [
    { type: 'Breakfast', name: 'Oatmeal with Whey, Banana & Peanut Butter', calories: 650, protein: '42g', carbs: '80g', fats: '18g', description: 'Rolled oats, 1 scoop whey isolate, sliced banana, 2 tbsp natural peanut butter.' },
    { type: 'Morning Snack', name: 'Greek Yogurt with Mixed Berries & Walnuts', calories: 350, protein: '25g', carbs: '30g', fats: '14g', description: '200g Greek yogurt 2%, blueberries, raspberries, crushed walnuts.' },
    { type: 'Lunch', name: 'Grilled Chicken Breast with Quinoa & Steamed Broccoli', calories: 750, protein: '55g', carbs: '70g', fats: '22g', description: '220g chicken breast, 1 cup cooked quinoa, olive oil drizzle, steamed broccoli.' },
    { type: 'Afternoon Snack', name: 'Whole Wheat Turkey & Avocado Wrap', calories: 450, protein: '28g', carbs: '40g', fats: '18g', description: 'Whole wheat tortilla, 120g sliced turkey breast, sliced avocado, spinach.' },
    { type: 'Dinner', name: 'Baked Salmon with Sweet Potato & Asparagus', calories: 650, protein: '45g', carbs: '55g', fats: '24g', description: '200g wild salmon fillet, baked sweet potato with olive oil, grilled asparagus.' },
  ]),
  createDay(2, 'Lean Beef Power', 2820, '190g', [
    { type: 'Breakfast', name: '4-Egg Scramble with Spinach, Feta & Sourdough Toast', calories: 620, protein: '40g', carbs: '48g', fats: '28g', description: '3 whole eggs + 2 egg whites, baby spinach, 30g feta, 2 slices toasted sourdough.' },
    { type: 'Morning Snack', name: 'Protein Shake & Rice Cakes with Almond Butter', calories: 380, protein: '30g', carbs: '38g', fats: '12g', description: '1 scoop whey protein with almond milk, 3 brown rice cakes with almond butter.' },
    { type: 'Lunch', name: 'Lean Ground Beef Bowl with Jasmine Rice & Zucchini', calories: 780, protein: '52g', carbs: '82g', fats: '24g', description: '200g 5% lean minced beef, 1.5 cups jasmine rice, sautéed zucchini, light soy sauce.' },
    { type: 'Afternoon Snack', name: 'Cottage Cheese with Pineapple Chunks & Chia Seeds', calories: 360, protein: '32g', carbs: '36g', fats: '8g', description: '250g low-fat cottage cheese, fresh pineapple chunks, 1 tbsp chia seeds.' },
    { type: 'Dinner', name: 'Seared Tuna Steak with Brown Rice & Green Beans', calories: 680, protein: '48g', carbs: '60g', fats: '22g', description: '200g fresh tuna steak, 1 cup brown rice, garlic steamed green beans.' },
  ]),
  createDay(3, 'Complex Carb Loading', 2880, '180g', [
    { type: 'Breakfast', name: 'Protein Pancakes with Maple Syrup & Strawberries', calories: 680, protein: '45g', carbs: '88g', fats: '14g', description: 'Oat flour & whey batter, topped with pure maple syrup and fresh strawberries.' },
    { type: 'Morning Snack', name: 'Boiled Eggs & Apple with Mixed Nuts', calories: 370, protein: '20g', carbs: '28g', fats: '20g', description: '2 hard-boiled free-range eggs, 1 crisp green apple, 25g raw almonds.' },
    { type: 'Lunch', name: 'Turkey Meatballs with Whole Grain Pasta & Marinara', calories: 760, protein: '56g', carbs: '85g', fats: '18g', description: '220g lean turkey meatballs, whole wheat penne, rich basil tomato marinara sauce.' },
    { type: 'Afternoon Snack', name: 'Banana & Peanut Butter Protein Smoothie', calories: 420, protein: '32g', carbs: '45g', fats: '14g', description: '1 large banana, 30g whey, 1 tbsp peanut butter, oat milk.' },
    { type: 'Dinner', name: 'Grilled Sirloin Steak with Roasted Baby Potatoes & Carrots', calories: 650, protein: '48g', carbs: '48g', fats: '26g', description: '180g lean sirloin steak, herb roasted baby potatoes, glazed baby carrots.' },
  ]),
  createDay(4, 'Seafood Recovery', 2790, '188g', [
    { type: 'Breakfast', name: 'Smoked Salmon & Egg White Bagel', calories: 600, protein: '44g', carbs: '62g', fats: '18g', description: 'Whole grain bagel, 100g smoked salmon, 3 egg whites, light cream cheese, capers.' },
    { type: 'Morning Snack', name: 'Skyr Yogurt with Granola & Honey', calories: 340, protein: '28g', carbs: '42g', fats: '6g', description: '200g Icelandic Skyr, 40g whole grain granola, 1 tsp raw honey.' },
    { type: 'Lunch', name: 'Cajun Chicken & Roasted Sweet Potato Wedges', calories: 770, protein: '54g', carbs: '78g', fats: '24g', description: '220g cajun-spiced chicken breast, roasted sweet potato wedges, side garden salad.' },
    { type: 'Afternoon Snack', name: 'Tuna Salad on Whole Wheat Crackers', calories: 400, protein: '34g', carbs: '32g', fats: '14g', description: '1 can tuna in springwater mixed with light mayo, celery on whole wheat crispbread.' },
    { type: 'Dinner', name: 'Baked Cod with Lemon Herb Quinoa & Roasted Veggies', calories: 680, protein: '46g', carbs: '65g', fats: '22g', description: '230g Atlantic cod fillet, lemon herb quinoa, roasted bell peppers and zucchini.' },
  ]),
  createDay(5, 'Heavy Leg Day Fuel', 2920, '192g', [
    { type: 'Breakfast', name: 'Mass Gain Power Bowl (Oats, Eggs & Toast)', calories: 720, protein: '48g', carbs: '85g', fats: '20g', description: 'Bowl of warm oats with honey, alongside 3 scrambled eggs and 1 slice toast.' },
    { type: 'Morning Snack', name: 'Protein Bar & Handful of Cashews', calories: 380, protein: '26g', carbs: '32g', fats: '16g', description: 'High-protein whey bar + 30g raw unsalted cashew nuts.' },
    { type: 'Lunch', name: 'Beef Stir-Fry with Egg Noodles & Snap Peas', calories: 810, protein: '58g', carbs: '84g', fats: '26g', description: '200g flank steak strips, egg noodles, snap peas, bell pepper, sesame teriyaki glaze.' },
    { type: 'Afternoon Snack', name: 'Chocolate Whey & Rice Cake Stack', calories: 360, protein: '30g', carbs: '42g', fats: '6g', description: 'Whey protein shake with 4 salted caramel rice cakes.' },
    { type: 'Dinner', name: 'Roast Chicken Breast with Mashed Potatoes & Green Peas', calories: 650, protein: '50g', carbs: '62g', fats: '18g', description: '220g oven-roasted chicken breast, homemade potato mash, steamed green peas.' },
  ]),
  createDay(6, 'Weekend Hypertrophy', 2840, '182g', [
    { type: 'Breakfast', name: 'French Toast with Greek Yogurt & Blueberries', calories: 640, protein: '42g', carbs: '78g', fats: '16g', description: '3 slices brioche dipped in egg-protein mix, topped with vanilla Greek yogurt & berries.' },
    { type: 'Morning Snack', name: 'Hard Boiled Eggs with Guacamole & Crackers', calories: 350, protein: '20g', carbs: '26g', fats: '18g', description: '2 eggs, 50g fresh guacamole, multigrain seed crackers.' },
    { type: 'Lunch', name: 'Pulled Pork Bowl with Brown Rice & Black Beans', calories: 790, protein: '54g', carbs: '80g', fats: '24g', description: '200g lean pulled pork shoulder, brown rice, black beans, corn, fresh salsa.' },
    { type: 'Afternoon Snack', name: 'Vanilla Protein Shake with Oats & Peanut Butter', calories: 430, protein: '36g', carbs: '44g', fats: '14g', description: 'Whey isolate, powdered oats, 1 tbsp peanut butter blended with cold water.' },
    { type: 'Dinner', name: 'Grilled Sea Bass with Couscous & Grilled Eggplant', calories: 630, protein: '46g', carbs: '56g', fats: '22g', description: '220g Mediterranean sea bass, fluffy herb couscous, seasoned grilled eggplant.' },
  ]),
  createDay(7, 'Rest & Rebuild', 2780, '186g', [
    { type: 'Breakfast', name: 'Spinach & Turkey Bacon Omelet with Avocado Toast', calories: 630, protein: '45g', carbs: '45g', fats: '28g', description: '3 eggs, 3 strips turkey bacon, baby spinach, 1 slice sourdough with mashed avocado.' },
    { type: 'Morning Snack', name: 'Cottage Cheese with Berries & Pumpkin Seeds', calories: 340, protein: '30g', carbs: '28g', fats: '10g', description: '220g low fat cottage cheese, fresh blackberries, roasted pumpkin seeds.' },
    { type: 'Lunch', name: 'Herb Grilled Chicken with Basmati Rice & Roasted Asparagus', calories: 760, protein: '55g', carbs: '78g', fats: '22g', description: '220g chicken breast, aromatic basmati rice, olive oil roasted asparagus.' },
    { type: 'Afternoon Snack', name: 'Turkey Jerky & Fresh Apple with Peanut Butter', calories: 380, protein: '28g', carbs: '35g', fats: '12g', description: '50g natural turkey jerky, 1 sliced gala apple with 1 tbsp peanut butter.' },
    { type: 'Dinner', name: 'Grass-Fed Beef Patty with Roasted Sweet Potato & Salad', calories: 670, protein: '48g', carbs: '54g', fats: '26g', description: '200g beef burger patty (no bun), oven-baked sweet potato wedges, leafy green salad.' },
  ]),
  createDay(8, 'Power Week 2 Start', 2860, '188g', [
    { type: 'Breakfast', name: 'Protein Oatmeal with Dark Chocolate Chips & Whey', calories: 670, protein: '44g', carbs: '82g', fats: '18g', description: 'Steel cut oats, chocolate whey, 10g 85% dark chocolate chips, sliced strawberries.' },
    { type: 'Morning Snack', name: 'Greek Yogurt with Sliced Kiwi & Almonds', calories: 350, protein: '26g', carbs: '32g', fats: '12g', description: '200g Greek yogurt, 2 sliced ripe kiwis, 20g sliced almonds.' },
    { type: 'Lunch', name: 'Teriyaki Chicken Breast with Jasmine Rice & Broccoli', calories: 780, protein: '56g', carbs: '84g', fats: '20g', description: '230g chicken breast in low-sugar teriyaki glaze, jasmine rice, steamed broccoli.' },
    { type: 'Afternoon Snack', name: 'Tuna & Egg Protein Salad Wrap', calories: 420, protein: '34g', carbs: '38g', fats: '14g', description: 'Whole wheat wrap, 1 tin tuna, 1 chopped hard-boiled egg, light mustard.' },
    { type: 'Dinner', name: 'Baked Salmon Fillet with Quinoa & Sautéed Kale', calories: 640, protein: '46g', carbs: '52g', fats: '24g', description: '200g Atlantic salmon, 1 cup cooked quinoa, garlic sautéed kale.' },
  ]),
  createDay(9, 'Steak & Anabolic Fuel', 2830, '190g', [
    { type: 'Breakfast', name: 'Western Omelet (Ham, Peppers, Cheddar) & Toast', calories: 640, protein: '46g', carbs: '42g', fats: '28g', description: '3 whole eggs + 2 whites, diced lean ham, bell peppers, light cheddar, 2 slices rye toast.' },
    { type: 'Morning Snack', name: 'Whey Protein Shake & 2 Bananas', calories: 390, protein: '30g', carbs: '58g', fats: '4g', description: '30g vanilla whey isolate shaken with ice water + 2 medium ripe bananas.' },
    { type: 'Lunch', name: 'Grilled Flank Steak with Baked Potato & Sour Cream', calories: 790, protein: '54g', carbs: '74g', fats: '28g', description: '200g lean flank steak, large baked russet potato with light sour cream & chives.' },
    { type: 'Afternoon Snack', name: 'Cottage Cheese with Sliced Peaches & Walnuts', calories: 360, protein: '30g', carbs: '34g', fats: '10g', description: '220g low-fat cottage cheese, fresh sliced peach, 15g walnut halves.' },
    { type: 'Dinner', name: 'Roasted Turkey Breast with Wild Rice & Green Beans', calories: 650, protein: '50g', carbs: '58g', fats: '20g', description: '220g roasted turkey breast, wild rice blend, steamed garlic green beans.' },
  ]),
  createDay(10, 'Mid-Week Hypertrophy', 2870, '184g', [
    { type: 'Breakfast', name: 'Blueberry Protein Waffles with Pure Maple Syrup', calories: 660, protein: '42g', carbs: '86g', fats: '14g', description: '2 homemade whey protein waffles topped with warm blueberries & 1 tbsp maple syrup.' },
    { type: 'Morning Snack', name: 'Boiled Eggs & Rice Cakes with Peanut Butter', calories: 370, protein: '22g', carbs: '35g', fats: '16g', description: '2 hard-boiled eggs, 2 brown rice cakes with creamy peanut butter.' },
    { type: 'Lunch', name: 'BBQ Chicken Bowl with Sweet Corn & Brown Rice', calories: 770, protein: '55g', carbs: '82g', fats: '20g', description: '220g diced chicken breast in smoky BBQ sauce, brown rice, sweet corn, black beans.' },
    { type: 'Afternoon Snack', name: 'Strawberry Banana Protein Smoothie', calories: 410, protein: '32g', carbs: '52g', fats: '8g', description: 'Frozen strawberries, 1 banana, 30g vanilla whey, skim milk.' },
    { type: 'Dinner', name: 'Pan-Seared White Fish with Roasted Potatoes & Spinach', calories: 660, protein: '46g', carbs: '60g', fats: '22g', description: '230g cod or haddock fillet, herb roasted baby red potatoes, sautéed garlic spinach.' },
  ]),
  createDay(11, 'High Endurance Hypertrophy', 2850, '186g', [
    { type: 'Breakfast', name: 'Scrambled Eggs with Smoked Salmon & Sourdough', calories: 620, protein: '44g', carbs: '46g', fats: '24g', description: '3 eggs scrambled with chives, 80g smoked salmon, 2 slices toasted sourdough.' },
    { type: 'Morning Snack', name: 'Skyr Yogurt with Granola & Chia Seeds', calories: 350, protein: '28g', carbs: '38g', fats: '8g', description: '200g Icelandic skyr, 35g oat granola, 1 tbsp chia seeds.' },
    { type: 'Lunch', name: 'Lean Ground Turkey Pasta with Tomato Sauce & Parmesan', calories: 790, protein: '56g', carbs: '84g', fats: '20g', description: '220g extra lean ground turkey, whole wheat rigatoni, marinara, grated parmesan.' },
    { type: 'Afternoon Snack', name: 'Protein Bar & Sliced Apple with Peanut Butter', calories: 430, protein: '28g', carbs: '44g', fats: '15g', description: 'Clean whey protein bar + 1 sliced apple with 1 tbsp peanut butter.' },
    { type: 'Dinner', name: 'Grilled Chicken Thighs with Quinoa & Roasted Veggies', calories: 660, protein: '48g', carbs: '56g', fats: '24g', description: '200g skinless grilled chicken thighs, seasoned quinoa, roasted bell peppers & zucchini.' },
  ]),
  createDay(12, 'Upper Body Blast Day', 2900, '194g', [
    { type: 'Breakfast', name: 'Loaded Breakfast Burrito (Eggs, Turkey Sausage, Cheese)', calories: 700, protein: '50g', carbs: '58g', fats: '28g', description: 'Large tortilla, 3 eggs, 2 turkey sausage links, shredded cheddar, fresh salsa.' },
    { type: 'Morning Snack', name: 'Protein Shake & Mixed Raw Nuts', calories: 380, protein: '32g', carbs: '20g', fats: '18g', description: '1 scoop chocolate whey with water + 30g almonds and walnuts.' },
    { type: 'Lunch', name: 'Beef Tenderloin with Sweet Potato Mash & Broccoli', calories: 780, protein: '56g', carbs: '72g', fats: '26g', description: '200g lean beef tenderloin steak, sweet potato mash with cinnamon, steamed broccoli.' },
    { type: 'Afternoon Snack', name: 'Cottage Cheese Bowl with Honey & Crushed Granola', calories: 380, protein: '30g', carbs: '42g', fats: '8g', description: '220g cottage cheese, 1 tsp raw honey, 30g cluster granola.' },
    { type: 'Dinner', name: 'Baked Salmon with Wild Rice & Asparagus Spears', calories: 660, protein: '46g', carbs: '54g', fats: '26g', description: '200g salmon fillet baked with lemon pepper, wild rice pilaf, grilled asparagus.' },
  ]),
  createDay(13, 'Weekend High Volume Fuel', 2840, '185g', [
    { type: 'Breakfast', name: 'Oatmeal with Whey, Blueberries & Almond Butter', calories: 650, protein: '42g', carbs: '78g', fats: '18g', description: 'Rolled oats, 1 scoop vanilla whey, fresh blueberries, 1.5 tbsp almond butter.' },
    { type: 'Morning Snack', name: 'Hard-Boiled Eggs with Whole Grain Crackers', calories: 340, protein: '20g', carbs: '26g', fats: '16g', description: '2 boiled eggs with black pepper + whole wheat seed crackers.' },
    { type: 'Lunch', name: 'Honey Mustard Chicken with Brown Rice & Green Peas', calories: 760, protein: '54g', carbs: '80g', fats: '20g', description: '220g chicken breast glazed in honey mustard, brown rice, sweet green peas.' },
    { type: 'Afternoon Snack', name: 'Banana Protein Smoothie with Oat Milk', calories: 420, protein: '32g', carbs: '52g', fats: '10g', description: '1 banana, 30g whey isolate, 1 tbsp chia seeds, unsweetened oat milk.' },
    { type: 'Dinner', name: 'Grilled Pork Loin with Roasted Fingerling Potatoes', calories: 670, protein: '48g', carbs: '60g', fats: '24g', description: '200g lean pork loin chops, rosemary roasted fingerling potatoes, side salad.' },
  ]),
  createDay(14, 'Week 2 Rebuild & Recover', 2800, '188g', [
    { type: 'Breakfast', name: 'Avocado Toast with 3 Poached Eggs & Turkey Bacon', calories: 640, protein: '44g', carbs: '44g', fats: '28g', description: '2 slices toasted whole grain, mashed avocado, 3 poached eggs, 2 slices turkey bacon.' },
    { type: 'Morning Snack', name: 'Greek Yogurt with Fresh Strawberries & Pumpkin Seeds', calories: 340, protein: '26g', carbs: '30g', fats: '10g', description: '200g Greek yogurt 2%, sliced strawberries, 15g pumpkin seeds.' },
    { type: 'Lunch', name: 'Chili Con Carne (Lean Beef & Kidney Beans) with Rice', calories: 790, protein: '56g', carbs: '84g', fats: '22g', description: '220g lean ground beef chili, red kidney beans, tomatoes, 1 cup white rice.' },
    { type: 'Afternoon Snack', name: 'Protein Bar & Orange Slices', calories: 360, protein: '24g', carbs: '40g', fats: '10g', description: 'Chocolate whey bar + 1 fresh navel orange.' },
    { type: 'Dinner', name: 'Seared Tuna Steak with Quinoa & Steamed Zucchini', calories: 670, protein: '48g', carbs: '56g', fats: '22g', description: '200g tuna steak, fluffy quinoa, steamed garlic zucchini slices.' },
  ]),
  // Days 15 to 21 (Week 3)
  createDay(15, 'Week 3 Peak Mass', 2880, '190g', [
    { type: 'Breakfast', name: 'Protein Berry Bowl with Oats, Whey & Chia', calories: 670, protein: '44g', carbs: '82g', fats: '16g', description: 'Oatmeal cooked with almond milk, stirred with 1 scoop vanilla whey, topped with mixed berries.' },
    { type: 'Morning Snack', name: 'Cottage Cheese with Pineapple & Almonds', calories: 360, protein: '30g', carbs: '32g', fats: '12g', description: '220g cottage cheese, fresh pineapple rings, 15g sliced almonds.' },
    { type: 'Lunch', name: 'Lemon Herb Grilled Chicken with Jasmine Rice & Green Beans', calories: 770, protein: '55g', carbs: '80g', fats: '22g', description: '230g chicken breast, jasmine rice with lemon zest, steamed tender green beans.' },
    { type: 'Afternoon Snack', name: 'Turkey Breast Slices & Rice Cakes with Guacamole', calories: 410, protein: '32g', carbs: '36g', fats: '14g', description: '120g deli turkey breast, 3 brown rice cakes, 50g guacamole.' },
    { type: 'Dinner', name: 'Sirloin Steak with Baked Sweet Potato & Sautéed Spinach', calories: 670, protein: '48g', carbs: '54g', fats: '26g', description: '190g lean sirloin steak, baked sweet potato, garlic sautéed baby spinach.' },
  ]),
  createDay(16, 'Hypertrophy Ignition', 2850, '186g', [
    { type: 'Breakfast', name: '4-Egg Omelet with Mushrooms, Swiss Cheese & Toast', calories: 650, protein: '46g', carbs: '42g', fats: '30g', description: '3 whole eggs + 2 whites, button mushrooms, 30g Swiss cheese, 2 slices rye toast.' },
    { type: 'Morning Snack', name: 'Whey Protein Shake & 2 Rice Cakes with Peanut Butter', calories: 380, protein: '32g', carbs: '34g', fats: '12g', description: 'Chocolate whey with cold water + 2 rice cakes with 1 tbsp peanut butter.' },
    { type: 'Lunch', name: 'Lean Ground Beef & Rice Bowl with Sautéed Bell Peppers', calories: 790, protein: '54g', carbs: '82g', fats: '24g', description: '200g 5% ground beef, white basmati rice, tri-color bell peppers.' },
    { type: 'Afternoon Snack', name: 'Greek Yogurt with Granola & Drizzle of Honey', calories: 360, protein: '28g', carbs: '42g', fats: '8g', description: '200g plain Greek yogurt, 35g oat granola, 1 tsp clover honey.' },
    { type: 'Dinner', name: 'Baked Salmon with Brown Rice & Steamed Broccoli', calories: 670, protein: '46g', carbs: '58g', fats: '24g', description: '200g salmon fillet, 1 cup cooked brown rice, steamed broccoli florets.' },
  ]),
  createDay(17, 'Maximum Energy Drive', 2870, '188g', [
    { type: 'Breakfast', name: 'Protein Pancakes with Sliced Banana & Pure Maple Syrup', calories: 680, protein: '45g', carbs: '88g', fats: '14g', description: '3 fluffy whey protein pancakes, 1 sliced banana, 1.5 tbsp maple syrup.' },
    { type: 'Morning Snack', name: 'Boiled Eggs & Apple with Mixed Nuts', calories: 360, protein: '20g', carbs: '28g', fats: '18g', description: '2 hard-boiled eggs, 1 honeycrisp apple, 20g mixed walnuts and almonds.' },
    { type: 'Lunch', name: 'Roasted Turkey Breast with Quinoa & Asparagus', calories: 760, protein: '55g', carbs: '78g', fats: '20g', description: '220g carved turkey breast, fluffy tricolor quinoa, roasted asparagus.' },
    { type: 'Afternoon Snack', name: 'Peanut Butter & Jelly Protein Sandwich', calories: 430, protein: '28g', carbs: '50g', fats: '14g', description: '2 slices whole wheat bread, 1.5 tbsp natural peanut butter, 1 tbsp fruit jam.' },
    { type: 'Dinner', name: 'Cod Fillet with Roasted Baby Potatoes & Snap Peas', calories: 640, protein: '46g', carbs: '62g', fats: '20g', description: '230g Pacific cod, herb roasted red potatoes, sautéed sugar snap peas.' },
  ]),
  createDay(18, 'Clean Bulking Consistency', 2840, '185g', [
    { type: 'Breakfast', name: 'Egg White & Whole Egg Scramble with Avocado Bagel', calories: 640, protein: '44g', carbs: '60g', fats: '22g', description: '2 whole eggs + 3 whites, half whole wheat bagel with mashed avocado.' },
    { type: 'Morning Snack', name: 'Skyr Yogurt with Blueberries & Chia Seeds', calories: 340, protein: '28g', carbs: '36g', fats: '8g', description: '200g skyr, 1/2 cup fresh blueberries, 1 tbsp chia seeds.' },
    { type: 'Lunch', name: 'Cajun Chicken Breast with Sweet Potato & Green Peas', calories: 780, protein: '56g', carbs: '82g', fats: '20g', description: '220g cajun seasoned chicken breast, baked sweet potato wedges, green peas.' },
    { type: 'Afternoon Snack', name: 'Tuna Salad on Multigrain Crackers', calories: 400, protein: '34g', carbs: '32g', fats: '14g', description: '1 can white albacore tuna, light mayo, multigrain seed crispbread.' },
    { type: 'Dinner', name: 'Grilled Pork Tenderloin with Rice Pilaf & Zucchini', calories: 680, protein: '48g', carbs: '62g', fats: '22g', description: '200g grilled pork tenderloin medallions, seasoned rice pilaf, grilled zucchini.' },
  ]),
  createDay(19, 'Heavy Workout Progression', 2910, '192g', [
    { type: 'Breakfast', name: 'Power Oats with Whey, Peanut Butter & Sliced Banana', calories: 690, protein: '45g', carbs: '84g', fats: '19g', description: 'Rolled oats, 1 scoop vanilla whey, 1.5 tbsp peanut butter, 1 banana.' },
    { type: 'Morning Snack', name: 'Protein Bar & Handful of Cashews', calories: 380, protein: '26g', carbs: '32g', fats: '16g', description: 'High-protein bar + 25g raw unsalted cashew nuts.' },
    { type: 'Lunch', name: 'Beef Stir-Fry with Rice Noodles & Broccoli', calories: 810, protein: '58g', carbs: '86g', fats: '24g', description: '200g lean beef strips, rice vermicelli noodles, fresh broccoli, teriyaki sauce.' },
    { type: 'Afternoon Snack', name: 'Whey Protein Shake & 4 Rice Cakes', calories: 360, protein: '30g', carbs: '44g', fats: '5g', description: 'Whey isolate with ice water + 4 lightly salted rice cakes.' },
    { type: 'Dinner', name: 'Roast Chicken Breast with Mashed Potatoes & Carrots', calories: 670, protein: '50g', carbs: '64g', fats: '20g', description: '220g roasted chicken breast, creamy potato mash, steamed baby carrots.' },
  ]),
  createDay(20, 'Weekend Growth', 2850, '184g', [
    { type: 'Breakfast', name: 'French Toast with Greek Yogurt & Strawberries', calories: 650, protein: '42g', carbs: '80g', fats: '16g', description: '3 slices brioche soaked in egg-cinnamon wash, vanilla Greek yogurt, strawberries.' },
    { type: 'Morning Snack', name: 'Hard-Boiled Eggs with Guacamole & Sourdough Toast', calories: 360, protein: '22g', carbs: '28g', fats: '18g', description: '2 eggs, 40g guacamole, 1 slice toasted sourdough.' },
    { type: 'Lunch', name: 'Pulled Chicken Bowl with Brown Rice, Corn & Black Beans', calories: 780, protein: '55g', carbs: '82g', fats: '22g', description: '220g pulled chicken breast, brown rice, sweet corn, black beans, salsa.' },
    { type: 'Afternoon Snack', name: 'Vanilla Protein Smoothie with Oats & Almond Milk', calories: 410, protein: '34g', carbs: '44g', fats: '10g', description: '1 scoop vanilla whey, 30g ground oats, unsweetened almond milk.' },
    { type: 'Dinner', name: 'Grilled Sea Bass with Quinoa & Roasted Veggies', calories: 650, protein: '46g', carbs: '58g', fats: '22g', description: '220g sea bass fillet, tricolor quinoa, roasted zucchini and bell peppers.' },
  ]),
  createDay(21, 'Week 3 Rebuild Session', 2800, '188g', [
    { type: 'Breakfast', name: 'Western Omelet with Toast & Turkey Bacon', calories: 630, protein: '45g', carbs: '44g', fats: '27g', description: '3 eggs, lean ham, diced peppers, cheddar, 2 slices turkey bacon, 1 slice toast.' },
    { type: 'Morning Snack', name: 'Cottage Cheese with Blackberries & Pumpkin Seeds', calories: 340, protein: '30g', carbs: '28g', fats: '10g', description: '220g low-fat cottage cheese, fresh blackberries, pumpkin seeds.' },
    { type: 'Lunch', name: 'Herb Grilled Chicken with Basmati Rice & Asparagus', calories: 760, protein: '55g', carbs: '78g', fats: '22g', description: '220g chicken breast, aromatic basmati rice, roasted asparagus.' },
    { type: 'Afternoon Snack', name: 'Turkey Jerky & Apple with Peanut Butter', calories: 390, protein: '28g', carbs: '36g', fats: '13g', description: '50g turkey jerky, 1 sliced apple, 1 tbsp peanut butter.' },
    { type: 'Dinner', name: 'Grass-Fed Beef Patty with Sweet Potato Wedges & Greens', calories: 680, protein: '48g', carbs: '56g', fats: '26g', description: '200g beef patty, roasted sweet potato wedges, mixed green salad.' },
  ]),
  // Days 22 to 28 (Week 4)
  createDay(22, 'Week 4 Hypertrophy Peak', 2870, '190g', [
    { type: 'Breakfast', name: 'Oatmeal with Chocolate Whey, Banana & Peanut Butter', calories: 670, protein: '44g', carbs: '82g', fats: '18g', description: 'Rolled oats, chocolate whey isolate, sliced ripe banana, 2 tbsp natural peanut butter.' },
    { type: 'Morning Snack', name: 'Greek Yogurt with Blueberries & Walnuts', calories: 350, protein: '26g', carbs: '30g', fats: '14g', description: '200g Greek yogurt, fresh blueberries, 20g walnut pieces.' },
    { type: 'Lunch', name: 'Grilled Chicken Breast with Quinoa & Steamed Broccoli', calories: 770, protein: '56g', carbs: '78g', fats: '22g', description: '220g chicken breast, 1.5 cups cooked quinoa, steamed broccoli florets.' },
    { type: 'Afternoon Snack', name: 'Whole Wheat Turkey & Avocado Wrap', calories: 430, protein: '28g', carbs: '38g', fats: '17g', description: 'Whole wheat wrap, 120g sliced turkey breast, avocado, baby spinach.' },
    { type: 'Dinner', name: 'Baked Salmon with Sweet Potato & Grilled Asparagus', calories: 650, protein: '46g', carbs: '54g', fats: '24g', description: '200g wild salmon, baked sweet potato, seasoned grilled asparagus.' },
  ]),
  createDay(23, 'Power Beef Drive', 2840, '192g', [
    { type: 'Breakfast', name: '4-Egg Scramble with Spinach, Feta & Sourdough', calories: 630, protein: '42g', carbs: '46g', fats: '28g', description: '3 whole eggs + 2 whites, spinach, feta cheese, 2 slices sourdough toast.' },
    { type: 'Morning Snack', name: 'Protein Shake & Rice Cakes with Almond Butter', calories: 380, protein: '30g', carbs: '38g', fats: '12g', description: '1 scoop whey protein with water, 3 rice cakes with almond butter.' },
    { type: 'Lunch', name: 'Lean Ground Beef Bowl with Jasmine Rice & Zucchini', calories: 790, protein: '54g', carbs: '84g', fats: '24g', description: '200g 5% lean beef, jasmine rice, sautéed zucchini, light soy drizzle.' },
    { type: 'Afternoon Snack', name: 'Cottage Cheese with Pineapple & Chia Seeds', calories: 360, protein: '32g', carbs: '34g', fats: '8g', description: '250g cottage cheese, fresh pineapple, 1 tbsp chia seeds.' },
    { type: 'Dinner', name: 'Seared Tuna Steak with Brown Rice & Green Beans', calories: 680, protein: '48g', carbs: '60g', fats: '22g', description: '200g fresh tuna steak, 1 cup brown rice, garlic green beans.' },
  ]),
  createDay(24, 'Muscle Synthesis Boost', 2880, '184g', [
    { type: 'Breakfast', name: 'Protein Pancakes with Pure Maple Syrup & Strawberries', calories: 670, protein: '44g', carbs: '86g', fats: '14g', description: 'Whey protein pancakes, fresh strawberries, 1.5 tbsp pure maple syrup.' },
    { type: 'Morning Snack', name: 'Hard Boiled Eggs & Apple with Mixed Nuts', calories: 360, protein: '20g', carbs: '28g', fats: '18g', description: '2 eggs, 1 crisp apple, 20g almonds and walnuts.' },
    { type: 'Lunch', name: 'Turkey Meatballs with Whole Grain Pasta & Marinara', calories: 770, protein: '56g', carbs: '84g', fats: '18g', description: '220g turkey meatballs, whole grain penne, basil tomato marinara.' },
    { type: 'Afternoon Snack', name: 'Banana & Peanut Butter Protein Smoothie', calories: 420, protein: '32g', carbs: '46g', fats: '13g', description: '1 banana, 30g whey, 1 tbsp peanut butter, oat milk.' },
    { type: 'Dinner', name: 'Grilled Sirloin Steak with Roasted Potatoes & Carrots', calories: 660, protein: '48g', carbs: '50g', fats: '26g', description: '190g sirloin steak, roasted baby potatoes, glazed carrots.' },
  ]),
  createDay(25, 'Seafood Hypertrophy', 2820, '188g', [
    { type: 'Breakfast', name: 'Smoked Salmon & Egg White Bagel', calories: 610, protein: '44g', carbs: '62g', fats: '19g', description: 'Whole grain bagel, 100g smoked salmon, 3 egg whites, light cream cheese.' },
    { type: 'Morning Snack', name: 'Skyr Yogurt with Granola & Honey', calories: 350, protein: '28g', carbs: '42g', fats: '6g', description: '200g skyr, 40g granola, 1 tsp raw honey.' },
    { type: 'Lunch', name: 'Cajun Chicken & Roasted Sweet Potato Wedges', calories: 780, protein: '55g', carbs: '80g', fats: '24g', description: '220g cajun chicken breast, roasted sweet potato wedges, garden salad.' },
    { type: 'Afternoon Snack', name: 'Tuna Salad on Whole Wheat Crispbread', calories: 400, protein: '34g', carbs: '32g', fats: '14g', description: '1 can tuna in water, light mayo, whole wheat crispbread.' },
    { type: 'Dinner', name: 'Baked Cod with Lemon Herb Quinoa & Roasted Veggies', calories: 680, protein: '46g', carbs: '64g', fats: '22g', description: '230g cod fillet, lemon herb quinoa, roasted bell peppers & zucchini.' },
  ]),
  createDay(26, 'High Volume Strength Fuel', 2920, '194g', [
    { type: 'Breakfast', name: 'Mass Gain Power Bowl (Oats, Eggs & Toast)', calories: 730, protein: '48g', carbs: '86g', fats: '20g', description: 'Bowl of warm oats with honey, 3 scrambled eggs, 1 slice sourdough toast.' },
    { type: 'Morning Snack', name: 'Protein Bar & Handful of Cashews', calories: 380, protein: '26g', carbs: '32g', fats: '16g', description: 'Clean whey protein bar + 30g raw cashew nuts.' },
    { type: 'Lunch', name: 'Beef Stir-Fry with Egg Noodles & Snap Peas', calories: 810, protein: '58g', carbs: '84g', fats: '26g', description: '200g beef strips, egg noodles, snap peas, bell pepper, teriyaki glaze.' },
    { type: 'Afternoon Snack', name: 'Chocolate Whey & Rice Cake Stack', calories: 360, protein: '30g', carbs: '42g', fats: '6g', description: 'Whey protein shake with 4 salted caramel rice cakes.' },
    { type: 'Dinner', name: 'Roast Chicken Breast with Mashed Potatoes & Green Peas', calories: 660, protein: '50g', carbs: '64g', fats: '18g', description: '220g roasted chicken breast, potato mash, steamed green peas.' },
  ]),
  createDay(27, 'Weekend Muscle Load', 2850, '184g', [
    { type: 'Breakfast', name: 'French Toast with Greek Yogurt & Blueberries', calories: 640, protein: '42g', carbs: '78g', fats: '16g', description: '3 slices brioche in egg-protein mix, topped with vanilla Greek yogurt & berries.' },
    { type: 'Morning Snack', name: 'Hard Boiled Eggs with Guacamole & Crackers', calories: 350, protein: '20g', carbs: '26g', fats: '18g', description: '2 eggs, 50g guacamole, multigrain seed crackers.' },
    { type: 'Lunch', name: 'Pulled Pork Bowl with Brown Rice & Black Beans', calories: 790, protein: '54g', carbs: '80g', fats: '24g', description: '200g lean pulled pork, brown rice, black beans, sweet corn, salsa.' },
    { type: 'Afternoon Snack', name: 'Vanilla Protein Shake with Oats & Peanut Butter', calories: 430, protein: '36g', carbs: '44g', fats: '14g', description: 'Whey isolate, powdered oats, 1 tbsp peanut butter, cold water.' },
    { type: 'Dinner', name: 'Grilled Sea Bass with Couscous & Grilled Eggplant', calories: 640, protein: '46g', carbs: '58g', fats: '22g', description: '220g sea bass, herb couscous, seasoned grilled eggplant.' },
  ]),
  createDay(28, 'Rest & Hypertrophy Consolidation', 2790, '186g', [
    { type: 'Breakfast', name: 'Spinach & Turkey Bacon Omelet with Avocado Toast', calories: 630, protein: '45g', carbs: '45g', fats: '28g', description: '3 eggs, 3 slices turkey bacon, spinach, 1 slice sourdough with avocado.' },
    { type: 'Morning Snack', name: 'Cottage Cheese with Berries & Pumpkin Seeds', calories: 340, protein: '30g', carbs: '28g', fats: '10g', description: '220g cottage cheese, blackberries, roasted pumpkin seeds.' },
    { type: 'Lunch', name: 'Herb Grilled Chicken with Basmati Rice & Asparagus', calories: 760, protein: '55g', carbs: '78g', fats: '22g', description: '220g chicken breast, aromatic basmati rice, roasted asparagus.' },
    { type: 'Afternoon Snack', name: 'Turkey Jerky & Apple with Peanut Butter', calories: 380, protein: '28g', carbs: '35g', fats: '12g', description: '50g turkey jerky, 1 apple, 1 tbsp peanut butter.' },
    { type: 'Dinner', name: 'Grass-Fed Beef Patty with Roasted Sweet Potato & Salad', calories: 680, protein: '48g', carbs: '56g', fats: '26g', description: '200g beef patty, baked sweet potato wedges, leafy green salad.' },
  ]),
  // Days 29 to 30 (Week 5 - Final Days)
  createDay(29, '30-Day Culmination Power', 2880, '190g', [
    { type: 'Breakfast', name: 'Power Oatmeal with Whey, Banana, Honey & Walnuts', calories: 680, protein: '45g', carbs: '84g', fats: '18g', description: 'Steel cut oats, 1 scoop whey, 1 sliced banana, 1 tbsp honey, crushed walnuts.' },
    { type: 'Morning Snack', name: 'Greek Yogurt with Sliced Strawberries & Granola', calories: 350, protein: '26g', carbs: '38g', fats: '10g', description: '200g Greek yogurt, fresh strawberries, 30g crunchy granola.' },
    { type: 'Lunch', name: 'Grilled Steak & Rice Bowl with Sautéed Peppers', calories: 790, protein: '56g', carbs: '80g', fats: '25g', description: '200g flank steak strips, white jasmine rice, sautéed sweet peppers.' },
    { type: 'Afternoon Snack', name: 'Protein Shake & Banana with Peanut Butter', calories: 420, protein: '32g', carbs: '46g', fats: '12g', description: 'Whey protein isolate shake + 1 banana spread with 1 tbsp peanut butter.' },
    { type: 'Dinner', name: 'Baked Salmon with Quinoa & Garlic Green Beans', calories: 640, protein: '46g', carbs: '54g', fats: '24g', description: '200g wild salmon fillet, 1 cup cooked quinoa, steamed green beans.' },
  ]),
  createDay(30, 'Champion Mass Victory', 2900, '192g', [
    { type: 'Breakfast', name: 'Loaded Champion Omelet with Sourdough & Avocado', calories: 680, protein: '48g', carbs: '50g', fats: '28g', description: '4 eggs (2 whole + 2 whites), lean turkey ham, cheddar, 2 slices toasted sourdough, avocado.' },
    { type: 'Morning Snack', name: 'Skyr Yogurt with Blueberries & Chia Seeds', calories: 350, protein: '28g', carbs: '36g', fats: '8g', description: '200g Icelandic skyr, 1/2 cup fresh blueberries, 1 tbsp chia seeds.' },
    { type: 'Lunch', name: 'BBQ Chicken Feast with Sweet Potato Mash & Broccoli', calories: 800, protein: '58g', carbs: '84g', fats: '22g', description: '240g chicken breast in smokey BBQ sauce, sweet potato mash, steamed broccoli.' },
    { type: 'Afternoon Snack', name: 'High-Protein Bar & Fresh Apple', calories: 370, protein: '26g', carbs: '42g', fats: '10g', description: 'Clean whey protein bar + 1 crisp honeycrisp apple.' },
    { type: 'Dinner', name: 'Prime Sirloin Steak with Roasted Potatoes & Asparagus', calories: 700, protein: '52g', carbs: '56g', fats: '26g', description: '210g prime sirloin steak, rosemary roasted baby potatoes, grilled asparagus.' },
  ]),
];

// -------------------------------------------------------------
// 2. LOSE WEIGHT (High Satiety Deficit ~1700 kcal)
// -------------------------------------------------------------
const FAT_LOSS_DAYS: DietDay[] = [
  createDay(1, 'Deficit Kickoff', 1680, '148g', [
    { type: 'Breakfast', name: 'Egg White Omelet with Spinach, Tomato & 1 Slice Rye', calories: 360, protein: '34g', carbs: '28g', fats: '8g', description: '4 egg whites + 1 whole egg, baby spinach, diced tomato, 1 slice toasted rye.' },
    { type: 'Lunch', name: 'Grilled Chicken Breast Salad with Light Vinaigrette', calories: 480, protein: '46g', carbs: '24g', fats: '18g', description: '200g chicken breast, mixed baby greens, cucumbers, cherry tomatoes, 1 tbsp olive oil & balsamic.' },
    { type: 'Afternoon Snack', name: 'Non-Fat Greek Yogurt with Raspberries & Stevia', calories: 180, protein: '22g', carbs: '18g', fats: '2g', description: '180g 0% Greek yogurt, 1/2 cup fresh raspberries, natural stevia sweetening.' },
    { type: 'Dinner', name: 'Baked White Cod with Steamed Broccoli & Cauliflower Rice', calories: 460, protein: '46g', carbs: '32g', fats: '12g', description: '220g Atlantic cod fillet, seasoned riced cauliflower, steamed broccoli florets.' },
  ]),
  createDay(2, 'High Satiety Salmon', 1710, '145g', [
    { type: 'Breakfast', name: 'Protein Oatmeal with Cinnamon & Blueberries', calories: 380, protein: '32g', carbs: '44g', fats: '6g', description: '40g rolled oats cooked in water, 1 scoop vanilla whey, cinnamon, 50g fresh blueberries.' },
    { type: 'Lunch', name: 'Tuna Salad Lettuce Boats with Cucumber & Mustard', calories: 420, protein: '44g', carbs: '16g', fats: '14g', description: '1.5 cans solid white tuna, light mayo, mustard, celery inside crisp romaine leaves.' },
    { type: 'Afternoon Snack', name: 'Hard Boiled Egg & Baby Carrots with Hummus', calories: 200, protein: '12g', carbs: '16g', fats: '10g', description: '1 hard-boiled egg, 100g baby carrots, 2 tbsp light hummus.' },
    { type: 'Dinner', name: 'Baked Salmon with Roasted Zucchini & Green Salad', calories: 510, protein: '45g', carbs: '22g', fats: '24g', description: '180g wild salmon fillet, grilled zucchini ribbons, lemon arugula salad.' },
  ]),
  createDay(3, 'Lean Turkey Fuel', 1690, '150g', [
    { type: 'Breakfast', name: 'Cottage Cheese Bowl with Sliced Strawberries & Chia', calories: 340, protein: '32g', carbs: '26g', fats: '8g', description: '220g fat-free cottage cheese, sliced strawberries, 1 tsp chia seeds.' },
    { type: 'Lunch', name: 'Turkey Breast Stir-Fry with Snap Peas & Bell Peppers', calories: 490, protein: '48g', carbs: '34g', fats: '14g', description: '200g lean sliced turkey breast, snap peas, red bell peppers, soy-ginger glaze.' },
    { type: 'Afternoon Snack', name: 'Whey Isolate Shake with Unsweetened Almond Milk', calories: 170, protein: '28g', carbs: '4g', fats: '3g', description: '30g whey isolate mixed with 250ml unsweetened vanilla almond milk.' },
    { type: 'Dinner', name: 'Grilled Sirloin Steak with Roasted Asparagus & Mushrooms', calories: 490, protein: '42g', carbs: '20g', fats: '22g', description: '160g lean sirloin steak, grilled asparagus spears, garlic sautéed button mushrooms.' },
  ]),
  createDay(4, 'Volume Eating Focus', 1660, '146g', [
    { type: 'Breakfast', name: 'Avocado & Poached Egg on Light Toast', calories: 340, protein: '22g', carbs: '26g', fats: '16g', description: '1 whole egg + 2 egg whites poached, 1/4 sliced avocado, 1 slice multigrain toast.' },
    { type: 'Lunch', name: 'Lemon Herb Chicken with Cauliflower Mash & Green Beans', calories: 470, protein: '48g', carbs: '28g', fats: '14g', description: '200g chicken breast, homemade garlic cauliflower mash, steamed green beans.' },
    { type: 'Afternoon Snack', name: '0% Skyr with Blackberries', calories: 180, protein: '24g', carbs: '16g', fats: '1g', description: '180g plain skyr, 1/2 cup fresh wild blackberries.' },
    { type: 'Dinner', name: 'Shrimp Zucchini Noodle Bowl with Pesto & Cherry Tomatoes', calories: 470, protein: '44g', carbs: '22g', fats: '18g', description: '220g jumbo shrimp, fresh spiralized zucchini noodles, 1 tbsp basil pesto, tomatoes.' },
  ]),
  createDay(5, 'Thermogenic Friday', 1700, '152g', [
    { type: 'Breakfast', name: 'Scrambled Eggs with Smoked Salmon & Arugula', calories: 380, protein: '36g', carbs: '8g', fats: '20g', description: '2 whole eggs + 2 whites, 70g wild smoked salmon, fresh peppery arugula.' },
    { type: 'Lunch', name: 'Bison or Extra Lean Beef Burger (No Bun) with Side Salad', calories: 490, protein: '48g', carbs: '18g', fats: '22g', description: '180g 95% lean beef patty, lettuce wrap, tomato, pickles, large mixed green salad.' },
    { type: 'Afternoon Snack', name: 'Celery Sticks with 1 Tbsp Natural Peanut Butter', calories: 160, protein: '8g', carbs: '10g', fats: '12g', description: 'Fresh crisp celery sticks with 1 tbsp peanut butter.' },
    { type: 'Dinner', name: 'Herb Roasted Chicken Breast with Steamed Broccoli & Sweet Potato', calories: 470, protein: '48g', carbs: '38g', fats: '10g', description: '200g chicken breast, 100g roasted sweet potato cubes, steamed broccoli.' },
  ]),
  createDay(6, 'Weekend Caloric Control', 1670, '144g', [
    { type: 'Breakfast', name: 'Protein French Toast (Egg Whites & Cinnamon on Whole Grain)', calories: 370, protein: '34g', carbs: '42g', fats: '6g', description: '2 slices whole grain bread dipped in 4 egg whites & cinnamon, stevia syrup.' },
    { type: 'Lunch', name: 'Mediterranean Tuna & Chickpea Bowl (Light Portion)', calories: 480, protein: '44g', carbs: '38g', fats: '14g', description: '1.5 cans tuna, 80g chickpeas, cucumber, cherry tomatoes, lemon juice.' },
    { type: 'Afternoon Snack', name: 'Low-Fat Cottage Cheese with Blueberries', calories: 180, protein: '24g', carbs: '16g', fats: '2g', description: '180g low-fat cottage cheese, fresh blueberries.' },
    { type: 'Dinner', name: 'Baked White Halibut or Cod with Roasted Ratatouille', calories: 440, protein: '42g', carbs: '26g', fats: '14g', description: '200g white fish fillet, roasted eggplant, zucchini, bell peppers, tomatoes.' },
  ]),
  createDay(7, 'Rest & Fat-Burning Reset', 1650, '148g', [
    { type: 'Breakfast', name: 'Green Smoothie with Whey, Spinach & Green Apple', calories: 340, protein: '30g', carbs: '36g', fats: '4g', description: '1 scoop vanilla whey, 2 cups baby spinach, 1/2 green apple, cucumber, water.' },
    { type: 'Lunch', name: 'Grilled Chicken Strips with Quinoa & Sautéed Kale', calories: 480, protein: '48g', carbs: '36g', fats: '12g', description: '200g grilled chicken, 1/2 cup cooked quinoa, garlic sautéed kale.' },
    { type: 'Afternoon Snack', name: 'Hard-Boiled Egg & Cucumber Slices with Sea Salt', calories: 150, protein: '10g', carbs: '6g', fats: '9g', description: '1 boiled egg, sliced cucumber sprinkled with pink Himalayan salt.' },
    { type: 'Dinner', name: 'Turkey Bolognese over Spaghetti Squash', calories: 480, protein: '50g', carbs: '30g', fats: '14g', description: '200g extra-lean ground turkey, rich tomato marinara over roasted spaghetti squash strands.' },
  ]),
  // Days 8 to 14 (Week 2)
  createDay(8, 'Week 2 Lean Momentum', 1690, '150g', [
    { type: 'Breakfast', name: 'Egg White Scramble with Turkey Bacon & 1 Slice Toast', calories: 370, protein: '36g', carbs: '28g', fats: '10g', description: '4 egg whites + 1 whole egg, 2 strips turkey bacon, 1 slice whole wheat toast.' },
    { type: 'Lunch', name: 'Grilled Chicken & Black Bean Salad Bowl', calories: 490, protein: '48g', carbs: '34g', fats: '14g', description: '200g chicken breast, 80g black beans, romaine lettuce, fresh tomato salsa.' },
    { type: 'Afternoon Snack', name: '0% Greek Yogurt with Strawberries', calories: 180, protein: '22g', carbs: '18g', fats: '1g', description: '180g non-fat Greek yogurt with sliced fresh strawberries.' },
    { type: 'Dinner', name: 'Baked Cod with Roasted Asparagus & Cauliflower Rice', calories: 450, protein: '44g', carbs: '26g', fats: '12g', description: '220g cod fillet, roasted asparagus spears, cauliflower rice.' },
  ]),
  createDay(9, 'Metabolic Boost Day', 1680, '148g', [
    { type: 'Breakfast', name: 'Protein Oatmeal with Sliced Strawberries & Whey', calories: 370, protein: '32g', carbs: '42g', fats: '6g', description: '40g rolled oats, 1 scoop vanilla whey, water, fresh strawberries.' },
    { type: 'Lunch', name: 'Tuna Salad in Lettuce Cups with Tomatoes', calories: 430, protein: '44g', carbs: '16g', fats: '16g', description: '1.5 cans tuna, light mayo, diced celery, halved cherry tomatoes, bibb lettuce.' },
    { type: 'Afternoon Snack', name: 'Hard Boiled Eggs (1 Whole + 1 White)', calories: 160, protein: '14g', carbs: '2g', fats: '9g', description: '1 whole hard-boiled egg + 1 extra egg white, pinch of sea salt.' },
    { type: 'Dinner', name: 'Grilled Lean Flank Steak with Steamed Broccoli & Zucchini', calories: 520, protein: '48g', carbs: '22g', fats: '22g', description: '180g flank steak, steamed broccoli florets, grilled zucchini.' },
  ]),
  createDay(10, 'Fat-Loss Precision', 1670, '146g', [
    { type: 'Breakfast', name: 'Cottage Cheese with Raspberries & Flaxseeds', calories: 340, protein: '32g', carbs: '24g', fats: '8g', description: '220g fat-free cottage cheese, raspberries, 1 tsp ground flaxseeds.' },
    { type: 'Lunch', name: 'Lemon Herb Turkey Cutlet with Roasted Cauliflower', calories: 470, protein: '46g', carbs: '28g', fats: '14g', description: '200g turkey breast cutlet, turmeric roasted cauliflower florets.' },
    { type: 'Afternoon Snack', name: 'Whey Protein Shake with Cold Brew Coffee', calories: 160, protein: '28g', carbs: '4g', fats: '2g', description: '1 scoop vanilla whey blended with cold brew coffee & ice.' },
    { type: 'Dinner', name: 'Baked Salmon with Green Salad & Lemon Vinaigrette', calories: 500, protein: '44g', carbs: '18g', fats: '26g', description: '180g salmon fillet, mixed baby greens, lemon vinaigrette.' },
  ]),
  createDay(11, 'Hydration & Satiety', 1660, '148g', [
    { type: 'Breakfast', name: 'Spinach & Mushroom Omelet with 1 Slice Rye', calories: 360, protein: '32g', carbs: '26g', fats: '10g', description: '3 egg whites + 1 whole egg, sliced mushrooms, baby spinach, 1 slice rye.' },
    { type: 'Lunch', name: 'Shrimp Stir-Fry with Broccoli & Snap Peas', calories: 460, protein: '44g', carbs: '32g', fats: '12g', description: '220g shrimp, broccoli, snap peas, light soy-ginger sauce.' },
    { type: 'Afternoon Snack', name: '0% Skyr with Blueberries', calories: 180, protein: '24g', carbs: '16g', fats: '1g', description: '180g plain Icelandic skyr, 1/2 cup fresh blueberries.' },
    { type: 'Dinner', name: 'Grilled Chicken Breast with Roasted Brussels Sprouts', calories: 460, protein: '48g', carbs: '26g', fats: '12g', description: '200g chicken breast, seasoned roasted Brussels sprouts.' },
  ]),
  createDay(12, 'High Deficit Clean Energy', 1700, '150g', [
    { type: 'Breakfast', name: 'Protein Waffles (Oat & Egg White) with Berries', calories: 370, protein: '34g', carbs: '40g', fats: '6g', description: 'Homemade oat & egg white waffle, topped with fresh mixed berries.' },
    { type: 'Lunch', name: 'Extra Lean Ground Beef Bowl with Zucchini & Tomato', calories: 490, protein: '46g', carbs: '26g', fats: '18g', description: '180g 95% ground beef, sautéed zucchini, diced tomatoes.' },
    { type: 'Afternoon Snack', name: 'Baby Carrots & Cucumber with Greek Yogurt Dip', calories: 160, protein: '14g', carbs: '18g', fats: '2g', description: 'Fresh vegetables with herb seasoned non-fat Greek yogurt dip.' },
    { type: 'Dinner', name: 'Baked Cod with Sautéed Spinach & Cherry Tomatoes', calories: 480, protein: '46g', carbs: '22g', fats: '16g', description: '220g cod fillet, garlic wilted spinach, blistered cherry tomatoes.' },
  ]),
  createDay(13, 'Weekend Lean Nutrition', 1680, '144g', [
    { type: 'Breakfast', name: 'Poached Eggs on Spinach Bed with 1 Slice Toast', calories: 350, protein: '26g', carbs: '26g', fats: '14g', description: '2 poached eggs over steamed baby spinach, 1 slice whole wheat toast.' },
    { type: 'Lunch', name: 'Grilled Chicken Salad with Cucumber & Light Feta', calories: 480, protein: '48g', carbs: '22g', fats: '18g', description: '200g chicken breast, mixed greens, cucumber, 20g light feta, balsamic.' },
    { type: 'Afternoon Snack', name: 'Low-Fat Cottage Cheese with Cinnamon & Apple Slices', calories: 190, protein: '22g', carbs: '20g', fats: '2g', description: '180g cottage cheese, 1/2 sliced apple, dusted with cinnamon.' },
    { type: 'Dinner', name: 'Grilled Tuna Steak with Asparagus & Green Salad', calories: 460, protein: '48g', carbs: '18g', fats: '16g', description: '190g tuna steak, grilled asparagus, lemon herb side salad.' },
  ]),
  createDay(14, 'Week 2 Review & Re-center', 1660, '146g', [
    { type: 'Breakfast', name: 'Green Protein Smoothie (Whey, Kale, Banana)', calories: 340, protein: '30g', carbs: '38g', fats: '4g', description: '1 scoop vanilla whey, 1 cup kale, 1/2 banana, ice water.' },
    { type: 'Lunch', name: 'Turkey & Avocado Wrap on Low-Carb Tortilla', calories: 480, protein: '44g', carbs: '28g', fats: '16g', description: '150g sliced turkey breast, 1/4 avocado, spinach, low-carb wrap.' },
    { type: 'Afternoon Snack', name: 'Hard-Boiled Egg & Handful of Cherry Tomatoes', calories: 150, protein: '10g', carbs: '8g', fats: '8g', description: '1 egg, 100g sweet cherry tomatoes.' },
    { type: 'Dinner', name: 'Baked Salmon with Steamed Broccoli & Lemon Zest', calories: 490, protein: '44g', carbs: '18g', fats: '24g', description: '180g salmon fillet, steamed broccoli with lemon zest & sea salt.' },
  ]),
  // Days 15 to 21 (Week 3)
  createDay(15, 'Week 3 Peak Fat-Burn', 1690, '150g', [
    { type: 'Breakfast', name: 'Egg White Omelet with Spinach, Mushrooms & Rye Toast', calories: 360, protein: '34g', carbs: '28g', fats: '8g', description: '4 egg whites + 1 whole egg, spinach, mushrooms, 1 slice toasted rye.' },
    { type: 'Lunch', name: 'Grilled Chicken Salad with Light Vinaigrette', calories: 480, protein: '46g', carbs: '24g', fats: '18g', description: '200g chicken breast, mixed greens, cucumber, tomatoes, light balsamic.' },
    { type: 'Afternoon Snack', name: '0% Greek Yogurt with Raspberries', calories: 180, protein: '22g', carbs: '18g', fats: '2g', description: '180g Greek yogurt, 1/2 cup fresh raspberries.' },
    { type: 'Dinner', name: 'Baked White Cod with Cauliflower Rice & Broccoli', calories: 470, protein: '48g', carbs: '30g', fats: '12g', description: '220g Atlantic cod, seasoned cauliflower rice, steamed broccoli.' },
  ]),
  createDay(16, 'Fiber & Protein Synergy', 1670, '146g', [
    { type: 'Breakfast', name: 'Protein Oatmeal with Cinnamon & Blueberries', calories: 380, protein: '32g', carbs: '44g', fats: '6g', description: '40g rolled oats, 1 scoop vanilla whey, blueberries, cinnamon.' },
    { type: 'Lunch', name: 'Tuna Salad in Lettuce Wraps with Mustard', calories: 420, protein: '44g', carbs: '16g', fats: '14g', description: '1.5 cans tuna, light mayo, celery, romaine wraps.' },
    { type: 'Afternoon Snack', name: 'Hard Boiled Egg & Baby Carrots with Hummus', calories: 200, protein: '12g', carbs: '16g', fats: '10g', description: '1 hard-boiled egg, baby carrots, 2 tbsp hummus.' },
    { type: 'Dinner', name: 'Baked Salmon with Grilled Zucchini & Salad', calories: 470, protein: '44g', carbs: '20g', fats: '22g', description: '180g wild salmon fillet, grilled zucchini ribbons, green salad.' },
  ]),
  createDay(17, 'Clean Protein Deficit', 1690, '148g', [
    { type: 'Breakfast', name: 'Cottage Cheese Bowl with Strawberries & Chia Seeds', calories: 340, protein: '32g', carbs: '26g', fats: '8g', description: '220g fat-free cottage cheese, strawberries, chia seeds.' },
    { type: 'Lunch', name: 'Turkey Breast Stir-Fry with Snap Peas & Peppers', calories: 490, protein: '48g', carbs: '34g', fats: '14g', description: '200g turkey breast, snap peas, bell peppers, soy glaze.' },
    { type: 'Afternoon Snack', name: 'Whey Isolate with Unsweetened Almond Milk', calories: 170, protein: '28g', carbs: '4g', fats: '3g', description: '30g whey isolate in 250ml almond milk.' },
    { type: 'Dinner', name: 'Grilled Sirloin Steak with Roasted Asparagus & Mushrooms', calories: 490, protein: '42g', carbs: '20g', fats: '22g', description: '160g sirloin steak, roasted asparagus, sautéed mushrooms.' },
  ]),
  createDay(18, 'Lean Performance Fuel', 1660, '145g', [
    { type: 'Breakfast', name: 'Avocado & Poached Egg on Light Whole Wheat Toast', calories: 340, protein: '22g', carbs: '26g', fats: '16g', description: '1 whole egg + 2 egg whites, 1/4 avocado, 1 slice toast.' },
    { type: 'Lunch', name: 'Lemon Herb Chicken with Cauliflower Mash & Green Beans', calories: 470, protein: '48g', carbs: '28g', fats: '14g', description: '200g chicken breast, cauliflower mash, green beans.' },
    { type: 'Afternoon Snack', name: '0% Skyr with Blackberries', calories: 180, protein: '24g', carbs: '16g', fats: '1g', description: '180g plain skyr, 1/2 cup fresh blackberries.' },
    { type: 'Dinner', name: 'Shrimp & Zucchini Noodles with Pesto & Tomatoes', calories: 470, protein: '44g', carbs: '22g', fats: '18g', description: '220g shrimp, spiralized zucchini, 1 tbsp basil pesto, tomatoes.' },
  ]),
  createDay(19, 'Metabolism Ignition', 1700, '152g', [
    { type: 'Breakfast', name: 'Scrambled Eggs with Smoked Salmon & Arugula', calories: 380, protein: '36g', carbs: '8g', fats: '20g', description: '2 eggs + 2 whites, 70g smoked salmon, fresh arugula.' },
    { type: 'Lunch', name: 'Lean Beef Burger (No Bun) with Green Salad', calories: 490, protein: '48g', carbs: '18g', fats: '22g', description: '180g lean beef patty, lettuce wrap, mixed green salad.' },
    { type: 'Afternoon Snack', name: 'Celery Sticks with 1 Tbsp Natural Peanut Butter', calories: 160, protein: '8g', carbs: '10g', fats: '12g', description: 'Celery sticks with natural peanut butter.' },
    { type: 'Dinner', name: 'Herb Roasted Chicken Breast with Broccoli & Sweet Potato', calories: 470, protein: '48g', carbs: '38g', fats: '10g', description: '200g chicken breast, 100g sweet potato cubes, steamed broccoli.' },
  ]),
  createDay(20, 'Weekend Caloric Mastery', 1670, '144g', [
    { type: 'Breakfast', name: 'Protein French Toast (Egg Whites on Whole Grain)', calories: 370, protein: '34g', carbs: '42g', fats: '6g', description: '2 slices whole grain, egg whites, cinnamon, stevia syrup.' },
    { type: 'Lunch', name: 'Mediterranean Tuna & Chickpea Bowl (Light)', calories: 480, protein: '44g', carbs: '38g', fats: '14g', description: '1.5 cans tuna, 80g chickpeas, cucumber, tomatoes, lemon.' },
    { type: 'Afternoon Snack', name: 'Low-Fat Cottage Cheese with Blueberries', calories: 180, protein: '24g', carbs: '16g', fats: '2g', description: '180g cottage cheese, fresh blueberries.' },
    { type: 'Dinner', name: 'Baked Cod with Roasted Ratatouille', calories: 440, protein: '42g', carbs: '26g', fats: '14g', description: '200g cod fillet, roasted eggplant, zucchini, peppers, tomatoes.' },
  ]),
  createDay(21, 'Week 3 Reset & Recharge', 1650, '148g', [
    { type: 'Breakfast', name: 'Green Smoothie with Whey, Spinach & Apple', calories: 340, protein: '30g', carbs: '36g', fats: '4g', description: '1 scoop whey, 2 cups spinach, 1/2 apple, cucumber, water.' },
    { type: 'Lunch', name: 'Grilled Chicken Strips with Quinoa & Kale', calories: 480, protein: '48g', carbs: '36g', fats: '12g', description: '200g grilled chicken, 1/2 cup quinoa, sautéed kale.' },
    { type: 'Afternoon Snack', name: 'Hard-Boiled Egg & Cucumber Slices', calories: 150, protein: '10g', carbs: '6g', fats: '9g', description: '1 boiled egg, sliced cucumber with sea salt.' },
    { type: 'Dinner', name: 'Turkey Bolognese over Roasted Spaghetti Squash', calories: 480, protein: '50g', carbs: '30g', fats: '14g', description: '200g ground turkey, marinara over roasted spaghetti squash.' },
  ]),
  // Days 22 to 28 (Week 4)
  createDay(22, 'Week 4 Lean Shred', 1690, '150g', [
    { type: 'Breakfast', name: 'Egg White Scramble with Turkey Bacon & Rye Toast', calories: 370, protein: '36g', carbs: '28g', fats: '10g', description: '4 egg whites + 1 whole egg, 2 strips turkey bacon, 1 slice rye toast.' },
    { type: 'Lunch', name: 'Grilled Chicken & Black Bean Salad Bowl', calories: 490, protein: '48g', carbs: '34g', fats: '14g', description: '200g chicken breast, black beans, romaine, fresh salsa.' },
    { type: 'Afternoon Snack', name: '0% Greek Yogurt with Strawberries', calories: 180, protein: '22g', carbs: '18g', fats: '1g', description: '180g Greek yogurt, sliced strawberries.' },
    { type: 'Dinner', name: 'Baked Cod with Roasted Asparagus & Cauliflower Rice', calories: 450, protein: '44g', carbs: '26g', fats: '12g', description: '220g cod fillet, roasted asparagus, cauliflower rice.' },
  ]),
  createDay(23, 'Maximum Satiety Drive', 1680, '148g', [
    { type: 'Breakfast', name: 'Protein Oatmeal with Sliced Strawberries & Whey', calories: 370, protein: '32g', carbs: '42g', fats: '6g', description: '40g rolled oats, 1 scoop whey, strawberries.' },
    { type: 'Lunch', name: 'Tuna Salad in Lettuce Cups with Tomatoes', calories: 430, protein: '44g', carbs: '16g', fats: '16g', description: '1.5 cans tuna, light mayo, celery, cherry tomatoes, lettuce.' },
    { type: 'Afternoon Snack', name: 'Hard Boiled Eggs (1 Whole + 1 White)', calories: 160, protein: '14g', carbs: '2g', fats: '9g', description: '1 whole egg + 1 white with sea salt.' },
    { type: 'Dinner', name: 'Grilled Flank Steak with Steamed Broccoli & Zucchini', calories: 520, protein: '48g', carbs: '22g', fats: '22g', description: '180g flank steak, steamed broccoli, grilled zucchini.' },
  ]),
  createDay(24, 'Clean Shred Consistency', 1670, '146g', [
    { type: 'Breakfast', name: 'Cottage Cheese with Raspberries & Flaxseeds', calories: 340, protein: '32g', carbs: '24g', fats: '8g', description: '220g cottage cheese, raspberries, flaxseeds.' },
    { type: 'Lunch', name: 'Lemon Herb Turkey Cutlet with Roasted Cauliflower', calories: 470, protein: '46g', carbs: '28g', fats: '14g', description: '200g turkey cutlet, roasted cauliflower florets.' },
    { type: 'Afternoon Snack', name: 'Whey Protein Shake with Cold Brew Coffee', calories: 160, protein: '28g', carbs: '4g', fats: '2g', description: 'Whey protein with cold brew coffee.' },
    { type: 'Dinner', name: 'Baked Salmon with Green Salad & Lemon Dressing', calories: 500, protein: '44g', carbs: '18g', fats: '26g', description: '180g salmon fillet, mixed greens, lemon vinaigrette.' },
  ]),
  createDay(25, 'High Energy Deficit', 1660, '148g', [
    { type: 'Breakfast', name: 'Spinach & Mushroom Omelet with 1 Slice Rye', calories: 360, protein: '32g', carbs: '26g', fats: '10g', description: '3 egg whites + 1 egg, mushrooms, spinach, 1 slice rye.' },
    { type: 'Lunch', name: 'Shrimp Stir-Fry with Broccoli & Snap Peas', calories: 460, protein: '44g', carbs: '32g', fats: '12g', description: '220g shrimp, broccoli, snap peas, soy sauce.' },
    { type: 'Afternoon Snack', name: '0% Skyr with Blueberries', calories: 180, protein: '24g', carbs: '16g', fats: '1g', description: '180g skyr, fresh blueberries.' },
    { type: 'Dinner', name: 'Grilled Chicken Breast with Roasted Brussels Sprouts', calories: 460, protein: '48g', carbs: '26g', fats: '12g', description: '200g chicken breast, roasted Brussels sprouts.' },
  ]),
  createDay(26, 'Clean Fuel Mastery', 1700, '150g', [
    { type: 'Breakfast', name: 'Protein Waffles with Fresh Mixed Berries', calories: 370, protein: '34g', carbs: '40g', fats: '6g', description: 'Oat & egg white waffle, mixed berries.' },
    { type: 'Lunch', name: 'Lean Ground Beef Bowl with Zucchini & Tomato', calories: 490, protein: '46g', carbs: '26g', fats: '18g', description: '180g 95% lean beef, zucchini, diced tomatoes.' },
    { type: 'Afternoon Snack', name: 'Baby Carrots & Cucumber with Greek Yogurt Dip', calories: 160, protein: '14g', carbs: '18g', fats: '2g', description: 'Fresh vegetables with Greek yogurt dip.' },
    { type: 'Dinner', name: 'Baked Cod with Sautéed Spinach & Cherry Tomatoes', calories: 480, protein: '46g', carbs: '22g', fats: '16g', description: '220g cod, garlic spinach, blistered tomatoes.' },
  ]),
  createDay(27, 'Weekend Deficit Power', 1680, '144g', [
    { type: 'Breakfast', name: 'Poached Eggs on Spinach with 1 Slice Toast', calories: 350, protein: '26g', carbs: '26g', fats: '14g', description: '2 poached eggs, steamed spinach, 1 slice toast.' },
    { type: 'Lunch', name: 'Grilled Chicken Salad with Cucumber & Light Feta', calories: 480, protein: '48g', carbs: '22g', fats: '18g', description: '200g chicken breast, mixed greens, cucumber, light feta.' },
    { type: 'Afternoon Snack', name: 'Cottage Cheese with Cinnamon & Apple', calories: 190, protein: '22g', carbs: '20g', fats: '2g', description: '180g cottage cheese, sliced apple, cinnamon.' },
    { type: 'Dinner', name: 'Grilled Tuna Steak with Asparagus & Side Salad', calories: 460, protein: '48g', carbs: '18g', fats: '16g', description: '190g tuna steak, grilled asparagus, side salad.' },
  ]),
  createDay(28, 'Pre-Final Re-calibration', 1660, '146g', [
    { type: 'Breakfast', name: 'Green Protein Smoothie (Whey, Kale, Banana)', calories: 340, protein: '30g', carbs: '38g', fats: '4g', description: '1 scoop whey, kale, 1/2 banana, ice water.' },
    { type: 'Lunch', name: 'Turkey & Avocado Wrap on Low-Carb Tortilla', calories: 480, protein: '44g', carbs: '28g', fats: '16g', description: '150g turkey breast, 1/4 avocado, low-carb tortilla.' },
    { type: 'Afternoon Snack', name: 'Hard-Boiled Egg & Cherry Tomatoes', calories: 150, protein: '10g', carbs: '8g', fats: '8g', description: '1 egg, sweet cherry tomatoes.' },
    { type: 'Dinner', name: 'Baked Salmon with Steamed Broccoli & Lemon Zest', calories: 490, protein: '44g', carbs: '18g', fats: '24g', description: '180g salmon, steamed broccoli, lemon zest.' },
  ]),
  // Days 29 to 30 (Week 5 - Final Days)
  createDay(29, '30-Day Deficit Peak', 1680, '148g', [
    { type: 'Breakfast', name: 'Egg White & Turkey Bacon Scramble with 1 Slice Toast', calories: 360, protein: '35g', carbs: '28g', fats: '9g', description: '4 egg whites + 1 whole egg, 2 slices turkey bacon, 1 slice whole wheat toast.' },
    { type: 'Lunch', name: 'Grilled Chicken & Vegetable Skewers with Quinoa', calories: 480, protein: '46g', carbs: '32g', fats: '15g', description: '200g chicken breast skewers with bell peppers and onions, 1/2 cup quinoa.' },
    { type: 'Afternoon Snack', name: '0% Greek Yogurt with Blueberries', calories: 180, protein: '22g', carbs: '18g', fats: '1g', description: '180g Greek yogurt, fresh blueberries.' },
    { type: 'Dinner', name: 'Baked Salmon with Roasted Asparagus & Lemon Dressing', calories: 500, protein: '45g', carbs: '20g', fats: '24g', description: '180g salmon fillet, roasted asparagus spears, lemon vinaigrette.' },
  ]),
  createDay(30, 'Fat Loss Victory Day', 1700, '150g', [
    { type: 'Breakfast', name: 'Champion Scramble with Smoked Salmon & Sourdough', calories: 380, protein: '36g', carbs: '26g', fats: '14g', description: '3 egg whites + 1 whole egg, 70g smoked salmon, 1 slice toasted sourdough.' },
    { type: 'Lunch', name: 'Lean Beef & Roasted Veggie Bowl with Cauliflower Rice', calories: 490, protein: '48g', carbs: '26g', fats: '18g', description: '180g lean minced beef, roasted zucchini and bell peppers, cauliflower rice.' },
    { type: 'Afternoon Snack', name: 'Cottage Cheese with Strawberries & Cinnamon', calories: 180, protein: '24g', carbs: '18g', fats: '2g', description: '180g low-fat cottage cheese, fresh sliced strawberries, cinnamon.' },
    { type: 'Dinner', name: 'Baked Halibut or Cod with Garlic Green Beans & Baby Carrots', calories: 470, protein: '46g', carbs: '28g', fats: '14g', description: '220g white fish fillet, garlic steamed green beans, roasted baby carrots.' },
  ]),
];

// -------------------------------------------------------------
// 3. KEEP FIT (Balanced Nutrition & Vitality ~2200 kcal)
// -------------------------------------------------------------
const BALANCED_FITNESS_DAYS: DietDay[] = [
  createDay(1, 'Vitality Kickoff', 2220, '155g', [
    { type: 'Breakfast', name: 'Whole Grain Toast with 2 Poached Eggs, Avocado & Tomatoes', calories: 480, protein: '26g', carbs: '44g', fats: '22g', description: '2 slices whole grain sourdough, 2 poached eggs, 1/3 sliced avocado, cherry tomatoes.' },
    { type: 'Morning Snack', name: 'Greek Yogurt with Mixed Berries & Pumpkin Seeds', calories: 280, protein: '22g', carbs: '26g', fats: '10g', description: '180g Greek yogurt 2%, blueberries, raspberries, 1 tbsp roasted pumpkin seeds.' },
    { type: 'Lunch', name: 'Grilled Chicken Quinoa Bowl with Sautéed Veggies', calories: 620, protein: '48g', carbs: '58g', fats: '20g', description: '180g chicken breast, 1 cup cooked quinoa, zucchini, bell peppers, olive oil drizzle.' },
    { type: 'Afternoon Snack', name: 'Apple Slices with Natural Peanut Butter', calories: 240, protein: '8g', carbs: '28g', fats: '12g', description: '1 medium honeycrisp apple sliced with 1.5 tbsp creamy peanut butter.' },
    { type: 'Dinner', name: 'Baked Salmon with Sweet Potato & Steamed Asparagus', calories: 600, protein: '42g', carbs: '46g', fats: '24g', description: '180g wild salmon fillet, baked sweet potato, seasoned grilled asparagus.' },
  ]),
  createDay(2, 'Mediterranean Energy', 2190, '158g', [
    { type: 'Breakfast', name: 'Oatmeal with Whey Protein, Banana & Walnuts', calories: 510, protein: '34g', carbs: '64g', fats: '14g', description: 'Rolled oats cooked in almond milk, 1 scoop vanilla whey, 1/2 banana, 15g crushed walnuts.' },
    { type: 'Morning Snack', name: 'Hard Boiled Eggs & Whole Grain Crackers', calories: 260, protein: '16g', carbs: '20g', fats: '12g', description: '2 hard-boiled eggs with sea salt + whole wheat seed crackers.' },
    { type: 'Lunch', name: 'Mediterranean Tuna Pasta Salad with Olives & Feta', calories: 630, protein: '46g', carbs: '62g', fats: '20g', description: '1 can tuna in olive oil, whole wheat penne, kalamata olives, 30g feta, cherry tomatoes.' },
    { type: 'Afternoon Snack', name: 'Cottage Cheese with Pineapple Chunks', calories: 220, protein: '24g', carbs: '22g', fats: '4g', description: '200g low-fat cottage cheese with fresh sweet pineapple chunks.' },
    { type: 'Dinner', name: 'Lean Sirloin Steak with Roasted Baby Potatoes & Green Beans', calories: 570, protein: '44g', carbs: '44g', fats: '22g', description: '160g sirloin steak, roasted baby potatoes, garlic steamed green beans.' },
  ]),
  createDay(3, 'Plant & Poultry Balance', 2210, '154g', [
    { type: 'Breakfast', name: 'Spinach, Mushroom & Feta 3-Egg Omelet with Toast', calories: 470, protein: '32g', carbs: '32g', fats: '24g', description: '3 eggs, baby spinach, button mushrooms, 30g feta, 1 slice sourdough toast.' },
    { type: 'Morning Snack', name: 'Whey Protein Shake & Fresh Orange', calories: 230, protein: '28g', carbs: '22g', fats: '2g', description: '1 scoop vanilla whey isolate shaken in cold water + 1 sweet navel orange.' },
    { type: 'Lunch', name: 'Turkey Breast & Avocado Wrap with Side Salad', calories: 590, protein: '44g', carbs: '46g', fats: '22g', description: '150g sliced turkey breast, 1/3 avocado, spinach in whole wheat wrap, side salad.' },
    { type: 'Afternoon Snack', name: 'Handful of Mixed Almonds, Walnuts & Dried Cranberries', calories: 240, protein: '8g', carbs: '24g', fats: '14g', description: '30g trail mix blend of raw nuts and unsweetened dried cranberries.' },
    { type: 'Dinner', name: 'Pan-Seared Cod with Lemon Rice & Roasted Zucchini', calories: 580, protein: '44g', carbs: '50g', fats: '18g', description: '200g Atlantic cod fillet, lemon herb basmati rice, roasted zucchini rounds.' },
  ]),
  createDay(4, 'Antioxidant & Recovery', 2180, '156g', [
    { type: 'Breakfast', name: 'Protein Berry Smoothie Bowl with Granola & Chia', calories: 490, protein: '34g', carbs: '62g', fats: '12g', description: 'Thick blended smoothie (whey, mixed berries, banana) topped with 30g granola & chia.' },
    { type: 'Morning Snack', name: 'Rice Cakes with Peanut Butter & Sliced Banana', calories: 250, protein: '8g', carbs: '36g', fats: '10g', description: '2 brown rice cakes with 1 tbsp peanut butter and banana slices.' },
    { type: 'Lunch', name: 'Beef & Broccoli Stir-Fry with Brown Rice', calories: 640, protein: '48g', carbs: '60g', fats: '22g', description: '180g lean flank steak, fresh broccoli florets, brown rice, sesame-soy glaze.' },
    { type: 'Afternoon Snack', name: '0% Skyr with Strawberries & Honey', calories: 210, protein: '22g', carbs: '24g', fats: '2g', description: '180g Icelandic skyr, sliced strawberries, 1 tsp raw honey.' },
    { type: 'Dinner', name: 'Roast Chicken Breast with Sweet Potato Mash & Asparagus', calories: 590, protein: '46g', carbs: '48g', fats: '20g', description: '190g roasted chicken breast, mashed sweet potato, steamed asparagus.' },
  ]),
  createDay(5, 'Performance Balance', 2230, '160g', [
    { type: 'Breakfast', name: 'Scrambled Eggs with Smoked Salmon & Whole Wheat Bagel', calories: 510, protein: '38g', carbs: '46g', fats: '18g', description: '2 whole eggs + 1 white, 70g smoked salmon, 1/2 whole wheat bagel with light cream cheese.' },
    { type: 'Morning Snack', name: 'Cottage Cheese with Sliced Kiwi & Pumpkin Seeds', calories: 240, protein: '24g', carbs: '20g', fats: '6g', description: '180g cottage cheese, 1 sliced kiwi, 1 tsp pumpkin seeds.' },
    { type: 'Lunch', name: 'Chicken Fajita Bowl with Peppers, Brown Rice & Salsa', calories: 630, protein: '48g', carbs: '62g', fats: '18g', description: '180g chicken breast, sautéed bell peppers and onions, brown rice, fresh salsa.' },
    { type: 'Afternoon Snack', name: 'High Protein Bar', calories: 220, protein: '20g', carbs: '22g', fats: '7g', description: 'Nutritious whole food whey/nut protein bar.' },
    { type: 'Dinner', name: 'Grilled Sea Bass with Quinoa & Steamed Broccoli', calories: 560, protein: '42g', carbs: '44g', fats: '20g', description: '200g sea bass fillet, tricolor quinoa, steamed broccoli florets with olive oil.' },
  ]),
  createDay(6, 'Weekend Vitality', 2200, '152g', [
    { type: 'Breakfast', name: 'Protein Banana Pancakes with Pure Maple Syrup', calories: 490, protein: '32g', carbs: '68g', fats: '10g', description: 'Oat flour & whey protein pancakes, 1/2 sliced banana, 1 tbsp pure maple syrup.' },
    { type: 'Morning Snack', name: 'Hard Boiled Egg & Guacamole with Cucumber', calories: 230, protein: '10g', carbs: '12g', fats: '16g', description: '1 hard-boiled egg, 40g fresh guacamole, crisp cucumber slices.' },
    { type: 'Lunch', name: 'Lean Turkey Burger with Roasted Sweet Potato Wedges & Greens', calories: 620, protein: '46g', carbs: '58g', fats: '20g', description: '180g lean turkey patty, whole wheat bun (or lettuce wrap), roasted sweet potato wedges, greens.' },
    { type: 'Afternoon Snack', name: 'Greek Yogurt with Blackberries & Walnuts', calories: 230, protein: '20g', carbs: '18g', fats: '9g', description: '180g Greek yogurt, fresh blackberries, 10g crushed walnuts.' },
    { type: 'Dinner', name: 'Baked Salmon with Wild Rice & Garlic Green Beans', calories: 610, protein: '44g', carbs: '46g', fats: '24g', description: '180g wild salmon fillet, wild rice blend, garlic sautéed green beans.' },
  ]),
  createDay(7, 'Rest & Wholesome Nourish', 2170, '154g', [
    { type: 'Breakfast', name: 'Avocado Toast with 2 Eggs & Turkey Bacon', calories: 480, protein: '28g', carbs: '38g', fats: '22g', description: '2 slices multigrain bread, 1/3 avocado, 2 sunny-side eggs, 2 slices turkey bacon.' },
    { type: 'Morning Snack', name: 'Berry Protein Smoothie with Almond Milk', calories: 240, protein: '26g', carbs: '24g', fats: '4g', description: '1 scoop whey protein, mixed frozen berries, 250ml unsweetened almond milk.' },
    { type: 'Lunch', name: 'Grilled Chicken Caesar Salad with Whole Grain Croutons', calories: 610, protein: '48g', carbs: '38g', fats: '24g', description: '180g grilled chicken, crisp romaine, light caesar yogurt dressing, whole grain croutons.' },
    { type: 'Afternoon Snack', name: 'Cottage Cheese with Sliced Peaches', calories: 220, protein: '22g', carbs: '24g', fats: '3g', description: '180g low-fat cottage cheese, fresh sliced peach.' },
    { type: 'Dinner', name: 'Pork Tenderloin Medallions with Roasted Fingerlings & Carrots', calories: 600, protein: '46g', carbs: '46g', fats: '22g', description: '180g pork tenderloin, roasted fingerling potatoes, glazed baby carrots.' },
  ]),
  // Days 8 to 14 (Week 2)
  createDay(8, 'Week 2 Balanced Rhythm', 2210, '156g', [
    { type: 'Breakfast', name: 'Whole Grain Toast with 2 Poached Eggs, Avocado & Tomatoes', calories: 480, protein: '26g', carbs: '44g', fats: '22g', description: '2 slices sourdough, 2 eggs, avocado, cherry tomatoes.' },
    { type: 'Morning Snack', name: 'Greek Yogurt with Mixed Berries & Pumpkin Seeds', calories: 280, protein: '22g', carbs: '26g', fats: '10g', description: '180g Greek yogurt, berries, pumpkin seeds.' },
    { type: 'Lunch', name: 'Grilled Chicken Quinoa Bowl with Sautéed Veggies', calories: 620, protein: '48g', carbs: '58g', fats: '20g', description: '180g chicken, quinoa, zucchini, peppers.' },
    { type: 'Afternoon Snack', name: 'Apple Slices with Natural Peanut Butter', calories: 240, protein: '8g', carbs: '28g', fats: '12g', description: 'Sliced apple with peanut butter.' },
    { type: 'Dinner', name: 'Baked Salmon with Sweet Potato & Asparagus', calories: 600, protein: '42g', carbs: '46g', fats: '24g', description: '180g salmon, sweet potato, asparagus.' },
  ]),
  createDay(9, 'Nutrient Density Focus', 2190, '158g', [
    { type: 'Breakfast', name: 'Oatmeal with Whey Protein, Banana & Walnuts', calories: 510, protein: '34g', carbs: '64g', fats: '14g', description: 'Oats, whey, banana, walnuts.' },
    { type: 'Morning Snack', name: 'Hard Boiled Eggs & Whole Grain Crackers', calories: 260, protein: '16g', carbs: '20g', fats: '12g', description: '2 boiled eggs + whole wheat crackers.' },
    { type: 'Lunch', name: 'Mediterranean Tuna Pasta Salad with Olives & Feta', calories: 630, protein: '46g', carbs: '62g', fats: '20g', description: 'Tuna, penne, olives, feta, tomatoes.' },
    { type: 'Afternoon Snack', name: 'Cottage Cheese with Pineapple Chunks', calories: 220, protein: '24g', carbs: '22g', fats: '4g', description: 'Cottage cheese with pineapple.' },
    { type: 'Dinner', name: 'Lean Sirloin Steak with Roasted Potatoes & Green Beans', calories: 570, protein: '44g', carbs: '44g', fats: '22g', description: 'Sirloin steak, baby potatoes, green beans.' },
  ]),
  createDay(10, 'Balanced Macronutrient Harmony', 2210, '154g', [
    { type: 'Breakfast', name: 'Spinach, Mushroom & Feta 3-Egg Omelet with Toast', calories: 470, protein: '32g', carbs: '32g', fats: '24g', description: '3 eggs, spinach, mushrooms, feta, toast.' },
    { type: 'Morning Snack', name: 'Whey Protein Shake & Fresh Orange', calories: 230, protein: '28g', carbs: '22g', fats: '2g', description: 'Whey isolate + orange.' },
    { type: 'Lunch', name: 'Turkey Breast & Avocado Wrap with Side Salad', calories: 590, protein: '44g', carbs: '46g', fats: '22g', description: 'Turkey wrap, avocado, greens.' },
    { type: 'Afternoon Snack', name: 'Mixed Almonds, Walnuts & Dried Cranberries', calories: 240, protein: '8g', carbs: '24g', fats: '14g', description: 'Nuts and dried cranberries.' },
    { type: 'Dinner', name: 'Pan-Seared Cod with Lemon Rice & Roasted Zucchini', calories: 580, protein: '44g', carbs: '50g', fats: '18g', description: 'Cod, lemon rice, roasted zucchini.' },
  ]),
  createDay(11, 'Vital Energy Drive', 2180, '156g', [
    { type: 'Breakfast', name: 'Protein Berry Smoothie Bowl with Granola & Chia', calories: 490, protein: '34g', carbs: '62g', fats: '12g', description: 'Berry smoothie bowl with granola & chia.' },
    { type: 'Morning Snack', name: 'Rice Cakes with Peanut Butter & Sliced Banana', calories: 250, protein: '8g', carbs: '36g', fats: '10g', description: 'Rice cakes with peanut butter & banana.' },
    { type: 'Lunch', name: 'Beef & Broccoli Stir-Fry with Brown Rice', calories: 640, protein: '48g', carbs: '60g', fats: '22g', description: 'Flank steak, broccoli, brown rice.' },
    { type: 'Afternoon Snack', name: '0% Skyr with Strawberries & Honey', calories: 210, protein: '22g', carbs: '24g', fats: '2g', description: 'Skyr, strawberries, honey.' },
    { type: 'Dinner', name: 'Roast Chicken Breast with Sweet Potato Mash & Asparagus', calories: 590, protein: '46g', carbs: '48g', fats: '20g', description: 'Chicken breast, sweet potato mash, asparagus.' },
  ]),
  createDay(12, 'Active Fueling Day', 2230, '160g', [
    { type: 'Breakfast', name: 'Scrambled Eggs with Smoked Salmon & Bagel', calories: 510, protein: '38g', carbs: '46g', fats: '18g', description: 'Eggs, smoked salmon, bagel.' },
    { type: 'Morning Snack', name: 'Cottage Cheese with Sliced Kiwi & Pumpkin Seeds', calories: 240, protein: '24g', carbs: '20g', fats: '6g', description: 'Cottage cheese, kiwi, pumpkin seeds.' },
    { type: 'Lunch', name: 'Chicken Fajita Bowl with Peppers & Rice', calories: 630, protein: '48g', carbs: '62g', fats: '18g', description: 'Chicken, peppers, rice, salsa.' },
    { type: 'Afternoon Snack', name: 'High Protein Bar', calories: 220, protein: '20g', carbs: '22g', fats: '7g', description: 'Protein bar.' },
    { type: 'Dinner', name: 'Grilled Sea Bass with Quinoa & Steamed Broccoli', calories: 560, protein: '42g', carbs: '44g', fats: '20g', description: 'Sea bass, quinoa, broccoli.' },
  ]),
  createDay(13, 'Weekend Vital Flow', 2200, '152g', [
    { type: 'Breakfast', name: 'Protein Banana Pancakes with Pure Maple Syrup', calories: 490, protein: '32g', carbs: '68g', fats: '10g', description: 'Banana protein pancakes with maple syrup.' },
    { type: 'Morning Snack', name: 'Hard Boiled Egg & Guacamole with Cucumber', calories: 230, protein: '10g', carbs: '12g', fats: '16g', description: 'Egg, guacamole, cucumber.' },
    { type: 'Lunch', name: 'Lean Turkey Burger with Sweet Potato Wedges & Greens', calories: 620, protein: '46g', carbs: '58g', fats: '20g', description: 'Turkey burger, sweet potato wedges, greens.' },
    { type: 'Afternoon Snack', name: 'Greek Yogurt with Blackberries & Walnuts', calories: 230, protein: '20g', carbs: '18g', fats: '9g', description: 'Greek yogurt, blackberries, walnuts.' },
    { type: 'Dinner', name: 'Baked Salmon with Wild Rice & Garlic Green Beans', calories: 610, protein: '44g', carbs: '46g', fats: '24g', description: 'Salmon, wild rice, green beans.' },
  ]),
  createDay(14, 'Week 2 Balance Review', 2170, '154g', [
    { type: 'Breakfast', name: 'Avocado Toast with 2 Eggs & Turkey Bacon', calories: 480, protein: '28g', carbs: '38g', fats: '22g', description: 'Toast, avocado, 2 eggs, turkey bacon.' },
    { type: 'Morning Snack', name: 'Berry Protein Smoothie with Almond Milk', calories: 240, protein: '26g', carbs: '24g', fats: '4g', description: 'Protein smoothie with berries.' },
    { type: 'Lunch', name: 'Grilled Chicken Caesar Salad with Whole Grain Croutons', calories: 610, protein: '48g', carbs: '38g', fats: '24g', description: 'Chicken, romaine, light caesar, croutons.' },
    { type: 'Afternoon Snack', name: 'Cottage Cheese with Sliced Peaches', calories: 220, protein: '22g', carbs: '24g', fats: '3g', description: 'Cottage cheese with peaches.' },
    { type: 'Dinner', name: 'Pork Tenderloin Medallions with Fingerling Potatoes', calories: 600, protein: '46g', carbs: '46g', fats: '22g', description: 'Pork tenderloin, fingerling potatoes, carrots.' },
  ]),
  // Days 15 to 21 (Week 3)
  createDay(15, 'Week 3 Dynamic Fitness', 2220, '155g', [
    { type: 'Breakfast', name: 'Whole Grain Toast with 2 Poached Eggs, Avocado & Tomatoes', calories: 480, protein: '26g', carbs: '44g', fats: '22g', description: 'Whole grain toast, 2 eggs, avocado, tomatoes.' },
    { type: 'Morning Snack', name: 'Greek Yogurt with Mixed Berries & Pumpkin Seeds', calories: 280, protein: '22g', carbs: '26g', fats: '10g', description: 'Greek yogurt, berries, pumpkin seeds.' },
    { type: 'Lunch', name: 'Grilled Chicken Quinoa Bowl with Sautéed Veggies', calories: 620, protein: '48g', carbs: '58g', fats: '20g', description: 'Chicken breast, quinoa, zucchini, peppers.' },
    { type: 'Afternoon Snack', name: 'Apple Slices with Natural Peanut Butter', calories: 240, protein: '8g', carbs: '28g', fats: '12g', description: 'Apple with peanut butter.' },
    { type: 'Dinner', name: 'Baked Salmon with Sweet Potato & Asparagus', calories: 600, protein: '42g', carbs: '46g', fats: '24g', description: 'Salmon fillet, sweet potato, asparagus.' },
  ]),
  createDay(16, 'Energy & Endurance', 2190, '158g', [
    { type: 'Breakfast', name: 'Oatmeal with Whey Protein, Banana & Walnuts', calories: 510, protein: '34g', carbs: '64g', fats: '14g', description: 'Oats, whey, banana, walnuts.' },
    { type: 'Morning Snack', name: 'Hard Boiled Eggs & Whole Grain Crackers', calories: 260, protein: '16g', carbs: '20g', fats: '12g', description: '2 eggs, whole wheat crackers.' },
    { type: 'Lunch', name: 'Mediterranean Tuna Pasta Salad with Olives & Feta', calories: 630, protein: '46g', carbs: '62g', fats: '20g', description: 'Tuna pasta salad, olives, feta, tomatoes.' },
    { type: 'Afternoon Snack', name: 'Cottage Cheese with Pineapple Chunks', calories: 220, protein: '24g', carbs: '22g', fats: '4g', description: 'Cottage cheese with pineapple.' },
    { type: 'Dinner', name: 'Lean Sirloin Steak with Roasted Potatoes & Green Beans', calories: 570, protein: '44g', carbs: '44g', fats: '22g', description: 'Sirloin steak, baby potatoes, green beans.' },
  ]),
  createDay(17, 'Clean Vitality Nourish', 2210, '154g', [
    { type: 'Breakfast', name: 'Spinach, Mushroom & Feta 3-Egg Omelet with Toast', calories: 470, protein: '32g', carbs: '32g', fats: '24g', description: '3 eggs, spinach, mushrooms, feta, toast.' },
    { type: 'Morning Snack', name: 'Whey Protein Shake & Fresh Orange', calories: 230, protein: '28g', carbs: '22g', fats: '2g', description: 'Whey isolate + orange.' },
    { type: 'Lunch', name: 'Turkey Breast & Avocado Wrap with Side Salad', calories: 590, protein: '44g', carbs: '46g', fats: '22g', description: 'Turkey wrap, avocado, greens.' },
    { type: 'Afternoon Snack', name: 'Mixed Almonds, Walnuts & Dried Cranberries', calories: 240, protein: '8g', carbs: '24g', fats: '14g', description: 'Nuts and dried cranberries.' },
    { type: 'Dinner', name: 'Pan-Seared Cod with Lemon Rice & Roasted Zucchini', calories: 580, protein: '44g', carbs: '50g', fats: '18g', description: 'Cod, lemon rice, roasted zucchini.' },
  ]),
  createDay(18, 'Active Recovery Balance', 2180, '156g', [
    { type: 'Breakfast', name: 'Protein Berry Smoothie Bowl with Granola & Chia', calories: 490, protein: '34g', carbs: '62g', fats: '12g', description: 'Berry smoothie bowl, granola, chia.' },
    { type: 'Morning Snack', name: 'Rice Cakes with Peanut Butter & Sliced Banana', calories: 250, protein: '8g', carbs: '36g', fats: '10g', description: 'Rice cakes with peanut butter & banana.' },
    { type: 'Lunch', name: 'Beef & Broccoli Stir-Fry with Brown Rice', calories: 640, protein: '48g', carbs: '60g', fats: '22g', description: 'Flank steak, broccoli, brown rice.' },
    { type: 'Afternoon Snack', name: '0% Skyr with Strawberries & Honey', calories: 210, protein: '22g', carbs: '24g', fats: '2g', description: 'Skyr, strawberries, honey.' },
    { type: 'Dinner', name: 'Roast Chicken Breast with Sweet Potato Mash & Asparagus', calories: 590, protein: '46g', carbs: '48g', fats: '20g', description: 'Chicken breast, sweet potato mash, asparagus.' },
  ]),
  createDay(19, 'Strength & Stamina Boost', 2230, '160g', [
    { type: 'Breakfast', name: 'Scrambled Eggs with Smoked Salmon & Bagel', calories: 510, protein: '38g', carbs: '46g', fats: '18g', description: 'Eggs, smoked salmon, bagel.' },
    { type: 'Morning Snack', name: 'Cottage Cheese with Sliced Kiwi & Pumpkin Seeds', calories: 240, protein: '24g', carbs: '20g', fats: '6g', description: 'Cottage cheese, kiwi, pumpkin seeds.' },
    { type: 'Lunch', name: 'Chicken Fajita Bowl with Peppers & Rice', calories: 630, protein: '48g', carbs: '62g', fats: '18g', description: 'Chicken, peppers, rice, salsa.' },
    { type: 'Afternoon Snack', name: 'High Protein Bar', calories: 220, protein: '20g', carbs: '22g', fats: '7g', description: 'Protein bar.' },
    { type: 'Dinner', name: 'Grilled Sea Bass with Quinoa & Steamed Broccoli', calories: 560, protein: '42g', carbs: '44g', fats: '20g', description: 'Sea bass, quinoa, broccoli.' },
  ]),
  createDay(20, 'Weekend Vitality Flow', 2200, '152g', [
    { type: 'Breakfast', name: 'Protein Banana Pancakes with Pure Maple Syrup', calories: 490, protein: '32g', carbs: '68g', fats: '10g', description: 'Pancakes, banana, maple syrup.' },
    { type: 'Morning Snack', name: 'Hard Boiled Egg & Guacamole with Cucumber', calories: 230, protein: '10g', carbs: '12g', fats: '16g', description: 'Egg, guacamole, cucumber.' },
    { type: 'Lunch', name: 'Lean Turkey Burger with Sweet Potato Wedges & Greens', calories: 620, protein: '46g', carbs: '58g', fats: '20g', description: 'Turkey burger, sweet potato wedges, greens.' },
    { type: 'Afternoon Snack', name: 'Greek Yogurt with Blackberries & Walnuts', calories: 230, protein: '20g', carbs: '18g', fats: '9g', description: 'Greek yogurt, blackberries, walnuts.' },
    { type: 'Dinner', name: 'Baked Salmon with Wild Rice & Garlic Green Beans', calories: 610, protein: '44g', carbs: '46g', fats: '24g', description: 'Salmon, wild rice, green beans.' },
  ]),
  createDay(21, 'Week 3 Reset & Wellness', 2170, '154g', [
    { type: 'Breakfast', name: 'Avocado Toast with 2 Eggs & Turkey Bacon', calories: 480, protein: '28g', carbs: '38g', fats: '22g', description: 'Toast, avocado, 2 eggs, turkey bacon.' },
    { type: 'Morning Snack', name: 'Berry Protein Smoothie with Almond Milk', calories: 240, protein: '26g', carbs: '24g', fats: '4g', description: 'Protein smoothie with berries.' },
    { type: 'Lunch', name: 'Grilled Chicken Caesar Salad with Whole Grain Croutons', calories: 610, protein: '48g', carbs: '38g', fats: '24g', description: 'Chicken, romaine, light caesar, croutons.' },
    { type: 'Afternoon Snack', name: 'Cottage Cheese with Sliced Peaches', calories: 220, protein: '22g', carbs: '24g', fats: '3g', description: 'Cottage cheese with peaches.' },
    { type: 'Dinner', name: 'Pork Tenderloin Medallions with Fingerling Potatoes', calories: 600, protein: '46g', carbs: '46g', fats: '22g', description: 'Pork tenderloin, fingerling potatoes, carrots.' },
  ]),
  // Days 22 to 28 (Week 4)
  createDay(22, 'Week 4 Peak Vitality', 2210, '156g', [
    { type: 'Breakfast', name: 'Whole Grain Toast with 2 Poached Eggs, Avocado & Tomatoes', calories: 480, protein: '26g', carbs: '44g', fats: '22g', description: '2 slices sourdough, 2 eggs, avocado, tomatoes.' },
    { type: 'Morning Snack', name: 'Greek Yogurt with Mixed Berries & Pumpkin Seeds', calories: 280, protein: '22g', carbs: '26g', fats: '10g', description: 'Greek yogurt, berries, pumpkin seeds.' },
    { type: 'Lunch', name: 'Grilled Chicken Quinoa Bowl with Sautéed Veggies', calories: 620, protein: '48g', carbs: '58g', fats: '20g', description: 'Chicken breast, quinoa, zucchini, peppers.' },
    { type: 'Afternoon Snack', name: 'Apple Slices with Natural Peanut Butter', calories: 240, protein: '8g', carbs: '28g', fats: '12g', description: 'Apple slices with peanut butter.' },
    { type: 'Dinner', name: 'Baked Salmon with Sweet Potato & Asparagus', calories: 600, protein: '42g', carbs: '46g', fats: '24g', description: 'Salmon fillet, sweet potato, asparagus.' },
  ]),
  createDay(23, 'Optimum Fueling Rhythm', 2190, '158g', [
    { type: 'Breakfast', name: 'Oatmeal with Whey Protein, Banana & Walnuts', calories: 510, protein: '34g', carbs: '64g', fats: '14g', description: 'Oats, whey, banana, walnuts.' },
    { type: 'Morning Snack', name: 'Hard Boiled Eggs & Whole Grain Crackers', calories: 260, protein: '16g', carbs: '20g', fats: '12g', description: '2 eggs, whole wheat crackers.' },
    { type: 'Lunch', name: 'Mediterranean Tuna Pasta Salad with Olives & Feta', calories: 630, protein: '46g', carbs: '62g', fats: '20g', description: 'Tuna, penne, olives, feta, tomatoes.' },
    { type: 'Afternoon Snack', name: 'Cottage Cheese with Pineapple Chunks', calories: 220, protein: '24g', carbs: '22g', fats: '4g', description: 'Cottage cheese with pineapple.' },
    { type: 'Dinner', name: 'Lean Sirloin Steak with Roasted Potatoes & Green Beans', calories: 570, protein: '44g', carbs: '44g', fats: '22g', description: 'Sirloin steak, baby potatoes, green beans.' },
  ]),
  createDay(24, 'Whole Body Vitality', 2210, '154g', [
    { type: 'Breakfast', name: 'Spinach, Mushroom & Feta 3-Egg Omelet with Toast', calories: 470, protein: '32g', carbs: '32g', fats: '24g', description: '3 eggs, spinach, mushrooms, feta, toast.' },
    { type: 'Morning Snack', name: 'Whey Protein Shake & Fresh Orange', calories: 230, protein: '28g', carbs: '22g', fats: '2g', description: 'Whey isolate + orange.' },
    { type: 'Lunch', name: 'Turkey Breast & Avocado Wrap with Side Salad', calories: 590, protein: '44g', carbs: '46g', fats: '22g', description: 'Turkey wrap, avocado, greens.' },
    { type: 'Afternoon Snack', name: 'Mixed Almonds, Walnuts & Dried Cranberries', calories: 240, protein: '8g', carbs: '24g', fats: '14g', description: 'Nuts and dried cranberries.' },
    { type: 'Dinner', name: 'Pan-Seared Cod with Lemon Rice & Roasted Zucchini', calories: 580, protein: '44g', carbs: '50g', fats: '18g', description: 'Cod, lemon rice, roasted zucchini.' },
  ]),
  createDay(25, 'Active Balance Synergy', 2180, '156g', [
    { type: 'Breakfast', name: 'Protein Berry Smoothie Bowl with Granola & Chia', calories: 490, protein: '34g', carbs: '62g', fats: '12g', description: 'Berry smoothie bowl, granola, chia.' },
    { type: 'Morning Snack', name: 'Rice Cakes with Peanut Butter & Sliced Banana', calories: 250, protein: '8g', carbs: '36g', fats: '10g', description: 'Rice cakes with peanut butter & banana.' },
    { type: 'Lunch', name: 'Beef & Broccoli Stir-Fry with Brown Rice', calories: 640, protein: '48g', carbs: '60g', fats: '22g', description: 'Flank steak, broccoli, brown rice.' },
    { type: 'Afternoon Snack', name: '0% Skyr with Strawberries & Honey', calories: 210, protein: '22g', carbs: '24g', fats: '2g', description: 'Skyr, strawberries, honey.' },
    { type: 'Dinner', name: 'Roast Chicken Breast with Sweet Potato Mash & Asparagus', calories: 590, protein: '46g', carbs: '48g', fats: '20g', description: 'Chicken breast, sweet potato mash, asparagus.' },
  ]),
  createDay(26, 'Sustained Strength Day', 2230, '160g', [
    { type: 'Breakfast', name: 'Scrambled Eggs with Smoked Salmon & Bagel', calories: 510, protein: '38g', carbs: '46g', fats: '18g', description: 'Eggs, smoked salmon, bagel.' },
    { type: 'Morning Snack', name: 'Cottage Cheese with Sliced Kiwi & Pumpkin Seeds', calories: 240, protein: '24g', carbs: '20g', fats: '6g', description: 'Cottage cheese, kiwi, pumpkin seeds.' },
    { type: 'Lunch', name: 'Chicken Fajita Bowl with Peppers & Rice', calories: 630, protein: '48g', carbs: '62g', fats: '18g', description: 'Chicken, peppers, rice, salsa.' },
    { type: 'Afternoon Snack', name: 'High Protein Bar', calories: 220, protein: '20g', carbs: '22g', fats: '7g', description: 'Protein bar.' },
    { type: 'Dinner', name: 'Grilled Sea Bass with Quinoa & Steamed Broccoli', calories: 560, protein: '42g', carbs: '44g', fats: '20g', description: 'Sea bass, quinoa, broccoli.' },
  ]),
  createDay(27, 'Weekend Equilibrium', 2200, '152g', [
    { type: 'Breakfast', name: 'Protein Banana Pancakes with Pure Maple Syrup', calories: 490, protein: '32g', carbs: '68g', fats: '10g', description: 'Pancakes, banana, maple syrup.' },
    { type: 'Morning Snack', name: 'Hard Boiled Egg & Guacamole with Cucumber', calories: 230, protein: '10g', carbs: '12g', fats: '16g', description: 'Egg, guacamole, cucumber.' },
    { type: 'Lunch', name: 'Lean Turkey Burger with Sweet Potato Wedges & Greens', calories: 620, protein: '46g', carbs: '58g', fats: '20g', description: 'Turkey burger, sweet potato wedges, greens.' },
    { type: 'Afternoon Snack', name: 'Greek Yogurt with Blackberries & Walnuts', calories: 230, protein: '20g', carbs: '18g', fats: '9g', description: 'Greek yogurt, blackberries, walnuts.' },
    { type: 'Dinner', name: 'Baked Salmon with Wild Rice & Garlic Green Beans', calories: 610, protein: '44g', carbs: '46g', fats: '24g', description: 'Salmon, wild rice, green beans.' },
  ]),
  createDay(28, 'Mindful Nutrition Reset', 2170, '154g', [
    { type: 'Breakfast', name: 'Avocado Toast with 2 Eggs & Turkey Bacon', calories: 480, protein: '28g', carbs: '38g', fats: '22g', description: 'Toast, avocado, 2 eggs, turkey bacon.' },
    { type: 'Morning Snack', name: 'Berry Protein Smoothie with Almond Milk', calories: 240, protein: '26g', carbs: '24g', fats: '4g', description: 'Protein smoothie with berries.' },
    { type: 'Lunch', name: 'Grilled Chicken Caesar Salad with Whole Grain Croutons', calories: 610, protein: '48g', carbs: '38g', fats: '24g', description: 'Chicken, romaine, light caesar, croutons.' },
    { type: 'Afternoon Snack', name: 'Cottage Cheese with Sliced Peaches', calories: 220, protein: '22g', carbs: '24g', fats: '3g', description: 'Cottage cheese with peaches.' },
    { type: 'Dinner', name: 'Pork Tenderloin Medallions with Fingerling Potatoes', calories: 600, protein: '46g', carbs: '46g', fats: '22g', description: 'Pork tenderloin, fingerling potatoes, carrots.' },
  ]),
  // Days 29 to 30 (Week 5 - Final Days)
  createDay(29, '30-Day Fitness Peak', 2220, '156g', [
    { type: 'Breakfast', name: 'Poached Eggs & Avocado on Sourdough with Smoked Salmon', calories: 510, protein: '36g', carbs: '42g', fats: '22g', description: '2 eggs, 60g smoked salmon, 1/3 avocado on toasted sourdough.' },
    { type: 'Morning Snack', name: 'Greek Yogurt with Strawberries & Pumpkin Seeds', calories: 260, protein: '22g', carbs: '24g', fats: '8g', description: '180g Greek yogurt, fresh strawberries, pumpkin seeds.' },
    { type: 'Lunch', name: 'Grilled Chicken, Sweet Potato & Quinoa Power Bowl', calories: 630, protein: '48g', carbs: '64g', fats: '18g', description: '190g chicken breast, roasted sweet potato, quinoa, lemon dressing.' },
    { type: 'Afternoon Snack', name: 'High Protein Bar & Fresh Apple', calories: 260, protein: '20g', carbs: '34g', fats: '6g', description: 'Protein bar + 1 fresh apple.' },
    { type: 'Dinner', name: 'Baked Salmon with Wild Rice & Sautéed Asparagus', calories: 600, protein: '44g', carbs: '46g', fats: '24g', description: '180g wild salmon, wild rice pilaf, sautéed asparagus.' },
  ]),
  createDay(30, 'Total Vitality Celebration', 2240, '160g', [
    { type: 'Breakfast', name: 'Champion Protein Omelet with Sourdough & Berries', calories: 520, protein: '40g', carbs: '48g', fats: '20g', description: '3 eggs, lean turkey, spinach, cheddar, 1 slice sourdough, side of fresh berries.' },
    { type: 'Morning Snack', name: 'Skyr with Blueberries, Walnuts & Honey', calories: 270, protein: '24g', carbs: '26g', fats: '8g', description: '180g Icelandic skyr, wild blueberries, crushed walnuts, 1 tsp honey.' },
    { type: 'Lunch', name: 'Sirloin Steak Bowl with Jasmine Rice & Roasted Veggies', calories: 640, protein: '50g', carbs: '60g', fats: '22g', description: '180g sirloin steak strips, jasmine rice, roasted bell peppers & zucchini.' },
    { type: 'Afternoon Snack', name: 'Protein Shake & Banana with Peanut Butter', calories: 270, protein: '26g', carbs: '32g', fats: '6g', description: '1 scoop whey shake + 1/2 banana with light peanut butter.' },
    { type: 'Dinner', name: 'Grilled Sea Bass with Lemon Herb Potatoes & Green Beans', calories: 580, protein: '46g', carbs: '44g', fats: '20g', description: '200g sea bass fillet, rosemary roasted baby potatoes, steamed green beans.' },
  ]),
];

// -------------------------------------------------------------
// DIET PLANS COLLECTION
// -------------------------------------------------------------
export const DIET_PLANS: DietPlan[] = [
  {
    id: 'muscle_gain_30d',
    title: 'Muscle Gain',
    subtitle: 'Hypertrophy & Clean Bulk (30 Days)',
    goal: 'BUILD MUSCLE',
    calories: '2800 kcal',
    macros: {
      protein: '185g',
      carbs: '340g',
      fats: '75g',
    },
    overview: 'High-protein, complex carbohydrate nutrition tailored for maximum muscle hypertrophy, strength progression, and rapid recovery.',
    days: MUSCLE_GAIN_DAYS,
  },
  {
    id: 'fat_loss_30d',
    title: 'Fat Loss',
    subtitle: 'High Satiety Caloric Deficit (30 Days)',
    goal: 'LOSE WEIGHT',
    calories: '1700 kcal',
    macros: {
      protein: '150g',
      carbs: '140g',
      fats: '55g',
    },
    overview: 'Scientifically calibrated caloric deficit focused on high satiety, lean protein preservation, thermogenic nutrient density, and sustainable fat reduction.',
    days: FAT_LOSS_DAYS,
  },
  {
    id: 'balanced_fitness_30d',
    title: 'Balanced Fitness',
    subtitle: 'Vitality & Maintenance (30 Days)',
    goal: 'KEEP FIT',
    calories: '2200 kcal',
    macros: {
      protein: '155g',
      carbs: '225g',
      fats: '68g',
    },
    overview: 'Mediterranean-inspired whole-food nutrition delivering optimal daily vitality, lean body composition maintenance, and long-term metabolic health.',
    days: BALANCED_FITNESS_DAYS,
  },
];
