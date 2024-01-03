import { v4 as uuidv4 } from 'uuid';

export interface TickerCallback {
  (cTime: number, deltaTime: number): void;
}

export interface TickerUnsubscribe {
  (): void;
}

export class Ticker {
  private static subs: Array<{ id: string; callback: TickerCallback }> = [];
  private static time = Date.now();
  private static timeDelta = 0;
  private static paused = false;

  static tick() {
    if (Ticker.paused === false) {
      Ticker.timeDelta = Date.now() - Ticker.time;
      Ticker.time = Date.now();
      for (let i = 0; i < Ticker.subs.length; i++) {
        Ticker.subs[i].callback(Ticker.time, Ticker.timeDelta);
      }
    }
  }

  static pause() {
    Ticker.paused = true;
  }

  static resume() {
    Ticker.paused = false;
  }

  static reset() {
    Ticker.time = Date.now();
    Ticker.timeDelta = 0;
  }

  static subscribe(callback: TickerCallback): () => void {
    const id = uuidv4();
    Ticker.subs.push({ id, callback });
    return () => {
      for (let i = 0; i < Ticker.subs.length; i++) {
        const sub = Ticker.subs[i];
        if (sub.id === id) {
          Ticker.subs.splice(i, 1);
          break;
        }
      }
    };
  }

  static clear() {
    Ticker.subs = [];
  }
}
