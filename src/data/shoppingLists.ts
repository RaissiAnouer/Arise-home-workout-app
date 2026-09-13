export interface ShoppingCategory {
  category: string;
  emoji: string;
  items: string[];
}

export interface WeeklyShoppingList {
  weekNumber: number;
  title: string;
  daysRange: string;
  categories: ShoppingCategory[];
}

export const WEEKLY_DIET_SHOPPING_LISTS: Record<string, WeeklyShoppingList[]> = {
  muscle_gain_30d: [
    {
      weekNumber: 1,
      title: 'Week 1 Groceries',
      daysRange: 'Days 1 – 7',
      categories: [
        {
          category: 'Proteins & Seafood',
          emoji: '🥩',
          items: [
            'Chicken Breast (boneless, skinless): 1.2 kg',
            'Lean Ground Beef (5% or 10% lean): 800g',
            'Wild Salmon Fillets: 600g',
            'Fresh Tuna Steaks: 400g',
            'Deli Turkey Breast Slices: 350g',
            'Free-Range Eggs: 24 count',
            'Whey Protein Isolate (Vanilla or Chocolate): 1 tub',
          ],
        },
        {
          category: 'Produce, Greens & Fruits',
          emoji: '🥦',
          items: [
            'Fresh Baby Spinach: 400g',
            'Broccoli Crowns: 3 heads',
            'Fresh Asparagus Spears: 2 bunches',
            'Zucchini: 4 medium',
            'Bananas: 8 count',
            'Fresh Strawberries & Blueberries: 500g',
            'Ripe Avocados: 4 count',
            'Sweet Potatoes: 1.5 kg',
            'Baby Red Potatoes: 1 kg',
          ],
        },
        {
          category: 'Carbs & Whole Grains',
          emoji: '🌾',
          items: [
            'Rolled Oats / Steel Cut Oats: 1 kg',
            'Tricolor Quinoa: 500g',
            'White Jasmine & Brown Basmati Rice: 1 kg',
            'Whole Grain Sourdough Loaf: 1 loaf',
            'Whole Wheat Tortilla Wraps: 1 pack',
            'Whole Grain Penne Pasta: 500g',
            'Whole Grain Rice Cakes: 1 pack',
          ],
        },
        {
          category: 'Dairy & Alternatives',
          emoji: '🥛',
          items: [
            'Greek Yogurt (2% or 0% fat): 1 kg',
            'Low-Fat Cottage Cheese: 800g',
            'Icelandic Skyr: 500g',
            'Unsweetened Almond Milk or Oat Milk: 2 liters',
            'Feta Cheese / Light Cheddar: 200g',
          ],
        },
        {
          category: 'Healthy Fats & Pantry',
          emoji: '🥑',
          items: [
            'Natural Peanut Butter (100% peanuts): 1 jar',
            'Almond Butter: 1 jar',
            'Raw Walnuts & Cashews: 250g',
            'Chia Seeds & Roasted Pumpkin Seeds: 200g',
            'Extra Virgin Olive Oil: 1 bottle',
            'Pure Canadian Maple Syrup: 1 bottle',
            'Marinara Pasta Sauce (Low sugar): 1 jar',
          ],
        },
      ],
    },
    {
      weekNumber: 2,
      title: 'Week 2 Groceries',
      daysRange: 'Days 8 – 14',
      categories: [
        {
          category: 'Proteins & Seafood',
          emoji: '🥩',
          items: [
            'Chicken Breast: 1.4 kg',
            'Sirloin Steak / Flank Steak: 800g',
            'Salmon Fillets: 600g',
            'Canned Solid White Albacore Tuna: 4 cans',
            'Lean Ground Turkey: 600g',
            'Free-Range Eggs: 24 count',
            'Turkey Bacon: 1 pack',
          ],
        },
        {
          category: 'Produce, Greens & Fruits',
          emoji: '🥦',
          items: [
            'Bell Peppers (Red, Yellow, Green): 5 count',
            'Broccoli & Cauliflower: 2 heads each',
            'Green Beans: 500g',
            'Sweet Corn (Fresh or Frozen): 400g',
            'Apples (Gala or Honeycrisp): 6 count',
            'Ripe Bananas: 8 count',
            'Navel Oranges: 4 count',
            'Fresh Blueberries: 400g',
            'Russet & Sweet Potatoes: 1.5 kg',
          ],
        },
        {
          category: 'Carbs & Whole Grains',
          emoji: '🌾',
          items: [
            'Rolled Oats: 1 kg',
            'Jasmine Rice & Wild Rice Blend: 1 kg',
            'Whole Wheat Rigatoni Pasta: 500g',
            'Whole Grain Bagels: 1 pack',
            'Whole Grain Tortillas: 1 pack',
            'Salted Caramel / Brown Rice Cakes: 1 pack',
          ],
        },
        {
          category: 'Dairy & Alternatives',
          emoji: '🥛',
          items: [
            'Greek Yogurt: 1 kg',
            'Low-Fat Cottage Cheese: 800g',
            'Light Cheddar & Swiss Cheese: 200g',
            'Skim Milk or Unsweetened Almond Milk: 2 liters',
          ],
        },
        {
          category: 'Healthy Fats & Pantry',
          emoji: '🥑',
          items: [
            'Natural Peanut Butter: 1 jar',
            'Dark Chocolate Chips (85% cocoa): 1 pack',
            'Raw Almonds: 200g',
            'Chia Seeds: 150g',
            'Low-Sugar Teriyaki & BBQ Glaze: 1 bottle each',
            'Tomato Basil Pasta Sauce: 1 jar',
          ],
        },
      ],
    },
    {
      weekNumber: 3,
      title: 'Week 3 Groceries',
      daysRange: 'Days 15 – 21',
      categories: [
        {
          category: 'Proteins & Seafood',
          emoji: '🥩',
          items: [
            'Chicken Breast & Thighs: 1.4 kg',
            'Lean Ground Beef (5% lean): 800g',
            'Sirloin Steak: 600g',
            'Atlantic Salmon & Cod Fillets: 800g',
            'Eggs: 24 count',
            'Sliced Turkey Breast / Turkey Bacon: 400g',
          ],
        },
        {
          category: 'Produce, Greens & Fruits',
          emoji: '🥦',
          items: [
            'Baby Spinach & Mixed Greens: 500g',
            'Asparagus: 2 bunches',
            'Green Beans & Snap Peas: 600g',
            'Button Mushrooms: 300g',
            'Bananas: 8 count',
            'Pineapple (Fresh whole or pre-cut): 1 count',
            'Fresh Mixed Berries (Strawberries, Blackberries): 500g',
            'Sweet Potatoes & Baby Red Potatoes: 1.5 kg',
          ],
        },
        {
          category: 'Carbs & Whole Grains',
          emoji: '🌾',
          items: [
            'Steel Cut Oats: 1 kg',
            'Basmati Rice: 1 kg',
            'Tricolor Quinoa: 500g',
            'Whole Grain Sourdough & Brioche: 1 loaf each',
            'Whole Grain Penne Pasta: 500g',
            'Rice Vermicelli Noodles: 1 pack',
          ],
        },
        {
          category: 'Dairy & Alternatives',
          emoji: '🥛',
          items: [
            'Plain Greek Yogurt: 1 kg',
            'Low-Fat Cottage Cheese: 800g',
            'Icelandic Skyr: 500g',
            'Almond Milk: 2 liters',
          ],
        },
        {
          category: 'Healthy Fats & Pantry',
          emoji: '🥑',
          items: [
            'Natural Peanut Butter: 1 jar',
            'Raw Walnuts & Pumpkin Seeds: 200g',
            'Guacamole or Fresh Avocados: 4 count',
            'Pure Maple Syrup & Raw Honey: 1 bottle each',
          ],
        },
      ],
    },
    {
      weekNumber: 4,
      title: 'Week 4 Groceries',
      daysRange: 'Days 22 – 28',
      categories: [
        {
          category: 'Proteins & Seafood',
          emoji: '🥩',
          items: [
            'Chicken Breast: 1.4 kg',
            'Extra Lean Ground Beef: 800g',
            'Wild Salmon & Fresh Tuna: 800g',
            'Lean Turkey Meatballs: 500g',
            'Eggs: 24 count',
            'Smoked Salmon: 200g',
          ],
        },
        {
          category: 'Produce, Greens & Fruits',
          emoji: '🥦',
          items: [
            'Fresh Broccoli & Zucchini: 4 count each',
            'Asparagus Spears: 2 bunches',
            'Baby Carrots & Snap Peas: 500g',
            'Bananas: 8 count',
            'Strawberries & Blueberries: 500g',
            'Avocados: 4 count',
            'Sweet Potatoes: 1.5 kg',
          ],
        },
        {
          category: 'Carbs & Whole Grains',
          emoji: '🌾',
          items: [
            'Rolled Oats: 1 kg',
            'Jasmine & Brown Rice: 1 kg',
            'Whole Wheat Wraps: 1 pack',
            'Whole Grain Bagels: 1 pack',
            'Rice Cakes: 2 packs',
          ],
        },
        {
          category: 'Dairy & Alternatives',
          emoji: '🥛',
          items: [
            'Greek Yogurt: 1 kg',
            'Low-Fat Cottage Cheese: 800g',
            'Feta & Light Cheddar: 200g',
            'Almond Milk: 2 liters',
          ],
        },
        {
          category: 'Healthy Fats & Pantry',
          emoji: '🥑',
          items: [
            'Almond Butter & Peanut Butter: 1 jar each',
            'Raw Mixed Nuts: 250g',
            'Chia Seeds: 150g',
            'Olive Oil: 1 bottle',
          ],
        },
      ],
    },
    {
      weekNumber: 5,
      title: 'Week 5 Groceries',
      daysRange: 'Days 29 – 30',
      categories: [
        {
          category: 'Proteins & Seafood',
          emoji: '🥩',
          items: [
            'Chicken Breast: 600g',
            'Prime Sirloin Steak: 500g',
            'Salmon Fillets: 400g',
            'Free-Range Eggs: 12 count',
            'Smoked Salmon: 150g',
          ],
        },
        {
          category: 'Produce & Carbs',
          emoji: '🥦',
          items: [
            'Bananas & Strawberries: 400g',
            'Fresh Asparagus & Green Beans: 400g',
            'Sweet Potatoes & Baby Potatoes: 1 kg',
            'Quinoa & Jasmine Rice: 500g',
            'Sourdough Bread: 1 loaf',
          ],
        },
        {
          category: 'Dairy & Pantry',
          emoji: '🥛',
          items: [
            'Greek Yogurt & Skyr: 500g each',
            'Raw Walnuts & Honey: small pack',
            'BBQ Glaze & Olive Oil',
          ],
        },
      ],
    },
  ],

  fat_loss_30d: [
    {
      weekNumber: 1,
      title: 'Week 1 Groceries',
      daysRange: 'Days 1 – 7',
      categories: [
        {
          category: 'Lean Proteins & Seafood',
          emoji: '🥩',
          items: [
            'Chicken Breast (boneless, skinless): 1.4 kg',
            'Atlantic Cod or Halibut Fillets: 800g',
            'Wild Salmon Fillets: 400g',
            'Canned Albacore Tuna in Spring Water: 5 cans',
            'Extra Lean Ground Turkey (93-99% lean): 600g',
            'Free-Range Eggs (for whites & whole): 30 count',
            'Smoked Salmon: 150g',
            'Whey Protein Isolate (Low carb): 1 tub',
          ],
        },
        {
          category: 'High-Volume Produce & Greens',
          emoji: '🥦',
          items: [
            'Baby Spinach & Baby Arugula: 600g',
            'Mixed Salad Greens / Romaine Lettuce: 3 heads',
            'Fresh Cauliflower (or riced cauliflower): 2 bags',
            'Broccoli Crowns: 3 heads',
            'Zucchini (for spiralizing): 6 medium',
            'Cucumbers & Celery: 4 count each',
            'Cherry Tomatoes: 500g',
            'Fresh Raspberries, Blackberries & Blueberries: 600g',
            'Green Apples (Granny Smith): 4 count',
            'Spaghetti Squash: 1 medium',
          ],
        },
        {
          category: 'Controlled Grains & Carbs',
          emoji: '🌾',
          items: [
            'Rolled Oats: 500g',
            '100% Whole Rye Bread / Sourdough: 1 loaf',
            'Canned Chickpeas (garbanzo beans): 2 cans',
            'Sweet Potatoes: 500g',
            'Tricolor Quinoa: 300g',
          ],
        },
        {
          category: 'Dairy & Alternatives',
          emoji: '🥛',
          items: [
            '0% Fat Plain Greek Yogurt: 1 kg',
            'Fat-Free Cottage Cheese: 800g',
            '0% Icelandic Skyr: 500g',
            'Unsweetened Vanilla Almond Milk (30 kcal/cup): 2 liters',
          ],
        },
        {
          category: 'Healthy Fats & Condiments',
          emoji: '🥑',
          items: [
            'Avocados: 3 count',
            'Extra Virgin Olive Oil & Balsamic Vinegar: 1 bottle each',
            'Dijon Mustard & Light Mayonnaise: 1 jar each',
            'Natural Peanut Butter: 1 jar',
            'Chia Seeds & Ground Flaxseeds: 150g each',
            'Natural Stevia Drops / Powder: 1 pack',
          ],
        },
      ],
    },
    {
      weekNumber: 2,
      title: 'Week 2 Groceries',
      daysRange: 'Days 8 – 14',
      categories: [
        {
          category: 'Lean Proteins & Seafood',
          emoji: '🥩',
          items: [
            'Chicken Breast: 1.4 kg',
            'Fresh Cod Fillets: 800g',
            'Lean Flank Steak (95% lean): 500g',
            'Tuna in Springwater: 4 cans',
            'Turkey Bacon: 1 pack',
            'Shrimp (peeled, deveined): 500g',
            'Eggs: 30 count',
          ],
        },
        {
          category: 'High-Volume Produce & Greens',
          emoji: '🥦',
          items: [
            'Brussels Sprouts: 500g',
            'Asparagus: 2 bunches',
            'Broccoli Florets: 600g',
            'Snap Peas & Zucchini: 500g each',
            'Fresh Strawberries & Blueberries: 500g',
            'Kale & Romaine: 2 bunches each',
            'Baby Carrots & Cucumbers: 400g each',
          ],
        },
        {
          category: 'Grains & Carbs',
          emoji: '🌾',
          items: [
            'Rolled Oats: 500g',
            'Low-Carb Whole Wheat Tortillas: 1 pack',
            '100% Rye Bread: 1 loaf',
            'Black Beans (Canned, no salt): 2 cans',
          ],
        },
        {
          category: 'Dairy & Alternatives',
          emoji: '🥛',
          items: [
            '0% Greek Yogurt: 1 kg',
            'Fat-Free Cottage Cheese: 800g',
            'Light Feta Cheese: 150g',
            'Unsweetened Almond Milk: 2 liters',
          ],
        },
        {
          category: 'Pantry Essentials',
          emoji: '🥑',
          items: [
            'Cold Brew Coffee (unsweetened): 1 bottle',
            'Light Hummus: 1 tub',
            'Flaxseeds & Chia Seeds',
            'Cinnamon & Pink Himalayan Sea Salt',
          ],
        },
      ],
    },
    {
      weekNumber: 3,
      title: 'Week 3 Groceries',
      daysRange: 'Days 15 – 21',
      categories: [
        {
          category: 'Lean Proteins & Seafood',
          emoji: '🥩',
          items: [
            'Chicken Breast: 1.4 kg',
            'White Cod / Halibut: 800g',
            'Salmon Fillets: 400g',
            'Tuna in Water: 4 cans',
            'Lean Ground Turkey (99% lean): 600g',
            'Eggs: 30 count',
          ],
        },
        {
          category: 'High-Volume Produce',
          emoji: '🥦',
          items: [
            'Baby Spinach & Mushrooms: 500g each',
            'Cauliflower Rice: 3 bags',
            'Zucchini & Spaghetti Squash: 4 count / 1 squash',
            'Asparagus & Snap Peas: 400g each',
            'Raspberries & Blackberries: 500g',
            'Apples & Cucumbers: 4 count each',
          ],
        },
        {
          category: 'Grains, Dairy & Pantry',
          emoji: '🥛',
          items: [
            'Rolled Oats & Rye Bread: 1 pack each',
            '0% Greek Yogurt & Fat-Free Cottage Cheese: 1 kg each',
            'Unsweetened Almond Milk: 2 liters',
            'Basil Pesto (Light): 1 jar',
            'Peanut Butter & Chia Seeds: 1 jar each',
          ],
        },
      ],
    },
    {
      weekNumber: 4,
      title: 'Week 4 Groceries',
      daysRange: 'Days 22 – 28',
      categories: [
        {
          category: 'Lean Proteins & Seafood',
          emoji: '🥩',
          items: [
            'Chicken Breast: 1.4 kg',
            'White Cod Fillets: 800g',
            'Flank Steak (Lean): 500g',
            'Wild Salmon Fillets: 400g',
            'Eggs: 30 count',
            'Turkey Bacon: 1 pack',
            'Tuna: 4 cans',
          ],
        },
        {
          category: 'High-Volume Produce',
          emoji: '🥦',
          items: [
            'Brussels Sprouts & Broccoli: 1 kg',
            'Cauliflower Rice & Zucchini: 600g',
            'Cherry Tomatoes & Mixed Salad Greens: 500g',
            'Strawberries & Blueberries: 500g',
            'Avocados: 3 count',
          ],
        },
        {
          category: 'Grains, Dairy & Pantry',
          emoji: '🥛',
          items: [
            '0% Greek Yogurt & Cottage Cheese: 1 kg each',
            'Unsweetened Almond Milk: 2 liters',
            'Low-Carb Wraps & Rye Bread: 1 pack each',
            'Hummus & Light Vinaigrette',
          ],
        },
      ],
    },
    {
      weekNumber: 5,
      title: 'Week 5 Groceries',
      daysRange: 'Days 29 – 30',
      categories: [
        {
          category: 'Proteins & Seafood',
          emoji: '🥩',
          items: [
            'Chicken Breast: 600g',
            'Salmon Fillets: 400g',
            'Cod Fillets: 400g',
            'Eggs: 12 count',
            'Smoked Salmon: 100g',
          ],
        },
        {
          category: 'Produce & Dairy',
          emoji: '🥦',
          items: [
            'Asparagus, Green Beans & Bell Peppers: 600g',
            'Cauliflower Rice & Mixed Greens: 400g',
            'Strawberries & Blueberries: 300g',
            '0% Greek Yogurt & Cottage Cheese: 500g each',
            'Whole Wheat Sourdough: 1 loaf',
          ],
        },
      ],
    },
  ],

  balanced_fitness_30d: [
    {
      weekNumber: 1,
      title: 'Week 1 Groceries',
      daysRange: 'Days 1 – 7',
      categories: [
        {
          category: 'Proteins & Seafood',
          emoji: '🥩',
          items: [
            'Chicken Breast (skinless): 1.2 kg',
            'Wild Salmon Fillets: 600g',
            'Atlantic Cod Fillets: 400g',
            'Lean Sirloin Steak: 400g',
            'Solid Tuna in Olive Oil: 3 cans',
            'Turkey Breast Slices / Turkey Bacon: 400g',
            'Free-Range Eggs: 24 count',
            'Whey Protein Isolate (Vanilla): 1 tub',
          ],
        },
        {
          category: 'Fresh Produce & Fruits',
          emoji: '🥦',
          items: [
            'Avocados: 4 count',
            'Baby Spinach & Romaine Lettuce: 500g',
            'Asparagus: 2 bunches',
            'Broccoli & Zucchini: 3 count each',
            'Sweet Potatoes & Baby Fingerling Potatoes: 1.5 kg',
            'Honeycrisp Apples: 6 count',
            'Bananas & Fresh Navel Oranges: 6 count each',
            'Fresh Mixed Berries (Blueberries, Raspberries): 500g',
            'Cherry Tomatoes: 400g',
          ],
        },
        {
          category: 'Complex Grains & Carbs',
          emoji: '🌾',
          items: [
            'Rolled Oats: 1 kg',
            'Whole Grain Sourdough Loaf: 1 loaf',
            'Tricolor Quinoa: 500g',
            'Whole Wheat Penne Pasta: 500g',
            'Basmati Rice & Wild Rice Blend: 1 kg',
            'Whole Wheat Wraps: 1 pack',
            'Whole Wheat Seed Crackers: 1 box',
          ],
        },
        {
          category: 'Dairy & Alternatives',
          emoji: '🥛',
          items: [
            'Greek Yogurt (2%): 1 kg',
            'Low-Fat Cottage Cheese: 800g',
            'Feta Cheese: 200g',
            'Unsweetened Almond Milk: 2 liters',
          ],
        },
        {
          category: 'Healthy Fats & Pantry',
          emoji: '🥑',
          items: [
            'Natural Creamy Peanut Butter: 1 jar',
            'Raw Walnuts & Almonds: 200g',
            'Pumpkin Seeds & Chia Seeds: 150g each',
            'Kalamata Olives (Pitted): 1 jar',
            'Extra Virgin Olive Oil & Balsamic Vinegar: 1 bottle each',
            'Pure Maple Syrup & Raw Honey: 1 bottle each',
          ],
        },
      ],
    },
    {
      weekNumber: 2,
      title: 'Week 2 Groceries',
      daysRange: 'Days 8 – 14',
      categories: [
        {
          category: 'Proteins & Seafood',
          emoji: '🥩',
          items: [
            'Chicken Breast: 1.2 kg',
            'Wild Salmon Fillets: 600g',
            'Sirloin Steak: 400g',
            'Lean Turkey Patty / Ground Turkey: 500g',
            'Sea Bass or Cod Fillets: 400g',
            'Eggs: 24 count',
            'Smoked Salmon: 150g',
          ],
        },
        {
          category: 'Fresh Produce & Fruits',
          emoji: '🥦',
          items: [
            'Bell Peppers & Onions: 4 count each',
            'Broccoli & Asparagus: 2 bunches each',
            'Sweet Potatoes & Potatoes: 1.5 kg',
            'Bananas, Apples & Kiwis: 5 count each',
            'Strawberries & Blackberries: 500g',
            'Avocados: 4 count',
          ],
        },
        {
          category: 'Grains & Carbs',
          emoji: '🌾',
          items: [
            'Rolled Oats: 1 kg',
            'Whole Grain Sourdough: 1 loaf',
            'Brown Rice & Quinoa: 1 kg',
            'Whole Wheat Bagels: 1 pack',
            'Brown Rice Cakes: 1 pack',
          ],
        },
        {
          category: 'Dairy & Alternatives',
          emoji: '🥛',
          items: [
            'Greek Yogurt: 1 kg',
            'Low-Fat Cottage Cheese: 800g',
            'Icelandic Skyr: 500g',
            'Almond Milk: 2 liters',
          ],
        },
        {
          category: 'Healthy Fats & Pantry',
          emoji: '🥑',
          items: [
            'Natural Peanut Butter: 1 jar',
            'Raw Walnuts & Pumpkin Seeds: 200g',
            'High-Protein Snack Bars: 1 box (5 bars)',
            'Olive Oil & Fresh Salsa',
          ],
        },
      ],
    },
    {
      weekNumber: 3,
      title: 'Week 3 Groceries',
      daysRange: 'Days 15 – 21',
      categories: [
        {
          category: 'Proteins & Seafood',
          emoji: '🥩',
          items: [
            'Chicken Breast: 1.2 kg',
            'Wild Salmon & Cod: 800g',
            'Sirloin Steak: 400g',
            'Tuna in Olive Oil: 3 cans',
            'Eggs: 24 count',
            'Turkey Breast: 300g',
          ],
        },
        {
          category: 'Fresh Produce',
          emoji: '🥦',
          items: [
            'Avocados: 4 count',
            'Spinach & Mushrooms: 400g each',
            'Asparagus & Green Beans: 600g',
            'Sweet Potatoes & Baby Potatoes: 1.5 kg',
            'Berries, Bananas & Apples: 1 kg',
          ],
        },
        {
          category: 'Grains, Dairy & Pantry',
          emoji: '🌾',
          items: [
            'Rolled Oats & Quinoa: 1 kg',
            'Whole Grain Sourdough: 1 loaf',
            'Greek Yogurt & Cottage Cheese: 1 kg each',
            'Almond Milk: 2 liters',
            'Nuts, Seeds, Olive Oil & Honey',
          ],
        },
      ],
    },
    {
      weekNumber: 4,
      title: 'Week 4 Groceries',
      daysRange: 'Days 22 – 28',
      categories: [
        {
          category: 'Proteins & Seafood',
          emoji: '🥩',
          items: [
            'Chicken Breast: 1.2 kg',
            'Salmon Fillets: 600g',
            'Sirloin Steak: 400g',
            'Sea Bass / White Fish: 400g',
            'Eggs: 24 count',
            'Turkey Bacon & Smoked Salmon',
          ],
        },
        {
          category: 'Fresh Produce',
          emoji: '🥦',
          items: [
            'Broccoli, Asparagus & Zucchini: 1 kg',
            'Sweet Potatoes & Fingerling Potatoes: 1.5 kg',
            'Bananas, Apples & Strawberries: 1 kg',
            'Avocados & Cherry Tomatoes: 400g each',
          ],
        },
        {
          category: 'Grains, Dairy & Pantry',
          emoji: '🥛',
          items: [
            'Greek Yogurt & Cottage Cheese: 1 kg each',
            'Whole Grain Bread & Wraps: 1 pack each',
            'Brown Rice & Oats: 1 kg',
            'Almond Milk & Nut Butter',
          ],
        },
      ],
    },
    {
      weekNumber: 5,
      title: 'Week 5 Groceries',
      daysRange: 'Days 29 – 30',
      categories: [
        {
          category: 'Proteins & Seafood',
          emoji: '🥩',
          items: [
            'Chicken Breast: 500g',
            'Wild Salmon: 400g',
            'Sirloin Steak: 400g',
            'Free-Range Eggs: 12 count',
            'Smoked Salmon: 100g',
          ],
        },
        {
          category: 'Produce & Grains',
          emoji: '🥦',
          items: [
            'Asparagus & Green Beans: 400g',
            'Sweet Potatoes & Baby Potatoes: 1 kg',
            'Fresh Berries & Bananas: 400g',
            'Sourdough Bread & Jasmine Rice: 500g',
          ],
        },
        {
          category: 'Dairy & Pantry',
          emoji: '🥛',
          items: [
            'Greek Yogurt: 500g',
            'Skyr: 300g',
            'Walnuts, Honey & Olive Oil',
          ],
        },
      ],
    },
  ],
};

