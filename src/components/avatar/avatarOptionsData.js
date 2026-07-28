// 12-15 Realistic skin tones inclusive for Indian and global skin tones
export const SKIN_TONES = [
  { id: 'skin_1', name: 'Fair Warm', hex: '#FFE0BD', shadow: '#EBB48C' },
  { id: 'skin_2', name: 'Fair Rose', hex: '#FAD6C0', shadow: '#E4A386' },
  { id: 'skin_3', name: 'Golden Ivory', hex: '#F3CBB0', shadow: '#D69B7C' },
  { id: 'skin_4', name: 'Warm Wheat', hex: '#EAB896', shadow: '#CD8B65' },
  { id: 'skin_5', name: 'Indian Wheatish', hex: '#E2A77F', shadow: '#C27A50' },
  { id: 'skin_6', name: 'Honey Tan', hex: '#D79469', shadow: '#B26E43' },
  { id: 'skin_7', name: 'Golden Bronze', hex: '#C68253', shadow: '#9D5E31' },
  { id: 'skin_8', name: 'Deep Tan', hex: '#B57041', shadow: '#8B4D22' },
  { id: 'skin_9', name: 'Rich Caramel', hex: '#A25F34', shadow: '#7B3F18' },
  { id: 'skin_10', name: 'Warm Brown', hex: '#8F4E27', shadow: '#683311' },
  { id: 'skin_11', name: 'Deep Espresso', hex: '#773B1B', shadow: '#52230B' },
  { id: 'skin_12', name: 'Obsidian Earth', hex: '#58270E', shadow: '#391404' },
];

export const FACE_SHAPES = [
  { id: 'round', name: 'Round' },
  { id: 'oval', name: 'Oval' },
  { id: 'square', name: 'Square' },
  { id: 'heart', name: 'Heart' },
  { id: 'diamond', name: 'Diamond' },
];

export const HAIR_STYLES = [
  { id: 'buzz_cut', name: 'Buzz Cut', category: 'short' },
  { id: 'short_crop', name: 'Short Crop', category: 'short' },
  { id: 'fade_cut', name: 'Sleek Fade', category: 'short' },
  { id: 'curly_top', name: 'Curly Top', category: 'curly' },
  { id: 'quiff', name: 'Modern Quiff', category: 'short' },
  { id: 'wavy_medium', name: 'Wavy Medium', category: 'wavy' },
  { id: 'classic_bob', name: 'Classic Bob', category: 'long' },
  { id: 'long_waves', name: 'Long Waves', category: 'long' },
  { id: 'sleek_ponytail', name: 'Ponytail', category: 'long' },
  { id: 'top_bun', name: 'High Bun', category: 'long' },
  { id: 'boho_braids', name: 'Boho Braids', category: 'long' },
  { id: 'dreads', name: 'Short Locs', category: 'curly' },
  { id: 'bald', name: 'Bald', category: 'short' },
];

export const HAIR_COLORS = [
  { id: 'black', name: 'Jet Black', hex: '#1C1917' },
  { id: 'dark_brown', name: 'Dark Brown', hex: '#3B2314' },
  { id: 'brown', name: 'Medium Brown', hex: '#5C3820' },
  { id: 'light_brown', name: 'Light Brown', hex: '#8D5B36' },
  { id: 'gray', name: 'Silver Gray', hex: '#9CA3AF' },
  { id: 'blonde', name: 'Golden Blonde', hex: '#D97706' },
];

export const EYE_SHAPES = [
  { id: 'normal', name: 'Normal' },
  { id: 'small', name: 'Compact' },
  { id: 'large', name: 'Expressive' },
  { id: 'almond', name: 'Almond' },
];

export const EYEBROWS = [
  { id: 'straight', name: 'Straight Natural' },
  { id: 'arched', name: 'Defined Arch' },
  { id: 'thick', name: 'Bold Thick' },
  { id: 'soft', name: 'Soft Curve' },
];

export const NOSE_SHAPES = [
  { id: 'normal', name: 'Standard' },
  { id: 'button', name: 'Button' },
  { id: 'wide', name: 'Wide' },
  { id: 'sharp', name: 'Sharp' },
];

