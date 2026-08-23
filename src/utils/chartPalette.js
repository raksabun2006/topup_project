/**
 * ក្រុមពណ៌ categorical ដែលបានឆ្លងកាត់ការ validate (CVD/normal-vision ΔE,
 * chroma/lightness band) សម្រាប់ adjacent series (pie/stack/bar) - លំដាប់
 * ថេរ កុំប្តូរ។ ពណ៌ "ផ្សេងៗ" ប្រើ slate ដាច់ដោយឡែក (មិនមែន categorical hue)
 * ដើម្បីបញ្ជាក់ថាវាជា bucket សេសសល់ មិនមែនប្រភេទពិតទេ។
 */
export const CATEGORICAL_PALETTE = [
  '#2a78d6', // blue
  '#eb6834', // orange
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#e87ba4', // magenta
  '#008300', // green
];

export const OTHER_SLICE_COLOR = '#94a3b8';
export const OTHER_SLICE_LABEL = 'ផ្សេងៗ';

/** ជ្រើសពណ៌អក្សរ (ស/ខ្មៅ) តាម luminance របស់ពណ៌ផ្ទៃ ដើម្បីធានា contrast ជានិច្ច */
export function readableTextOn(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#0b0b0b' : '#ffffff';
}
