// Complete Product Database with detailed information for all menu items
//
// ADD-ONS CONFIGURATION SYSTEM:
// Each product can have an optional 'addOnsConfig' object that controls which add-on sections
// are displayed on the product detail page. This makes the system scalable and flexible.
//
// addOnsConfig properties:
// - showSpiceLevel: boolean - Show spice level selector (for spicy dishes, curries, noodles)
// - showDrinks: boolean - Show drinks add-ons (typically shown for most main dishes)
// - showDesserts: boolean - Show dessert add-ons (typically shown for most main dishes)
// - showExtras: boolean - Show extras like cheese, sauce, garlic bread (for burgers, pasta, pizzas)
//
// Default configuration (if not specified):
// { showSpiceLevel: false, showDrinks: true, showDesserts: true, showExtras: false }
//
// Guidelines for adding new products:
// - Spicy dishes (curries, Asian noodles, Mexican): showSpiceLevel: true
// - Main meals (burgers, pasta, rice dishes): showDrinks: true, showDesserts: true
// - Customizable items (burgers, sandwiches, pasta): showExtras: true
// - Breakfast items, desserts, drinks: Only show relevant add-ons or none
//
const productsData = {
   // ===== POPULAR DISHES =====
   'pasta': {
      id: 'pasta',
      name: 'Pasta',
      category: 'Popular Dishes',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop',
      description: 'Delicious Italian pasta made with fresh ingredients and traditional recipes. Our pasta is cooked to perfection and served with your choice of sauce.',
      ingredients: ['Durum Wheat Semolina', 'Fresh Tomatoes', 'Garlic', 'Olive Oil', 'Basil', 'Parmesan Cheese', 'Salt', 'Black Pepper'],
      rating: 4,
      basePrice: 35.00,
      sizes: [
         { name: 'Regular', price: 35.00, description: 'Perfect for one person' },
         { name: 'Large', price: 55.00, description: 'Great for sharing' }
      ],
      nutritionInfo: {
         calories: '450 kcal',
         protein: '15g',
         carbs: '65g',
         fat: '12g'
      },
      addOnsConfig: {
         showSpiceLevel: true,
         showDrinks: true,
         showDesserts: true,
         showExtras: true
      }
   },
   'french-fries': {
      id: 'french-fries',
      name: 'French Fries',
      category: 'Popular Dishes',
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&h=600&fit=crop',
      description: 'Crispy golden French fries, perfectly seasoned and fried to perfection. Made from premium potatoes and served hot.',
      ingredients: ['Premium Potatoes', 'Vegetable Oil', 'Salt', 'Special Seasoning'],
      rating: 5,
      basePrice: 25.00,
      sizes: [
         { name: 'Small', price: 25.00, description: 'Light snack portion' },
         { name: 'Medium', price: 40.00, description: 'Regular portion' },
         { name: 'Large', price: 55.00, description: 'Sharing size' }
      ],
      nutritionInfo: {
         calories: '320 kcal',
         protein: '4g',
         carbs: '42g',
         fat: '15g'
      }
   },
   'chicken-shawarma': {
      id: 'chicken-shawarma',
      name: 'Chicken Shawarma',
      category: 'Popular Dishes',
      image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&h=600&fit=crop',
      description: 'Tender marinated chicken wrapped in warm pita bread with fresh vegetables and tahini sauce.',
      ingredients: ['Chicken', 'Pita Bread', 'Tahini', 'Lettuce', 'Tomatoes', 'Pickles', 'Garlic Sauce', 'Spices'],
      rating: 5,
      basePrice: 45.00,
      sizes: [
         { name: 'Regular', price: 45.00, description: 'One wrap' },
         { name: 'Large', price: 70.00, description: 'Double meat' },
         { name: 'Meal', price: 95.00, description: 'With fries and drink' }
      ],
      nutritionInfo: {
         calories: '520 kcal',
         protein: '32g',
         carbs: '45g',
         fat: '22g'
      },
      addOnsConfig: {
         showSpiceLevel: true,
         showDrinks: true,
         showDesserts: true,
         showExtras: true
      }
   },
   'fish-curry': {
      id: 'fish-curry',
      name: 'Fish Curry',
      category: 'Popular Dishes',
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&h=600&fit=crop',
      description: 'Aromatic fish curry cooked in traditional spices with coconut milk. Served with rice or naan.',
      ingredients: ['Fresh Fish', 'Coconut Milk', 'Curry Leaves', 'Turmeric', 'Ginger', 'Garlic', 'Tomatoes', 'Spices'],
      rating: 4,
      basePrice: 55.00,
      sizes: [
         { name: 'Regular', price: 55.00, description: 'One serving' },
         { name: 'Large', price: 85.00, description: 'Generous portion' }
      ],
      nutritionInfo: {
         calories: '420 kcal',
         protein: '35g',
         carbs: '28g',
         fat: '18g'
      },
      addOnsConfig: {
         showSpiceLevel: true,
         showDrinks: true,
         showDesserts: true,
         showExtras: true
      }
   },

   // ===== BREAKFAST =====
   'fluffy-pancakes': {
      id: 'fluffy-pancakes',
      name: 'Fluffy Pancakes',
      category: 'Breakfast',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop',
      description: 'Golden fluffy pancakes served with fresh berries and maple syrup. A perfect way to start your day.',
      ingredients: ['Flour', 'Eggs', 'Milk', 'Butter', 'Sugar', 'Baking Powder', 'Fresh Berries', 'Maple Syrup'],
      rating: 5,
      basePrice: 12.00,
      sizes: [
         { name: 'Stack of 3', price: 12.00, description: 'Light breakfast' },
         { name: 'Stack of 5', price: 18.00, description: 'Hearty breakfast' }
      ],
      nutritionInfo: {
         calories: '380 kcal',
         protein: '12g',
         carbs: '52g',
         fat: '14g'
      }
   },
   'fresh-croissant': {
      id: 'fresh-croissant',
      name: 'Fresh Croissant',
      category: 'Breakfast',
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=600&fit=crop',
      description: 'Buttery, flaky French pastry baked fresh daily. Light and airy with a golden crust.',
      ingredients: ['Butter', 'Flour', 'Milk', 'Yeast', 'Sugar', 'Salt', 'Eggs'],
      rating: 5,
      basePrice: 5.00,
      sizes: [
         { name: 'Single', price: 5.00, description: 'One croissant' },
         { name: '3 Pack', price: 12.00, description: 'Three croissants' }
      ],
      nutritionInfo: {
         calories: '250 kcal',
         protein: '5g',
         carbs: '28g',
         fat: '12g'
      }
   },
   'yogurt-parfait': {
      id: 'yogurt-parfait',
      name: 'Yogurt Parfait',
      category: 'Breakfast',
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=600&fit=crop',
      description: 'Layers of creamy Greek yogurt, fresh berries, granola, and honey. A healthy and delicious breakfast option.',
      ingredients: ['Greek Yogurt', 'Granola', 'Fresh Berries', 'Honey', 'Almonds'],
      rating: 4,
      basePrice: 8.00,
      sizes: [
         { name: 'Regular', price: 8.00, description: 'Standard portion' },
         { name: 'Large', price: 12.00, description: 'Extra fruit and granola' }
      ],
      nutritionInfo: {
         calories: '280 kcal',
         protein: '15g',
         carbs: '38g',
         fat: '8g'
      }
   },
   'classic-omelette': {
      id: 'classic-omelette',
      name: 'Classic Omelette',
      category: 'Breakfast',
      image: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=500&q=80',
      description: 'Three-egg omelette filled with cheese, vegetables, and herbs. Served with toast and hash browns.',
      ingredients: ['Eggs', 'Cheddar Cheese', 'Bell Peppers', 'Onions', 'Mushrooms', 'Herbs', 'Butter'],
      rating: 5,
      basePrice: 10.00,
      sizes: [
         { name: 'Regular', price: 10.00, description: 'Three eggs' },
         { name: 'Large', price: 14.00, description: 'Four eggs with extra fillings' }
      ],
      nutritionInfo: {
         calories: '340 kcal',
         protein: '22g',
         carbs: '12g',
         fat: '24g'
      }
   },
   'blueberry-muffin': {
      id: 'blueberry-muffin',
      name: 'Blueberry Muffin',
      category: 'Breakfast',
      image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=800&h=600&fit=crop',
      description: 'Moist blueberry muffins baked fresh daily with real blueberries and a sweet crumb topping.',
      ingredients: ['Flour', 'Fresh Blueberries', 'Sugar', 'Eggs', 'Butter', 'Vanilla', 'Streusel Topping'],
      rating: 5,
      basePrice: 4.00,
      sizes: [
         { name: 'Single', price: 4.00, description: 'One muffin' },
         { name: '4 Pack', price: 14.00, description: 'Four muffins' }
      ],
      nutritionInfo: {
         calories: '320 kcal',
         protein: '6g',
         carbs: '48g',
         fat: '12g'
      }
   },

   // ===== NOODLES =====
   'spicy-miso-ramen': {
      id: 'spicy-miso-ramen',
      name: 'Spicy Miso Ramen',
      category: 'Noodles',
      image: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=800&h=600&fit=crop',
      description: 'Rich miso broth with fresh ramen noodles, spicy chili oil, soft-boiled egg, and tender pork belly.',
      ingredients: ['Ramen Noodles', 'Miso Paste', 'Pork Belly', 'Soft-Boiled Egg', 'Green Onions', 'Nori', 'Chili Oil', 'Bamboo Shoots'],
      rating: 5,
      basePrice: 16.00,
      sizes: [
         { name: 'Regular', price: 16.00, description: 'Standard bowl' },
         { name: 'Large', price: 22.00, description: 'Extra noodles and toppings' }
      ],
      nutritionInfo: {
         calories: '580 kcal',
         protein: '28g',
         carbs: '68g',
         fat: '22g'
      },
      addOnsConfig: {
         showSpiceLevel: true,
         showDrinks: true,
         showDesserts: true,
         showExtras: true
      }
   },
   'shrimp-pad-thai': {
      id: 'shrimp-pad-thai',
      name: 'Shrimp Pad Thai',
      category: 'Noodles',
      image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&h=600&fit=crop',
      description: 'Classic Thai stir-fried rice noodles with shrimp, egg, peanuts, and tamarind sauce.',
      ingredients: ['Rice Noodles', 'Shrimp', 'Eggs', 'Peanuts', 'Bean Sprouts', 'Tamarind Sauce', 'Lime', 'Cilantro'],
      rating: 5,
      basePrice: 15.00,
      sizes: [
         { name: 'Regular', price: 15.00, description: 'Standard portion' },
         { name: 'Large', price: 21.00, description: 'Extra shrimp and noodles' }
      ],
      nutritionInfo: {
         calories: '520 kcal',
         protein: '24g',
         carbs: '72g',
         fat: '16g'
      },
      addOnsConfig: {
         showSpiceLevel: true,
         showDrinks: true,
         showDesserts: true,
         showExtras: true
      }
   },
   'beef-chow-mein': {
      id: 'beef-chow-mein',
      name: 'Beef Chow Mein',
      category: 'Noodles',
      image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&h=600&fit=crop',
      description: 'Stir-fried egg noodles with tender beef strips and crisp vegetables in savory sauce.',
      ingredients: ['Egg Noodles', 'Beef', 'Cabbage', 'Carrots', 'Bean Sprouts', 'Soy Sauce', 'Oyster Sauce', 'Sesame Oil'],
      rating: 4,
      basePrice: 14.00,
      sizes: [
         { name: 'Regular', price: 14.00, description: 'Standard serving' },
         { name: 'Large', price: 19.00, description: 'Extra beef and noodles' }
      ],
      nutritionInfo: {
         calories: '540 kcal',
         protein: '26g',
         carbs: '64g',
         fat: '20g'
      },
      addOnsConfig: {
         showSpiceLevel: true,
         showDrinks: true,
         showDesserts: true,
         showExtras: false
      }
   },
   'udon-noodle-soup': {
      id: 'udon-noodle-soup',
      name: 'Udon Noodle Soup',
      category: 'Noodles',
      image: 'https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?w=800&h=600&fit=crop',
      description: 'Thick udon noodles in a savory dashi broth with tempura shrimp and fresh vegetables.',
      ingredients: ['Udon Noodles', 'Dashi Broth', 'Tempura Shrimp', 'Green Onions', 'Mushrooms', 'Kamaboko', 'Nori'],
      rating: 4,
      basePrice: 13.00,
      sizes: [
         { name: 'Regular', price: 13.00, description: 'Standard bowl' },
         { name: 'Large', price: 18.00, description: 'Extra noodles' }
      ],
      nutritionInfo: {
         calories: '460 kcal',
         protein: '20g',
         carbs: '72g',
         fat: '10g'
      }
   },

   // ===== SALADS =====
   'chicken-caesar': {
      id: 'chicken-caesar',
      name: 'Chicken Caesar',
      category: 'Salads',
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&fit=crop',
      description: 'Crisp romaine lettuce with grilled chicken, parmesan cheese, croutons, and Caesar dressing.',
      ingredients: ['Romaine Lettuce', 'Grilled Chicken', 'Parmesan', 'Croutons', 'Caesar Dressing', 'Lemon'],
      rating: 5,
      basePrice: 11.00,
      sizes: [
         { name: 'Regular', price: 11.00, description: 'Side salad' },
         { name: 'Large', price: 16.00, description: 'Meal-sized portion' }
      ],
      nutritionInfo: {
         calories: '420 kcal',
         protein: '32g',
         carbs: '22g',
         fat: '24g'
      }
   },
   'greek-salad': {
      id: 'greek-salad',
      name: 'Greek Salad',
      category: 'Salads',
      image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop',
      description: 'Fresh tomatoes, cucumbers, olives, feta cheese, and red onions with olive oil and oregano.',
      ingredients: ['Tomatoes', 'Cucumbers', 'Feta Cheese', 'Kalamata Olives', 'Red Onion', 'Olive Oil', 'Oregano'],
      rating: 4,
      basePrice: 10.00,
      sizes: [
         { name: 'Regular', price: 10.00, description: 'Standard portion' },
         { name: 'Large', price: 14.00, description: 'Extra vegetables' }
      ],
      nutritionInfo: {
         calories: '280 kcal',
         protein: '8g',
         carbs: '18g',
         fat: '20g'
      }
   },
   'cobb-salad': {
      id: 'cobb-salad',
      name: 'Cobb Salad',
      category: 'Salads',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
      description: 'Chopped lettuce with chicken, bacon, hard-boiled eggs, avocado, tomatoes, and blue cheese.',
      ingredients: ['Mixed Lettuce', 'Grilled Chicken', 'Bacon', 'Avocado', 'Eggs', 'Tomatoes', 'Blue Cheese', 'Ranch Dressing'],
      rating: 5,
      basePrice: 13.00,
      sizes: [
         { name: 'Regular', price: 13.00, description: 'Standard serving' },
         { name: 'Large', price: 18.00, description: 'Extra protein' }
      ],
      nutritionInfo: {
         calories: '540 kcal',
         protein: '34g',
         carbs: '14g',
         fat: '38g'
      }
   },
   'quinoa-power-bowl': {
      id: 'quinoa-power-bowl',
      name: 'Quinoa Power Bowl',
      category: 'Salads',
      image: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=800&h=600&fit=crop',
      description: 'Protein-packed quinoa with roasted vegetables, chickpeas, avocado, and tahini dressing.',
      ingredients: ['Quinoa', 'Chickpeas', 'Roasted Vegetables', 'Avocado', 'Kale', 'Tahini Dressing', 'Pumpkin Seeds'],
      rating: 5,
      basePrice: 12.00,
      sizes: [
         { name: 'Regular', price: 12.00, description: 'Standard bowl' },
         { name: 'Large', price: 17.00, description: 'Extra quinoa and veggies' }
      ],
      nutritionInfo: {
         calories: '480 kcal',
         protein: '18g',
         carbs: '58g',
         fat: '22g'
      }
   },

   // ===== JAPANESE =====
   'sushi-platter': {
      id: 'sushi-platter',
      name: 'Sushi Platter',
      category: 'Japanese',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
      description: 'Assorted fresh sushi rolls and nigiri with wasabi, ginger, and soy sauce. Chef\'s selection.',
      ingredients: ['Sushi Rice', 'Fresh Fish', 'Nori', 'Avocado', 'Cucumber', 'Wasabi', 'Pickled Ginger', 'Soy Sauce'],
      rating: 5,
      basePrice: 24.00,
      sizes: [
         { name: 'Small', price: 24.00, description: '12 pieces' },
         { name: 'Medium', price: 38.00, description: '20 pieces' },
         { name: 'Large', price: 52.00, description: '30 pieces' }
      ],
      nutritionInfo: {
         calories: '420 kcal',
         protein: '28g',
         carbs: '52g',
         fat: '8g'
      }
   },
   'tempura-set': {
      id: 'tempura-set',
      name: 'Tempura Set',
      category: 'Japanese',
      image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&h=600&fit=crop',
      description: 'Crispy shrimp and vegetable tempura served with tempura sauce and steamed rice.',
      ingredients: ['Shrimp', 'Assorted Vegetables', 'Tempura Batter', 'Tempura Sauce', 'Daikon', 'Steamed Rice'],
      rating: 4,
      basePrice: 18.00,
      sizes: [
         { name: 'Regular', price: 18.00, description: '6 pieces' },
         { name: 'Large', price: 26.00, description: '10 pieces' }
      ],
      nutritionInfo: {
         calories: '520 kcal',
         protein: '22g',
         carbs: '64g',
         fat: '18g'
      }
   },
   'salmon-sashimi': {
      id: 'salmon-sashimi',
      name: 'Salmon Sashimi',
      category: 'Japanese',
      image: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=800&h=600&fit=crop',
      description: 'Fresh premium salmon sliced thin and served with wasabi, ginger, and soy sauce.',
      ingredients: ['Fresh Salmon', 'Wasabi', 'Pickled Ginger', 'Soy Sauce', 'Daikon Radish', 'Shiso Leaf'],
      rating: 5,
      basePrice: 20.00,
      sizes: [
         { name: 'Regular', price: 20.00, description: '8 pieces' },
         { name: 'Large', price: 32.00, description: '14 pieces' }
      ],
      nutritionInfo: {
         calories: '280 kcal',
         protein: '32g',
         carbs: '2g',
         fat: '16g'
      }
   },

   // ===== DRINKS =====
   'iced-latte': {
      id: 'iced-latte',
      name: 'Iced Latte',
      category: 'Drinks',
      image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&h=600&fit=crop',
      description: 'Smooth espresso with cold milk and ice. Perfectly refreshing coffee beverage.',
      ingredients: ['Espresso', 'Milk', 'Ice', 'Simple Syrup'],
      rating: 5,
      basePrice: 5.00,
      sizes: [
         { name: 'Small', price: 5.00, description: '12 oz' },
         { name: 'Medium', price: 6.50, description: '16 oz' },
         { name: 'Large', price: 7.50, description: '20 oz' }
      ],
      nutritionInfo: {
         calories: '120 kcal',
         protein: '6g',
         carbs: '14g',
         fat: '4g'
      }
   },
   'mint-mojito': {
      id: 'mint-mojito',
      name: 'Mint Mojito',
      category: 'Drinks',
      image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&h=600&fit=crop',
      description: 'Refreshing blend of fresh mint, lime, sugar, and soda water. Non-alcoholic.',
      ingredients: ['Fresh Mint', 'Lime Juice', 'Sugar', 'Soda Water', 'Ice', 'Lime Wedges'],
      rating: 5,
      basePrice: 6.00,
      sizes: [
         { name: 'Regular', price: 6.00, description: '12 oz' },
         { name: 'Large', price: 8.00, description: '16 oz' }
      ],
      nutritionInfo: {
         calories: '90 kcal',
         protein: '0g',
         carbs: '24g',
         fat: '0g'
      }
   },
   'berry-smoothie': {
      id: 'berry-smoothie',
      name: 'Berry Smoothie',
      category: 'Drinks',
      image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800&h=600&fit=crop',
      description: 'Thick and creamy smoothie with mixed berries, banana, and yogurt. Packed with antioxidants.',
      ingredients: ['Strawberries', 'Blueberries', 'Raspberries', 'Banana', 'Greek Yogurt', 'Honey', 'Ice'],
      rating: 5,
      basePrice: 7.00,
      sizes: [
         { name: 'Regular', price: 7.00, description: '16 oz' },
         { name: 'Large', price: 9.00, description: '20 oz' }
      ],
      nutritionInfo: {
         calories: '220 kcal',
         protein: '8g',
         carbs: '48g',
         fat: '2g'
      }
   },
   'fresh-juice': {
      id: 'fresh-juice',
      name: 'Fresh Juice',
      category: 'Drinks',
      image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&h=600&fit=crop',
      description: 'Freshly squeezed orange juice. No added sugar or preservatives. 100% natural.',
      ingredients: ['Fresh Oranges'],
      rating: 4,
      basePrice: 5.50,
      sizes: [
         { name: 'Small', price: 5.50, description: '8 oz' },
         { name: 'Medium', price: 7.00, description: '12 oz' },
         { name: 'Large', price: 8.50, description: '16 oz' }
      ],
      nutritionInfo: {
         calories: '110 kcal',
         protein: '2g',
         carbs: '26g',
         fat: '0g'
      }
   },

   // ===== LUNCH =====
   'classic-burger': {
      id: 'classic-burger',
      name: 'Classic Burger',
      category: 'Lunch',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
      description: 'Juicy beef burger with fresh vegetables, cheese, and our special sauce. Served in a toasted sesame bun.',
      ingredients: ['Beef Patty', 'Sesame Bun', 'Lettuce', 'Tomato', 'Onion', 'Cheese', 'Pickles', 'Special Sauce'],
      rating: 5,
      basePrice: 12.00,
      sizes: [
         { name: 'Single', price: 12.00, description: 'One patty' },
         { name: 'Double', price: 17.00, description: 'Two patties' },
         { name: 'Triple', price: 22.00, description: 'Three patties' }
      ],
      nutritionInfo: {
         calories: '580 kcal',
         protein: '28g',
         carbs: '48g',
         fat: '28g'
      },
      addOnsConfig: {
         showSpiceLevel: false,
         showDrinks: true,
         showDesserts: true,
         showExtras: true
      }
   },
   'club-sandwich': {
      id: 'club-sandwich',
      name: 'Club Sandwich',
      category: 'Lunch',
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&h=600&fit=crop',
      description: 'Triple-decker sandwich with turkey, bacon, lettuce, tomato, and mayo. Served with fries.',
      ingredients: ['Turkey', 'Bacon', 'Lettuce', 'Tomato', 'Cheese', 'Mayo', 'Toasted Bread'],
      rating: 4,
      basePrice: 11.00,
      sizes: [
         { name: 'Regular', price: 11.00, description: 'Standard sandwich' },
         { name: 'Large', price: 15.00, description: 'Extra meat and bacon' }
      ],
      nutritionInfo: {
         calories: '620 kcal',
         protein: '32g',
         carbs: '52g',
         fat: '32g'
      },
      addOnsConfig: {
         showSpiceLevel: false,
         showDrinks: true,
         showDesserts: true,
         showExtras: true
      }
   },
   'grilled-steak': {
      id: 'grilled-steak',
      name: 'Grilled Steak',
      category: 'Lunch',
      image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&h=600&fit=crop',
      description: 'Premium sirloin steak grilled to perfection. Served with mashed potatoes and seasonal vegetables.',
      ingredients: ['Sirloin Steak', 'Mashed Potatoes', 'Seasonal Vegetables', 'Garlic Butter', 'Herbs'],
      rating: 5,
      basePrice: 24.00,
      sizes: [
         { name: '8 oz', price: 24.00, description: 'Regular cut' },
         { name: '12 oz', price: 32.00, description: 'Large cut' },
         { name: '16 oz', price: 40.00, description: 'Extra large' }
      ],
      nutritionInfo: {
         calories: '640 kcal',
         protein: '52g',
         carbs: '32g',
         fat: '32g'
      },
      addOnsConfig: {
         showSpiceLevel: false,
         showDrinks: true,
         showDesserts: true,
         showExtras: true
      }
   },
   'creamy-pasta': {
      id: 'creamy-pasta',
      name: 'Creamy Pasta',
      category: 'Lunch',
      image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800&h=600&fit=crop',
      description: 'Fettuccine pasta in a rich Alfredo cream sauce with grilled chicken and parmesan.',
      ingredients: ['Fettuccine', 'Cream', 'Parmesan', 'Grilled Chicken', 'Garlic', 'Butter', 'Herbs'],
      rating: 5,
      basePrice: 14.00,
      sizes: [
         { name: 'Regular', price: 14.00, description: 'Standard portion' },
         { name: 'Large', price: 19.00, description: 'Extra pasta and chicken' }
      ],
      nutritionInfo: {
         calories: '720 kcal',
         protein: '32g',
         carbs: '68g',
         fat: '36g'
      },
      addOnsConfig: {
         showSpiceLevel: false,
         showDrinks: true,
         showDesserts: true,
         showExtras: true
      }
   }
};

// Default add-ons configuration for products that don't specify one
const defaultAddOnsConfig = {
   showSpiceLevel: false,
   showDrinks: true,
   showDesserts: true,
   showExtras: false
};

// Function to get product by ID with default addOnsConfig
export function getProductById(productId) {
   const product = productsData[productId];
   if (!product) return null;

   // Add default addOnsConfig if not specified
   return {
      ...product,
      addOnsConfig: product.addOnsConfig || defaultAddOnsConfig
   };
}

// Function to get products by category
export function getProductsByCategory(category) {
   return Object.values(productsData).filter(product => product.category === category);
}

// Function to get all products
export function getAllProducts() {
   return Object.values(productsData);
}

// Function to get all categories
export function getCategories() {
   const categories = new Set();
   Object.values(productsData).forEach(product => {
      categories.add(product.category);
   });
   return Array.from(categories);
}

// Export for use in other files
if (typeof window !== 'undefined') {
   window.productsData = productsData;
   window.getProductById = getProductById;
   window.getProductsByCategory = getProductsByCategory;
   window.getAllProducts = getAllProducts;
}

export default productsData;
