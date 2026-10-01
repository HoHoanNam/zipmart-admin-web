import { Injectable, inject, signal } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from '../auth/token-storage.service';

/**
 * Thin client for the shared `/ws` gateway (Infra B) — one namespace/socket
 * for every realtime feature (chat, notifications, B.9 support console);
 * rooms distinguish audiences server-side, not separate namespaces here.
 * Auth token goes in `handshake.auth.token` (see `WsJwtGuard.verifyClient`),
 * not a header — plain socket.io-client, no interceptor involved.
 */
@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private readonly tokenStorage = inject(TokenStorageService);
  private socket: Socket | null = null;

  readonly connected = signal(false);

  connect(): void {
    if (this.socket?.connected) return;
    const token = this.tokenStorage.getAccessToken();
    if (!token) return;

    this.socket = io(`${this.wsOrigin()}/ws`, {
      auth: { token },
      transports: ['websocket'],
    });
    this.socket.on('connect', () => this.connected.set(true));
    this.socket.on('disconnect', () => this.connected.set(false));
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.connected.set(false);
  }

  on<T = unknown>(event: string, callback: (payload: T) => void): void {
    this.socket?.on(event, callback as (...args: unknown[]) => void);
  }

  off(event: string, callback?: (...args: unknown[]) => void): void {
    this.socket?.off(event, callback);
  }

  emit(event: string, payload: unknown): void {
    this.socket?.emit(event, payload);
  }

  /** `environment.apiUrl` is `<origin>/api/v1` — the gateway's `/ws` namespace lives at the bare origin, not under the REST prefix. */
  private wsOrigin(): string {
    return environment.apiUrl.replace(/\/api\/v1\/?$/, '');
  }
}