export const MOUTH_EXPRESSIONS = [
  { id: 'soft_smile', name: 'Soft Smile' },
  { id: 'wide_grin', name: 'Wide Grin' },
  { id: 'neutral', name: 'Calm Neutral' },
  { id: 'confident', name: 'Confident Smirk' },
];

export const FACIAL_HAIR = [
  { id: 'clean', name: 'Clean Shave' },
  { id: 'stubble', name: 'Light Stubble' },
  { id: 'mustache', name: 'Mustache' },
  { id: 'light_beard', name: 'Light Beard' },
  { id: 'full_beard', name: 'Full Beard' },
];

export const GLASSES = [
  { id: 'none', name: 'None', icon: '👤' },
  { id: 'round', name: 'Round Intellect', icon: '👓' },
  { id: 'square', name: 'Square Modern', icon: '🤓' },
  { id: 'aviator', name: 'Aviator Shades', icon: '🕶️' },
  { id: 'cat_eye', name: 'Cat-Eye', icon: '🕶️' },
  { id: 'visor', name: 'Cyber Visor', icon: '🥽' },
];

export const ACCESSORIES = [
  { id: 'none', name: 'None', symbol: '' },
  { id: 'headphones', name: 'Beats Headphones', symbol: '🎧' },
  { id: 'cap', name: 'Snapback Cap', symbol: '🧢' },
  { id: 'beanie', name: 'Winter Beanie', symbol: '🧶' },
  { id: 'crown', name: 'Royal Crown', symbol: '👑' },
  { id: 'sparkles', name: 'Aura Sparkles', symbol: '✨' },
];

export const OUTFITS = [
  { id: 'hoodie', name: 'Cozy Hoodie', icon: '🧥' },
  { id: 'tshirt', name: 'Casual T-Shirt', icon: '👕' },
  { id: 'jacket', name: 'Streetwear Jacket', icon: '🧥' },
  { id: 'kurta', name: 'Ethnic Kurta', icon: '👘' },
  { id: 'blazer', name: 'Formal Blazer', icon: '👔' },
  { id: 'sportswear', name: 'Athletic Jersey', icon: '🎽' },
];

export const OUTFIT_COLORS = [
  { id: 'plum', name: 'Deep Plum', hex: '#6F405F' },
  { id: 'teal', name: 'Deep Teal', hex: '#3F7772' },
  { id: 'charcoal', name: 'Charcoal Black', hex: '#2D1D15' },
  { id: 'amber', name: 'Golden Amber', hex: '#E5A93C' },
  { id: 'terracotta', name: 'Terracotta Red', hex: '#D96C3D' },
  { id: 'navy', name: 'Midnight Navy', hex: '#1E293B' },
];

export const DEFAULT_AVATAR_CONFIG = {
  face: 'round',
  skinTone: 'skin_5',
  hair: 'short_crop',
  hairColor: 'black',
  eyes: 'normal',
  eyebrows: 'straight',
  nose: 'normal',
  mouth: 'soft_smile',
  facialHair: 'clean',
  glasses: 'none',
  accessories: 'none',
  outfit: 'hoodie',
  outfitColor: 'plum',
};

export function generateRandomAvatar() {
  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
  return {
    face: getRandom(FACE_SHAPES).id,
    skinTone: getRandom(SKIN_TONES).id,
    hair: getRandom(HAIR_STYLES).id,
    hairColor: getRandom(HAIR_COLORS).id,
    eyes: getRandom(EYE_SHAPES).id,
    eyebrows: getRandom(EYEBROWS).id,
    nose: getRandom(NOSE_SHAPES).id,
    mouth: getRandom(MOUTH_EXPRESSIONS).id,
    facialHair: getRandom(FACIAL_HAIR).id,
    glasses: getRandom(GLASSES).id,
    accessories: getRandom(ACCESSORIES).id,
    outfit: getRandom(OUTFITS).id,
    outfitColor: getRandom(OUTFIT_COLORS).id,
  };
}
