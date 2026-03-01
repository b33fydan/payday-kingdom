export const KINGDOM_COLOR_OPTIONS = [
  { id: 'red', label: 'Red', hex: '#dc2626' },
  { id: 'blue', label: 'Blue', hex: '#2563eb' },
  { id: 'green', label: 'Green', hex: '#16a34a' },
  { id: 'purple', label: 'Purple', hex: '#7c3aed' },
  { id: 'gold', label: 'Gold', hex: '#d4af37' },
  { id: 'black', label: 'Black', hex: '#111827' }
];

export const KINGDOM_COLOR_MAP = Object.fromEntries(KINGDOM_COLOR_OPTIONS.map((entry) => [entry.id, entry.hex]));

export function getBannerColorHex(colorId) {
  return KINGDOM_COLOR_MAP[String(colorId || 'gold')] ?? KINGDOM_COLOR_MAP.gold;
}
