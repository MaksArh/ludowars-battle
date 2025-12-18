import { ShopItem, ItemCategory } from '@/types/shop';

export const SHOP_ITEMS: ShopItem[] = [
  // WEAPONS
  {
    id: 'pistol',
    name: 'Pistol',
    description: 'Standard sidearm. Reliable and accurate.',
    category: 'weapons',
    price: 0,
    rarity: 'common',
    isDefault: true,
    stats: { damage: 20, fireRate: 3, magazineSize: 12 },
  },
  {
    id: 'shotgun',
    name: 'Shotgun',
    description: 'Devastating at close range. Spreads 6 pellets.',
    category: 'weapons',
    price: 500,
    rarity: 'uncommon',
    stats: { damage: 15, fireRate: 1, magazineSize: 6 },
  },
  {
    id: 'assault_rifle',
    name: 'Assault Rifle',
    description: 'Full-auto. High fire rate, moderate damage.',
    category: 'weapons',
    price: 800,
    rarity: 'rare',
    stats: { damage: 18, fireRate: 8, magazineSize: 30 },
  },

  // ARMOR
  {
    id: 'light_armor',
    name: 'Light Armor',
    description: 'Basic protection. No movement penalty.',
    category: 'armor',
    price: 0,
    rarity: 'common',
    isDefault: true,
    stats: { defense: 10, speedModifier: 1.0 },
  },
  {
    id: 'medium_armor',
    name: 'Medium Armor',
    description: 'Balanced protection and mobility.',
    category: 'armor',
    price: 400,
    rarity: 'uncommon',
    stats: { defense: 25, speedModifier: 0.9 },
  },
  {
    id: 'heavy_armor',
    name: 'Heavy Armor',
    description: 'Maximum protection. Reduced speed.',
    category: 'armor',
    price: 700,
    rarity: 'rare',
    stats: { defense: 40, speedModifier: 0.75 },
  },

  // PERKS
  {
    id: 'perk_fast_reload',
    name: 'Fast Hands',
    description: 'Reload 30% faster.',
    category: 'perks',
    price: 300,
    rarity: 'uncommon',
    perkEffect: 'reload_speed_+30%',
  },
  {
    id: 'perk_extra_ammo',
    name: 'Deep Pockets',
    description: '+50% magazine size.',
    category: 'perks',
    price: 350,
    rarity: 'uncommon',
    perkEffect: 'magazine_size_+50%',
  },
  {
    id: 'perk_health_regen',
    name: 'Regeneration',
    description: 'Slowly regenerate HP when not taking damage.',
    category: 'perks',
    price: 600,
    rarity: 'rare',
    perkEffect: 'hp_regen_5_per_sec',
  },

  // ROULETTE PERKS - Lucky (increase chance of matching symbols)
  {
    id: 'perk_lucky_1',
    name: 'Lucky I',
    description: '+5% chance to get matching roulette symbols.',
    category: 'perks',
    price: 1000,
    rarity: 'uncommon',
    perkEffect: 'roulette_luck_5',
  },
  {
    id: 'perk_lucky_2',
    name: 'Lucky II',
    description: '+10% chance to get matching roulette symbols.',
    category: 'perks',
    price: 2500,
    rarity: 'rare',
    perkEffect: 'roulette_luck_10',
  },
  {
    id: 'perk_lucky_3',
    name: 'Lucky III',
    description: '+15% chance to get matching roulette symbols.',
    category: 'perks',
    price: 5000,
    rarity: 'epic',
    perkEffect: 'roulette_luck_15',
  },

  // ROULETTE PERKS - Fixers (fix specific symbol on specific barrel)
  // Barrel 1
  {
    id: 'perk_fixer_1_damage',
    name: 'Damage Fixer I',
    description: 'Roulette barrel 1 always shows ⚔️ Damage.',
    category: 'perks',
    price: 3000,
    rarity: 'rare',
    perkEffect: 'roulette_fix_1_damage',
  },
  {
    id: 'perk_fixer_1_heal',
    name: 'Heal Fixer I',
    description: 'Roulette barrel 1 always shows ❤️ Heal.',
    category: 'perks',
    price: 3000,
    rarity: 'rare',
    perkEffect: 'roulette_fix_1_heal',
  },
  {
    id: 'perk_fixer_1_shield',
    name: 'Shield Fixer I',
    description: 'Roulette barrel 1 always shows 🛡️ Shield.',
    category: 'perks',
    price: 3000,
    rarity: 'rare',
    perkEffect: 'roulette_fix_1_shield',
  },
  // Barrel 2
  {
    id: 'perk_fixer_2_damage',
    name: 'Damage Fixer II',
    description: 'Roulette barrel 2 always shows ⚔️ Damage.',
    category: 'perks',
    price: 3000,
    rarity: 'rare',
    perkEffect: 'roulette_fix_2_damage',
  },
  {
    id: 'perk_fixer_2_heal',
    name: 'Heal Fixer II',
    description: 'Roulette barrel 2 always shows ❤️ Heal.',
    category: 'perks',
    price: 3000,
    rarity: 'rare',
    perkEffect: 'roulette_fix_2_heal',
  },
  {
    id: 'perk_fixer_2_shield',
    name: 'Shield Fixer II',
    description: 'Roulette barrel 2 always shows 🛡️ Shield.',
    category: 'perks',
    price: 3000,
    rarity: 'rare',
    perkEffect: 'roulette_fix_2_shield',
  },
  // Barrel 3
  {
    id: 'perk_fixer_3_damage',
    name: 'Damage Fixer III',
    description: 'Roulette barrel 3 always shows ⚔️ Damage.',
    category: 'perks',
    price: 3000,
    rarity: 'rare',
    perkEffect: 'roulette_fix_3_damage',
  },
  {
    id: 'perk_fixer_3_heal',
    name: 'Heal Fixer III',
    description: 'Roulette barrel 3 always shows ❤️ Heal.',
    category: 'perks',
    price: 3000,
    rarity: 'rare',
    perkEffect: 'roulette_fix_3_heal',
  },
  {
    id: 'perk_fixer_3_shield',
    name: 'Shield Fixer III',
    description: 'Roulette barrel 3 always shows 🛡️ Shield.',
    category: 'perks',
    price: 3000,
    rarity: 'rare',
    perkEffect: 'roulette_fix_3_shield',
  },

  // COSMETICS
  {
    id: 'skin_red',
    name: 'Red Player',
    description: 'Crimson color scheme.',
    category: 'cosmetics',
    price: 100,
    rarity: 'common',
  },
  {
    id: 'skin_blue',
    name: 'Blue Player',
    description: 'Ocean color scheme.',
    category: 'cosmetics',
    price: 100,
    rarity: 'common',
  },
  {
    id: 'skin_gold',
    name: 'Golden Player',
    description: 'Luxurious gold finish.',
    category: 'cosmetics',
    price: 1000,
    rarity: 'epic',
  },
];

export const getItemById = (id: string) => SHOP_ITEMS.find((item) => item.id === id);

export const getItemsByCategory = (category: ItemCategory) =>
  SHOP_ITEMS.filter((item) => item.category === category);

export const getDefaultItems = () =>
  SHOP_ITEMS.filter((item) => item.isDefault).map((item) => item.id);


