export type TickerCallback = (t: number) => void;
export interface TickerPrototype {
  register(callback: TickerCallback): () => void;
  destroy(): void;
  start(): void;
}
