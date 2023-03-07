import { Container } from 'pixi.js';

export const Layers: Container[] = [];

for (let i = 0; i < 5; i++) {
  const cont = new Container();
  Layers.push(cont);
}

export function layersDestroy() {
  for (let i = 0; i < Layers.length; i++) {
    const cont = Layers[i];
    cont.destroy();
  }
}
