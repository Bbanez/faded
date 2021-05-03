import * as uuid from 'uuid';

export type TickerEngineCallback = (t: number) => void;
export interface TickerEnginePrototype {
  register(callback: TickerEngineCallback): () => void;
  destroy(): void;
}

export function TickerEngine(): TickerEnginePrototype {
  const regs: Array<{
    id: string;
    callback: TickerEngineCallback;
  }> = [];
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
  tick();

  const self: TickerEnginePrototype = {
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
  };
  return self;
}
