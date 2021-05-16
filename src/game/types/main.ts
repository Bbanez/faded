import type { CameraServicePrototype, InputServicePrototype } from './services';
import type { TickerPrototype } from './ticker';
import type { ControlsPrototype } from './controls';
import type { Entity } from './components';

export interface GameConfig {
  htmlElement: HTMLElement;
}
export interface Game {
  ticker: TickerPrototype;
  controls: ControlsPrototype;
  character: Entity;
  camera: CameraServicePrototype;
  input: InputServicePrototype;
}
