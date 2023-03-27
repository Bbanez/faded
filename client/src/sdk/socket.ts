import { v4 as uuidv4 } from 'uuid';
import type { Socket } from 'socket.io-client';
import type { SocketEvent } from './types';
import { io } from 'socket.io-client';
import { Storage } from '@client/storage';

// eslint-disable-next-line no-shadow
export enum SocketEventName {
  USER = 'user',
}

export interface SocketSubscriptionCallback {
  (event: SocketEvent): Promise<void>;
}

export class SocketHandler {
  private subs: {
    [eventName: string]: {
      [id: string]: SocketSubscriptionCallback;
    };
  } = {};
  private eventNames = Object.keys(SocketEventName);
  private isConnected = false;
  private socket: Socket | null = null;

  constructor() {
    this.eventNames.forEach((eventName) => {
      this.subs[eventName] = {};
    });
    this.subs.ANY = {};
  }

  private triggerSubs(
    eventName: SocketEventName | 'ANY',
    event: SocketEvent,
  ): void {
    for (const id in this.subs[eventName]) {
      this.subs[eventName][id](event).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(`Subs.${eventName}.${id} ->`, error);
      });
    }
    if (eventName !== 'ANY') {
      for (const id in this.subs.ANY) {
        this.subs.ANY[id](event).catch((error) => {
          // eslint-disable-next-line no-console
          console.error(`Subs.${eventName}.${id} ->`, error);
        });
      }
    }
  }

  private initSocket(_soc: Socket) {
    // TODO: Add sub handlers for known events
  }

  id(): string | null {
    if (this.socket) {
      return this.socket.id;
    }
    return null;
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      this.isConnected = true;
      return await new Promise<void>((resolve, reject) => {
        try {
          const token = Storage.get<string>('at');
          if (!token) {
            this.isConnected = false;
            reject('You need to login to access socket.');
            return;
          }
          this.socket = io({
            path: '/api/socket/server',
            transports: ['websocket'],
            query: {
              token,
            },
            autoConnect: false,
          });
          this.socket.connect();
          this.socket.on('connect_error', (...data: unknown[]) => {
            if (this.socket) {
              this.socket.close();
            }
            this.isConnected = false;
            reject(data);
          });
          this.socket.on('error', (data) => {
            if (this.socket) {
              this.socket.close();
            }
            this.isConnected = false;
            reject(data);
          });
          this.socket.on('connect', () => {
            // eslint-disable-next-line no-console
            console.log('Successfully connected to Socket server.');
            this.isConnected = true;
            this.initSocket(this.socket as Socket);
            resolve();
          });
          this.socket.on('disconnect', () => {
            this.isConnected = false;
            // eslint-disable-next-line no-console
            console.log('Disconnected from Socket server.');
          });
        } catch (error) {
          reject(error);
        }
      });
    }
  }

  disconnect(): void {
    if (this.socket && this.isConnected) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  connected(): boolean {
    return this.isConnected;
  }

  emit(event: string, data: unknown): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  subscribe(
    event: SocketEventName | 'ANY',
    callback: SocketSubscriptionCallback,
  ): () => void {
    const id = uuidv4();
    this.subs[event][id] = callback;
    return () => {
      delete this.subs[event][id];
    };
  }
}
