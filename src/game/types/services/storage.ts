export type StorageSubscriptionHandler<T> = (
  value: T,
  type: 'set' | 'remove'
) => void | Promise<void>;
export interface Storage {
  get<T>(key: string): T | null;
  set(key: string, value: unknown): Promise<boolean>;
  remove(key: string): Promise<void>;
  subscribe<T>(key: string, handler: StorageSubscriptionHandler<T>): () => void;
  clear(): Promise<void>;
}
export interface LocalStorageWrapper {
  all<T>(): T;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
