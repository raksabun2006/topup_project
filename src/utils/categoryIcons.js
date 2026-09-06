import {
  Coffee, GlassWater, Flame, Cookie, CakeSlice, Soup, IceCreamCone,
  LayoutGrid, Package, Smartphone, Laptop, Tv, Shirt, Footprints,
  Sparkles, Home, UtensilsCrossed, ShoppingBasket, HeartPulse, Dumbbell,
  Gamepad2, BookOpen, Baby, Car, PawPrint, Watch, MoreHorizontal,
  Apple, Carrot, Salad, Fish, Beef, Drumstick, Egg, Milk, Wheat,
  Snowflake, Award, Store, Candy, Heart
} from 'lucide-react';

/**
 * Keyword-to-icon mapping for all store and supermarket categories.
 */
const KEYWORD_ICONS = [
  // Tech & Gadgets
  [['mobile', 'phone', 'ទូរស័ព្ទ'], Smartphone],
  [['computer', 'laptop', 'កុំព្យូទ័រ'], Laptop],
  [['electronic', 'gadget', 'ឧបករណ៍អេឡិចត្រូនិច'], Tv],
  [['accessor', 'watch', 'jewelry', 'គ្រឿងតុបតែង', 'នាឡិកា'], Watch],

  // Fashion & Beauty
  [['shoe', 'sneaker', 'boot', 'ស្បែកជើង'], Footprints],
  [['fashion', 'cloth', 'shirt', 'dress', 'jean', 'pant', 'សម្លៀកបំពាក់', 'អាវ', 'ខោ'], Shirt],
  [['beauty', 'personal care', 'skincare', 'cosmetic', 'សម្រស់', 'ស្បែក', 'មុខ', 'ឡេ'], Sparkles],
  [['health', 'wellness', 'medical', 'pharmacy', 'សុខភាព', 'ថ្នាំ', 'វីតាមីន'], HeartPulse],

  // Fresh & Groceries
  [['vegetable', 'fruit', 'produce', 'បន្លែ', 'ផ្លែឈើ', 'សាលាដ'], Apple],
  [['meat', 'seafood', 'fish', 'beef', 'pork', 'chicken', 'poultry', 'សាច់', 'ត្រី', 'គ្រឿងសមុទ្រ', 'បង្គា', 'ក្តាម'], Fish],
  [['dairy', 'milk', 'egg', 'cheese', 'butter', 'yogurt', 'ទឹកដោះគោ', 'ទឹកដោះគោជូរ', 'ស៊ុត', 'ពង'], Milk],
  [['rice', 'noodle', 'pasta', 'dried', 'grain', 'flour', 'អង្ករ', 'មី', 'ប៉ាស្តា', 'មី និងប៉ាស្តា', 'គ្រាប់ធញ្ញជាតិ'], Wheat],
  [['frozen', 'freeze', 'ត្រជាក់', 'កក'], Snowflake],
  [['grocer', 'staple', 'supermarket', 'ទំនិញ', 'គ្រឿងទេសទូទៅ'], ShoppingBasket],
  [['seasoning', 'spice', 'sauce', 'condiment', 'oil', 'គ្រឿងផ្សំ', 'គ្រឿងផ្សំចម្អិនអាហារ', 'ទឹកត្រី', 'ទឹកស៊ីអ៊ីវ'], UtensilsCrossed],

  // Snacks & Drinks
  [['beverage', 'drink', 'juice', 'soda', 'water', 'ភេសជ្ជៈ', 'ទឹក', 'ទឹកក្រូច'], GlassWater],
  [['coffee', 'tea', 'cafe', 'កាហ្វេ', 'តែ'], Coffee],
  [['snack', 'sweet', 'chips', 'crisp', 'នំ', 'អាហារសម្រន់', 'ស្ករគ្រាប់', 'ខ្ញី'], Cookie],
  [['dessert', 'cake', 'bakery', 'bread', 'នំប៉័ង', 'បង្អែម', 'ខេក'], CakeSlice],
  [['bbq', 'grill', 'roast', 'អាំង', 'ដុត'], Flame],
  [['soup', 'stew', 'broth', 'ស៊ុប', 'សម្ល'], Soup],
  [['ice cream', 'gelato', 'ការ៉េម', 'ក្រែម'], IceCreamCone],

  // Home, Living & Kitchen
  [['kitchen', 'dining', 'cookware', 'dish', 'ចង្ក្រាន', 'ផ្ទះបាយ', 'ចាន'], UtensilsCrossed],
  [['household', 'cleaning', 'laundry', 'home', 'living', 'furniture', 'ផ្ទះ', 'សម្ភារៈប្រើប្រាស់', 'សម្អាត'], Home],

  // Lifestyle, Kids, Pets, Sports
  [['sport', 'fitness', 'gym', 'workout', 'កីឡា', 'ហាត់ប្រាណ'], Dumbbell],
  [['toy', 'game', 'play', 'ល្បែង', 'ក្មេងលេង', 'តុក្កតា'], Gamepad2],
  [['book', 'stationery', 'paper', 'pen', 'សៀវភៅ', 'សម្ភារៈសិក្សា', 'ប៊ិច'], BookOpen],
  [['baby', 'kid', 'infant', 'toddler', 'ទារក', 'កុមារ', 'កូនក្មេង'], Baby],
  [['automotive', 'auto', 'car', 'motor', 'bike', 'យានយន្ត', 'ឡាន', 'ម៉ូតូ'], Car],
  [['pet', 'dog', 'cat', 'animal', 'សត្វ', 'ចំណីសត្វ'], PawPrint],
  [['local', 'khmer', 'cambodia', 'ផលិតផលខ្មែរ', 'ក្នុងស្រុក', 'ខ្មែរ'], Award],

  // Fallback
  [['other', 'ផ្សេងៗ'], MoreHorizontal],
];

