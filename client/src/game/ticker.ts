import { v4 as uuidv4 } from 'uuid';

export interface TickerCallback {
  (cTime: number, deltaTime: number): void;
}

export interface TickerUnsubscribe {
  (): void;
}

export class Ticker {
  private static subs: {
    [id: string]: TickerCallback;
  } = {};
  private static time = Date.now();
  private static timeDelta = 0;

  static tick() {
    Ticker.timeDelta = Date.now() - Ticker.time;
    Ticker.time = Date.now();
    for (const id in Ticker.subs) {
      Ticker.subs[id](Ticker.time, Ticker.timeDelta);
    }
  }
  static reset() {
    Ticker.time = Date.now();
    Ticker.timeDelta = 0;
  }
  static subscribe(callback: TickerCallback): () => void {
    const id = uuidv4();
    Ticker.subs[id] = callback;
    return () => {
      delete Ticker.subs[id];
    };
  }
  static clear() {
    const ids = Object.keys(Ticker.subs);
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      delete Ticker.subs[id];
    }
  }
}
