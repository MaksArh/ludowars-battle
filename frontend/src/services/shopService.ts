import { nakama } from './nakama';
import { PurchaseRequest, PurchaseResponse } from '@/types/shop';
import { useUserStore } from '@/store/userStore';
import { useInventoryStore } from '@/store/inventoryStore';

export async function purchaseItem(itemId: string): Promise<PurchaseResponse> {
  const session = nakama.session;
  if (!session) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const payload: PurchaseRequest = { itemId };
    const response = await nakama.getClient().rpc(session, 'purchase_item', payload);
    const result: PurchaseResponse =
      typeof response.payload === 'string'
        ? JSON.parse(response.payload)
        : (response.payload as PurchaseResponse) || { success: false };

    if (result.success) {
      useInventoryStore.getState().addItem(itemId);
      if (result.newBalance !== undefined) {
        useUserStore.getState().updateCoins(result.newBalance);
      }
      await useInventoryStore.getState().saveInventory();
    }

    return result;
  } catch (e) {
    console.error('Purchase failed:', e);
    return { success: false, error: e instanceof Error ? e.message : 'Purchase failed' };
  }
}

