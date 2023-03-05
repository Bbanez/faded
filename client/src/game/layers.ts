import { Container } from 'pixi.js';

export const Layers: Container[] = [];

for (let i = 0; i < 5; i++) {
  const cont = new Container();
  Layers.push(cont);
}
