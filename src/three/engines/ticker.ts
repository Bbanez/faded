import * as uuid from 'uuid';

export type TickerEngineCallback = () => void;
export interface TickerEnginePrototype {
  register(callback: TickerEngineCallback): () => void;
  destroy(): void;
}

export function TickerEngine() {
  const regs: Array<{
    id: string;
    callback: TickerEngineCallback;
  }> = [];
  let stop = false;
  function tick() {
    if (!stop) {
      requestAnimationFrame(tick);
      for (let i = 0; i < regs.length; i++) {
        regs[i].callback();
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
