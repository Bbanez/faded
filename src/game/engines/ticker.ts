import * as uuid from 'uuid';
import type { TickerEngineCallback, TickerEnginePrototype } from '../types';

export function createTicker(): TickerEnginePrototype {
  const regs: Array<{
    id: string;
    callback: TickerEngineCallback;
  }> = [];
  let started = false;
  let stop = false;
  let time = Date.now();
  function tick() {
    if (!stop) {
      requestAnimationFrame(tick);
      time = Date.now();
      for (let i = 0; i < regs.length; i++) {
        regs[i].callback(time);
      }
    }
  }

  return {
    register(callback) {
      const id = uuid.v4();
      regs.push({ id, callback });
      return () => {
        for (let i = 0; i < regs.length; i++) {
          if (regs[i].id === id) {
            regs.splice(i, 1);
          }
        }
      };
    },
    destroy() {
      stop = true;
    },
    start() {
      if (started) {
        return;
      }
      started = true;
      tick();
    },
  };
}
