import { FurColor, EyeColor, AccessoryId, FoodType, AccessoryMeta, DecorationMeta, RoomDecorationId } from '../types/index';

export const ACCESSORIES_CATALOG: AccessoryMeta[] = [
  { id: 'none', name: 'None', price: 0, type: 'bow' },
  { id: 'red_ribbon', name: 'Red Ribbon', price: 20, type: 'bow' },
  { id: 'pink_bow', name: 'Pink Bowtie', price: 25, type: 'bow' },
  { id: 'cool_shades', name: 'Cool Shades', price: 40, type: 'glasses' },
  { id: 'round_glasses', name: 'Round Specs', price: 35, type: 'glasses' },
  { id: 'party_hat', name: 'Party Cone', price: 30, type: 'hat' },
  { id: 'wizard_hat', name: 'Wizard Hat', price: 60, type: 'hat' },
  { id: 'cowboy_hat', name: 'Cowboy Hat', price: 55, type: 'hat' },
  { id: 'chef_hat', name: 'Chef Toque', price: 45, type: 'hat' },
  { id: 'knit_scarf', name: 'Knit Scarf', price: 50, type: 'scarf' },
  { id: 'crown', name: 'Royal Crown', price: 100, type: 'crown' },
];

export const DECORATIONS_CATALOG: DecorationMeta[] = [
  { id: 'cozy_plant', name: 'Potted Fern', price: 20, description: 'A lush little green friend for the windowsill.' },
  { id: 'yarn_basket', name: 'Yarn Basket', price: 30, description: 'Basket full of wool balls for playful paws.' },
  { id: 'scratching_post', name: 'Scratching Post', price: 45, description: 'Sturdy sisal rope post with a dangling mouse.' },
  { id: 'neon_fish', name: 'Neon Fish Sign', price: 75, description: 'Glows warmly on the wall with retro neon.' },
  { id: 'fairy_lights', name: 'Fairy Lights', price: 60, description: 'Twinkling lights strung along the room ceiling.' },
  { id: 'loft_cushion', name: 'Loft Perch', price: 90, description: 'Elevated luxury velvety cushion for cat naps.' },
];

export const FOOD_INFO: Record<FoodType, { name: string; icon: string; boost: number }> = {
  fish: { name: 'Fresh Salmon', icon: '🐟', boost: 20 },
  tuna_can: { name: 'Tuna Can', icon: '🥫', boost: 25 },
  milk: { name: 'Warm Milk', icon: '🥛', boost: 15 },
  biscuit: { name: 'Catnip Biscuit', icon: '🍪', boost: 20 },
  shrimp: { name: 'Juicy Shrimp', icon: '🦐', boost: 30 },
};

// Color palettes for 32x32 rendering
export function getCatColors(fur: FurColor, eye: EyeColor) {
  let main = '#27272a';
  let shadow = '#18181b';
  let highlight = '#3f3f46';
  let chest = '#f4f4f5';
  let stripe = '#18181b';
  let nose = '#fb7185';
  let ear = '#f472b6';

  switch (fur) {
    case 'orange':
      main = '#ea580c';
      shadow = '#c2410c';
      highlight = '#f97316';
      chest = '#fff7ed';
      stripe = '#9a3412';
      break;
    case 'black':
      main = '#27272a';
      shadow = '#09090b';
      highlight = '#3f3f46';
      chest = '#ffffff';
      stripe = '#18181b';
      break;
    case 'white':
      main = '#f8fafc';
      shadow = '#cbd5e1';
      highlight = '#ffffff';
      chest = '#ffffff';
      stripe = '#e2e8f0';
      break;
    case 'grey':
      main = '#64748b';
      shadow = '#475569';
      highlight = '#94a3b8';
      chest = '#f8fafc';
      stripe = '#334155';
      break;
    case 'calico':
      main = '#f8fafc'; // base white with patches
      shadow = '#cbd5e1';
      highlight = '#ffffff';
      chest = '#ffffff';
      stripe = '#ea580c'; // calico orange patch
      break;
    case 'siamese':
      main = '#ffedd5'; // cream body
      shadow = '#fed7aa';
      highlight = '#fff7ed';
      chest = '#fef3c7';
      stripe = '#451a03'; // dark points (mask, paws)
      break;
  }

  const eyeColorMap: Record<EyeColor, { left: string; right: string }> = {
    white: { left: '#ffffff', right: '#ffffff' },
    amber: { left: '#facc15', right: '#facc15' },
    emerald: { left: '#10b981', right: '#10b981' },
    blue: { left: '#38bdf8', right: '#38bdf8' },
    ruby: { left: '#f43f5e', right: '#f43f5e' },
    hetero: { left: '#ffffff', right: '#38bdf8' },
  };

  return {
    fur: { main, shadow, highlight, chest, stripe, nose, ear },
    eyes: eyeColorMap[eye] || eyeColorMap.amber,
  };
}

// Cute cat reactions when tapped
export const CAT_QUOTES = [
  "*purrrr* You're doing amazing today!",
  "Meow! Keep checking off those goals!",
  "*headbutts your hand* I believe in you!",
  "Mrow! Have you had some water recently?",
  "*happy tail swish* Another task done makes me so happy!",
  "Meow meow! Focus time is super power time!",
  "*kneads imaginary biscuit* Soft paws, strong willpower!",
  "Prrr... Thank you for caring for me!",
  "Meow! What's next on our cozy quest?",
];
