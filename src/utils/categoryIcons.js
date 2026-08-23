import {
  Coffee, GlassWater, Flame, Cookie, CakeSlice, Soup, IceCreamCone,
  LayoutGrid, Package,
} from 'lucide-react';

/**
 * គ្មាន icon field មកពី backend category ទេ - ផ្គូផ្គងតាមឈ្មោះជា
 * keyword ជំនួសវិញ (មិនប៉ះពាល់ដល់ទិន្នន័យ គ្រាន់តែជា UX hint)។
 */
const KEYWORD_ICONS = [
  [['coffee', 'កាហ្វេ'], Coffee],
  [['beverage', 'drink', 'ភេសជ្ជៈ'], GlassWater],
  [['bbq', 'grill', ' អាំង'], Flame],
  [['snack', 'ខ្ញី'], Cookie],
  [['dessert', 'cake', 'ភ្ញាំ'], CakeSlice],
  [['soup', 'ស៊ុប'], Soup],
  [['ice', 'ក្រែម'], IceCreamCone],
];

export function getCategoryIcon(name) {
  if (!name) return LayoutGrid;
  const lower = name.toLowerCase();
  const match = KEYWORD_ICONS.find(([keywords]) =>
    keywords.some((k) => lower.includes(k))
  );
  return match ? match[1] : Package;
}

export const AllCategoriesIcon = LayoutGrid;
