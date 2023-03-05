import type { Container } from 'pixi.js';
import { Chunk } from './main';

export class PlatformChunk extends Chunk {
  constructor(
    public position: [number, number],
    public index: [number, number],
    public container: Container,
  ) {
    super('platform', position, index, container, 0x0000ff);
  }
}