// Fallback legacy flat shopping list for backward compatibility
export const DIET_SHOPPING_LISTS: Record<string, string[]> = {
  muscle_gain_30d: [
    '- Chicken Breast: 1.4 kg',
    '- Lean Ground Beef (5% lean): 800g',
    '- Wild Salmon Fillets: 600g',
    '- Fresh Tuna Steaks: 400g',
    '- Free-Range Eggs: 24 count',
    '- Whey Protein Isolate: 1 tub',
    '- Rolled Oats: 1 kg',
    '- Jasmine & Brown Rice: 1 kg',
    '- Quinoa: 500g',
    '- Sweet Potatoes: 2 kg',
    '- Greek Yogurt: 1 kg',
    '- Cottage Cheese: 800g',
    '- Fresh Berries & Bananas: 1.5 kg',
    '- Broccoli & Asparagus: 1 kg',
    '- Natural Peanut Butter & Almond Butter: 1 jar each',
  ],
  fat_loss_30d: [
    '- Chicken Breast: 1.4 kg',
    '- Cod & Halibut Fillets: 800g',
    '- Wild Salmon: 400g',
    '- Canned White Albacore Tuna: 5 cans',
    '- Eggs (Whites & Whole): 30 count',
    '- Low-Carb Whey Isolate: 1 tub',
    '- Cauliflower Rice: 3 bags',
    '- Zucchini (for zoodles): 6 medium',
    '- Spinach, Kale & Romaine: 1 kg',
    '- Broccoli & Asparagus: 1 kg',
    '- 0% Greek Yogurt: 1 kg',
    '- Fat-Free Cottage Cheese: 800g',
    '- Unsweetened Almond Milk: 2 L',
    '- Fresh Berries & Green Apples: 1 kg',
  ],
  balanced_fitness_30d: [
    '- Chicken Breast: 1.2 kg',
    '- Wild Salmon: 600g',
    '- Atlantic Cod / Sea Bass: 400g',
    '- Sirloin Steak: 400g',
    '- Eggs: 24 count',
    '- Rolled Oats & Sourdough: 1 kg / 1 loaf',
    '- Quinoa & Brown Rice: 1 kg',
    '- Sweet Potatoes: 1.5 kg',
    '- Avocados: 4 count',
    '- Greek Yogurt: 1 kg',
    '- Cottage Cheese: 800g',
    '- Fresh Mixed Fruits & Berries: 1.5 kg',
    '- Broccoli, Asparagus & Zucchini: 1 kg',
    '- Extra Virgin Olive Oil & Nuts: 1 bottle / 250g',
  ],
};
