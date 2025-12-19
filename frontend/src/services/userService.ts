import { nakama } from '@/services/nakama';
import { useUserStore } from '@/store/userStore';

// обновляет баланс монет в сторе
export async function refreshUserCoins(): Promise<number> {
  try {
    const acc = await nakama.getAccount();
    const wallet = JSON.parse(acc.wallet || '{}');
    const coins = wallet.coins || 0;
    useUserStore.getState().updateCoins(coins);
    return coins;
  } catch (e) {
    console.error('Failed to refresh user coins:', e);
    return 0;
  }
}
