import { Client, Session, Socket } from '@heroiclabs/nakama-js';
import { NAKAMA, STORAGE } from '@/config/constants';

let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredCallback(cb: () => void) {
  onSessionExpired = cb;
}

class NakamaService {
  private client: Client;
  private _session: Session | null = null;
  private _socket: Socket | null = null;

  constructor() {
    this.client = new Client(NAKAMA.key, NAKAMA.host, NAKAMA.port, NAKAMA.ssl);
  }

  getClient() {
    return this.client;
  }

  get session() {
    return this._session;
  }

  get socket() {
    return this._socket;
  }

  async connectSocket(): Promise<Socket> {
    if (!this._session) throw new Error('No session');
    if (this._socket) return this._socket;

    this._socket = this.client.createSocket(NAKAMA.ssl, false);
    await this._socket.connect(this._session, true);
    return this._socket;
  }

  disconnectSocket() {
    this._socket?.disconnect(false);
    this._socket = null;
  }

  async authenticateEmail(email: string, password: string, create = false, username?: string) {
    try {
      this._session = await this.client.authenticateEmail(email, password, create, username);
      this.saveSession();
      return this._session;
    } catch (e) {
      console.error('[Nakama] authenticateEmail failed:', { email, create, username, error: e });
      throw e;
    }
  }

  async authenticateDevice() {
    const deviceId = localStorage.getItem(STORAGE.DEVICE) || crypto.randomUUID();
    localStorage.setItem(STORAGE.DEVICE, deviceId);
    this._session = await this.client.authenticateDevice(deviceId, true);
    this.saveSession();
    return this._session;
  }

  async restoreSession(): Promise<boolean> {
    const token = localStorage.getItem(STORAGE.TOKEN);
    const refresh = localStorage.getItem(STORAGE.REFRESH);
    if (!token || !refresh) return false;

    try {
      const session = Session.restore(token, refresh);
      const refreshExpiry = session.refresh_expires_at;
      if (refreshExpiry && refreshExpiry < Date.now() / 1000) {
        this.logout();
        return false;
      }
      if (session.isexpired(Date.now() / 1000)) {
        this._session = await this.client.sessionRefresh(session);
        this.saveSession();
      } else {
        this._session = session;
      }
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  async ensureSession(): Promise<boolean> {
    if (!this._session) {
      onSessionExpired?.();
      return false;
    }
    if (!this._session.isexpired(Date.now() / 1000)) return true;

    try {
      this._session = await this.client.sessionRefresh(this._session);
      this.saveSession();
      return true;
    } catch {
      this.logout();
      onSessionExpired?.();
      return false;
    }
  }

  async getAccount() {
    if (!this._session) throw new Error('No session');
    return this.client.getAccount(this._session);
  }

  logout() {
    this._session = null;
    localStorage.removeItem(STORAGE.TOKEN);
    localStorage.removeItem(STORAGE.REFRESH);
  }

  private saveSession() {
    if (!this._session) return;
    localStorage.setItem(STORAGE.TOKEN, this._session.token);
    localStorage.setItem(STORAGE.REFRESH, this._session.refresh_token);
  }
}

export const nakama = new NakamaService();
