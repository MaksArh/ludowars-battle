export type ItemCategory = 'weapons' | 'armor' | 'perks' | 'cosmetics';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic';

export interface ItemStats {
  damage?: number;
  fireRate?: number;
  magazineSize?: number;
  defense?: number;
  speedModifier?: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  price: number;
  rarity: ItemRarity;
  stats?: ItemStats;
  perkEffect?: string;
  isDefault?: boolean;
}

export interface PurchaseRequest {
  itemId: string;
}

export interface PurchaseResponse {
  success: boolean;
  error?: string;
  newBalance?: number;
}

export interface Inventory {
  weapons: string[];
  armor: string[];
  perks: string[];
  cosmetics: string[];
}

export interface Equipment {
  weapon: string;
  armor: string;
  perks: string[];
  cosmetic: string | null;
}


