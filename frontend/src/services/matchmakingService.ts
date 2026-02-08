import { nakama } from './nakama';
import { networkManager } from './NetworkManager';
import { useMatchStore } from '@/store/matchStore';

interface JoinOrCreateResponse {
  matchId: string;
}

// ищет матч или создает новый и подключается
class MatchmakingService {
  private inProgress = false;

  async start(): Promise<void> {
    if (this.inProgress) {
      console.log('[Matchmaking] Already in progress, skipping');
      return;
    }
    this.inProgress = true;

    const store = useMatchStore.getState();
    store.setStatus('searching');

    try {
      const valid = await nakama.ensureSession();
      if (!valid) {
        throw new Error('Session expired');
      }

      await nakama.connectSocket();

      const session = nakama.session;
      if (!session) throw new Error('No session');

      const result = await nakama.getClient().rpc(session, 'join_or_create_match', {});
      const payload = typeof result.payload === 'string'
        ? result.payload
        : JSON.stringify(result.payload);
      const response = JSON.parse(payload) as JoinOrCreateResponse;

      if (!response.matchId) {
        throw new Error('No matchId in response');
      }

      console.log('[Matchmaking] Got matchId:', response.matchId);
      store.setStatus('found');

      await networkManager.joinMatch(response.matchId);
    } catch (e) {
      console.error('[Matchmaking] Failed:', e);
      store.setStatus('idle');
      throw e;
    } finally {
      this.inProgress = false;
    }
  }

  async leave(): Promise<void> {
    await networkManager.leaveMatch();
  }

  cancel(): void {
    const store = useMatchStore.getState();
    if (store.status === 'searching') {
      console.log('[Matchmaking] Cancelling search');
      this.inProgress = false;
      store.setStatus('idle');
    }
  }
}

export const matchmaking = new MatchmakingService();