export function getCategoryIcon(name) {
  if (!name) return LayoutGrid;
  const lower = String(name).toLowerCase().trim();
  const match = KEYWORD_ICONS.find(([keywords]) =>
    keywords.some((k) => lower.includes(k))
  );
  return match ? match[1] : Package;
}

export const AllCategoriesIcon = LayoutGrid;

/**
 * Returns dynamic, harmonized color tokens (bg, border, badge, price, discount, glow, button)
 * based on the product category or fallback slot.
 */
export function getCategoryTheme(name, fallbackSlot = 0) {
  const lower = String(name || '').toLowerCase().trim();

  // Beverages & Drinks
  if (lower.includes('beverage') || lower.includes('drink') || lower.includes('juice') || lower.includes('soda') || lower.includes('water') || lower.includes('ភេសជ្ជៈ') || lower.includes('ទឹក')) {
    return {
      cardBg: 'bg-[#EFF8FF] dark:bg-sky-950/30',
      border: 'border-sky-200/80 dark:border-sky-800/50',
      badgeText: 'text-sky-700 dark:text-sky-300',
      badgeBg: 'bg-sky-100/90 dark:bg-sky-900/50',
      priceColor: 'text-sky-600 dark:text-sky-400',
      discountBg: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300',
      glow: 'bg-sky-200/40 dark:bg-sky-900/20',
      buttonBg: 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-500/25',
    };
  }

  // Groceries, Rice, Staples, Grains
  if (lower.includes('grocer') || lower.includes('rice') || lower.includes('grain') || lower.includes('staple') || lower.includes('អង្ករ') || lower.includes('គ្រឿងទេស')) {
    return {
      cardBg: 'bg-[#FFFDF0] dark:bg-amber-950/25',
      border: 'border-amber-200/80 dark:border-amber-800/50',
      badgeText: 'text-amber-800 dark:text-amber-300',
      badgeBg: 'bg-amber-100/90 dark:bg-amber-900/50',
      priceColor: 'text-amber-700 dark:text-amber-400',
      discountBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
      glow: 'bg-amber-200/40 dark:bg-amber-900/20',
      buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/25',
    };
  }

  // Dairy, Milk, Yogurt, Eggs
  if (lower.includes('dairy') || lower.includes('milk') || lower.includes('egg') || lower.includes('yogurt') || lower.includes('ទឹកដោះគោ')) {
    return {
      cardBg: 'bg-[#F0FDF9] dark:bg-teal-950/30',
      border: 'border-teal-200/80 dark:border-teal-800/50',
      badgeText: 'text-teal-800 dark:text-teal-300',
      badgeBg: 'bg-teal-100/90 dark:bg-teal-900/50',
      priceColor: 'text-teal-700 dark:text-teal-400',
      discountBg: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300',
      glow: 'bg-teal-200/40 dark:bg-teal-900/20',
      buttonBg: 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/25',
    };
  }

  // Vegetables, Fruits, Fresh Produce
  if (lower.includes('vegetable') || lower.includes('fruit') || lower.includes('fresh') || lower.includes('produce') || lower.includes('បន្លែ') || lower.includes('ផ្លែឈើ')) {
    return {
      cardBg: 'bg-[#F0FDF4] dark:bg-emerald-950/25',
      border: 'border-emerald-200/80 dark:border-emerald-800/50',
      badgeText: 'text-emerald-800 dark:text-emerald-300',
      badgeBg: 'bg-emerald-100/90 dark:bg-emerald-900/50',
      priceColor: 'text-emerald-700 dark:text-emerald-400',
      discountBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
      glow: 'bg-emerald-200/40 dark:bg-emerald-900/20',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25',
    };
  }

  // Meat, Seafood, Snacks, Sweets, Bakery
  if (lower.includes('meat') || lower.includes('seafood') || lower.includes('snack') || lower.includes('sweet') || lower.includes('សាច់') || lower.includes('នំ')) {
    return {
      cardBg: 'bg-[#FFF1F2] dark:bg-rose-950/25',
      border: 'border-rose-200/80 dark:border-rose-800/50',
      badgeText: 'text-rose-800 dark:text-rose-300',
      badgeBg: 'bg-rose-100/90 dark:bg-rose-900/50',
      priceColor: 'text-rose-600 dark:text-rose-400',
      discountBg: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
      glow: 'bg-rose-200/40 dark:bg-rose-900/20',
      buttonBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/25',
    };
  }

  // Tech, Gadgets, Phones, Electronics, Accessories
  if (lower.includes('electronic') || lower.includes('mobile') || lower.includes('phone') || lower.includes('laptop') || lower.includes('computer') || lower.includes('accessor') || lower.includes('watch') || lower.includes('ឧបករណ៍')) {
    return {
      cardBg: 'bg-[#F4F0FF] dark:bg-purple-950/30',
      border: 'border-purple-200/80 dark:border-purple-800/50',
      badgeText: 'text-purple-800 dark:text-purple-300',
      badgeBg: 'bg-purple-100/90 dark:bg-purple-900/50',
      priceColor: 'text-purple-700 dark:text-purple-400',
      discountBg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
      glow: 'bg-purple-200/40 dark:bg-purple-900/20',
      buttonBg: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/25',
    };
  }

  // Slot fallbacks
  const slotFallbacks = [
    {
      cardBg: 'bg-[#F0FDF4] dark:bg-slate-900',
      border: 'border-emerald-200/80 dark:border-slate-800',
      badgeText: 'text-emerald-800 dark:text-emerald-300',
      badgeBg: 'bg-emerald-100/90 dark:bg-emerald-950/50',
      priceColor: 'text-emerald-700 dark:text-emerald-400',
      discountBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
      glow: 'bg-emerald-200/40 dark:bg-emerald-900/20',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25',
    },
    {
      cardBg: 'bg-[#F4F0FF] dark:bg-purple-950/30',
      border: 'border-purple-200/80 dark:border-purple-900/40',
      badgeText: 'text-purple-800 dark:text-purple-300',
      badgeBg: 'bg-purple-100/90 dark:bg-purple-900/50',
      priceColor: 'text-purple-700 dark:text-purple-400',
      discountBg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300',
      glow: 'bg-purple-200/40 dark:bg-purple-900/20',
      buttonBg: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/25',
    },
    {
      cardBg: 'bg-[#EFF8FF] dark:bg-sky-950/30',
      border: 'border-sky-200/80 dark:border-sky-900/40',
      badgeText: 'text-sky-800 dark:text-sky-300',
      badgeBg: 'bg-sky-100/90 dark:bg-sky-900/50',
      priceColor: 'text-sky-700 dark:text-sky-400',
      discountBg: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300',
      glow: 'bg-sky-200/40 dark:bg-sky-900/20',
      buttonBg: 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-500/25',
    },
    {
      cardBg: 'bg-[#FFFDF0] dark:bg-amber-950/25',
      border: 'border-amber-200/80 dark:border-amber-900/30',
      badgeText: 'text-amber-800 dark:text-amber-300',
      badgeBg: 'bg-amber-100/90 dark:bg-amber-900/50',
      priceColor: 'text-amber-700 dark:text-amber-400',
      discountBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
      glow: 'bg-amber-200/40 dark:bg-amber-900/20',
      buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/25',
    },
    {
      cardBg: 'bg-[#FFF0F0] dark:bg-rose-950/25',
      border: 'border-rose-200/80 dark:border-rose-900/30',
      badgeText: 'text-rose-800 dark:text-rose-300',
      badgeBg: 'bg-rose-100/90 dark:bg-rose-900/50',
      priceColor: 'text-rose-600 dark:text-rose-400',
      discountBg: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
      glow: 'bg-rose-200/40 dark:bg-rose-900/20',
      buttonBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/25',
    },
  ];

  return slotFallbacks[fallbackSlot % slotFallbacks.length];
}

