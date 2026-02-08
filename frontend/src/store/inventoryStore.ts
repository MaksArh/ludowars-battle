import { create } from 'zustand';
import { Inventory, Equipment } from '@/types/shop';
import { getDefaultItems, getItemById } from '@/config/shopItems';
import { nakama } from '@/services/nakama';

const STORAGE_COLLECTION = 'player_data';
const STORAGE_KEY = 'inventory';
const MAX_PERKS = 2;

interface InventoryState extends Inventory {
  isLoading: boolean;
  equippedWeapon: string;
  equippedArmor: string;
  equippedPerks: string[];
  equippedCosmetic: string | null;
}

interface InventoryStore extends InventoryState {
  loadInventory: () => Promise<void>;
  saveInventory: () => Promise<void>;
  addItem: (itemId: string) => void;
  hasItem: (itemId: string) => boolean;
  equipWeapon: (id: string) => void;
  equipArmor: (id: string) => void;
  togglePerk: (id: string) => void;
  equipCosmetic: (id: string | null) => void;
  getEquipment: () => Equipment;
}

const defaultWeapons = getDefaultItems().filter((id) => getItemById(id)?.category === 'weapons');
const defaultArmor = getDefaultItems().filter((id) => getItemById(id)?.category === 'armor');

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  weapons: defaultWeapons,
  armor: defaultArmor,
  perks: [],
  cosmetics: [],
  isLoading: false,
  equippedWeapon: 'pistol',
  equippedArmor: 'light_armor',
  equippedPerks: [],
  equippedCosmetic: null,

  loadInventory: async () => {
    set({ isLoading: true });
    try {
      // Ensure session is valid
      const valid = await nakama.ensureSession();
      if (!valid) return;
      
      const session = nakama.session;
      const client = nakama.getClient();
      if (!session) return;

      const result = await client.readStorageObjects(session, {
        object_ids: [
          { collection: STORAGE_COLLECTION, key: STORAGE_KEY, user_id: session.user_id },
        ],
      });

      if (result.objects?.length) {
        const raw = result.objects[0].value;
        const data = (typeof raw === 'string' ? JSON.parse(raw) : raw) as Partial<InventoryState>;
        set({
          weapons: data.weapons || defaultWeapons,
          armor: data.armor || defaultArmor,
          perks: data.perks || [],
          cosmetics: data.cosmetics || [],
          equippedWeapon: data.equippedWeapon || 'pistol',
          equippedArmor: data.equippedArmor || 'light_armor',
          equippedPerks: data.equippedPerks || [],
          equippedCosmetic: data.equippedCosmetic || null,
        });
      }
    } catch (e) {
      console.error('Failed to load inventory:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  saveInventory: async () => {
    const state = get();
    const session = nakama.session;
    const client = nakama.getClient();
    if (!session) return;

    const data = {
      weapons: state.weapons,
      armor: state.armor,
      perks: state.perks,
      cosmetics: state.cosmetics,
      equippedWeapon: state.equippedWeapon,
      equippedArmor: state.equippedArmor,
      equippedPerks: state.equippedPerks,
      equippedCosmetic: state.equippedCosmetic,
    };

    await client.writeStorageObjects(session, [
      {
        collection: STORAGE_COLLECTION,
        key: STORAGE_KEY,
        value: data,
        permission_read: 1,
        permission_write: 1,
      },
    ]);
  },

  addItem: (itemId: string) => {
    const item = getItemById(itemId);
    if (!item) return;
    set((state) => ({
      [item.category]: [...state[item.category as keyof Inventory], itemId],
    }));
  },

  hasItem: (itemId: string) => {
    const item = getItemById(itemId);
    if (!item) return false;
    return get()[item.category as keyof Inventory].includes(itemId);
  },

  equipWeapon: (id: string) => {
    if (get().weapons.includes(id)) {
      set({ equippedWeapon: id });
      get().saveInventory();
    }
  },

  equipArmor: (id: string) => {
    if (get().armor.includes(id)) {
      set({ equippedArmor: id });
      get().saveInventory();
    }
  },

  togglePerk: (id: string) => {
    const state = get();
    if (!state.perks.includes(id)) return;

    const equipped = state.equippedPerks;
    if (equipped.includes(id)) {
      set({ equippedPerks: equipped.filter((p) => p !== id) });
    } else if (equipped.length < MAX_PERKS) {
      set({ equippedPerks: [...equipped, id] });
    }
    get().saveInventory();
  },

  equipCosmetic: (id: string | null) => {
    if (id === null || get().cosmetics.includes(id)) {
      set({ equippedCosmetic: id });
      get().saveInventory();
    }
  },

  getEquipment: () => {
    const s = get();
    return {
      weapon: s.equippedWeapon,
      armor: s.equippedArmor,
      perks: s.equippedPerks,
      cosmetic: s.equippedCosmetic,
    };
  },
}));

