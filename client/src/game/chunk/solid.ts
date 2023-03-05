import type { Container } from 'pixi.js';
import { Chunk } from './main';

export class SolidChunk extends Chunk {
  constructor(
    public position: [number, number],
    public index: [number, number],
    public container: Container,
  ) {
    super('solid', position, index, container, 0xff0000);
  }
}
