/**
 * Backend game model មានតែ { id, code, name, description, imageUrl } -
 * គ្មាន category/platform/product-type/popular field ទេ។ Map នេះបន្ថែម
 * ព័ត៌មានបង្ហាញ (category, product label, popular badge) សម្រាប់ហ្គេម
 * ដែលស្គាល់ ដោយផ្គូផ្គងលើ code ឬ name។ ហ្គេមណាមិនស្គាល់ធ្លាក់ទៅលំនាំដើម
 * ដូច្នេះ admin អាចបន្ថែមហ្គេមថ្មីដោយមិនបាច់ break UI។
 */
const KNOWN_GAMES = [
  { match: /mobile\s*legends|mlbb/i, category: 'mobile', tag: 'MOBA', product: 'Diamonds', popular: true },
  { match: /pubg/i, category: 'mobile', tag: 'Battle Royale', product: 'UC', popular: true },
  { match: /e-?football|efootball|pes\b/i, category: 'mobile', tag: 'Football', product: 'Coins', popular: false },
  { match: /free\s*fire/i, category: 'mobile', tag: 'Battle Royale', product: 'Diamonds', popular: true },
  { match: /clash of clans|\bcoc\b/i, category: 'mobile', tag: 'Strategy', product: 'Gems', popular: false },
  { match: /\bgta\b|grand theft auto/i, category: 'console', tag: 'Action', product: 'Game', popular: false },
  { match: /valorant/i, category: 'pc', tag: 'FPS', product: 'VP', popular: true },
  { match: /genshin/i, category: 'mobile', tag: 'RPG', product: 'Crystals', popular: true },
  { match: /call of duty|\bcod\b/i, category: 'mobile', tag: 'FPS', product: 'CP', popular: false },
  { match: /league of legends|\blol\b/i, category: 'pc', tag: 'MOBA', product: 'RP', popular: false },
];

const DEFAULT_META = { category: 'mobile', tag: null, product: null, popular: false };

export function getGameMeta(game) {
  const haystack = `${game?.name ?? ''} ${game?.code ?? ''}`;
  const found = KNOWN_GAMES.find((entry) => entry.match.test(haystack));
  return found ?? DEFAULT_META;
}

export const GAME_CATEGORIES = [
  { id: 'all', name: 'ហ្គេមទាំងអស់' },
  { id: 'mobile', name: 'Mobile' },
  { id: 'pc', name: 'PC' },
  { id: 'console', name: 'Console' },
  { id: 'popular', name: 'Popular' },
];

export const CATEGORY_LABELS = { mobile: 'Mobile', pc: 'PC', console: 'Console' };
