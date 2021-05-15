export type TickerEngineCallback = (t: number) => void;
export interface TickerEnginePrototype {
  register(callback: TickerEngineCallback): () => void;
  destroy(): void;
  start(): void;
}
