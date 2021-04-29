import type {
  CameraServicePrototype,
  ConsoleServicePrototype,
  InputServicePrototype,
} from './services';
import type { TickerEnginePrototype } from '../engines';
import type { ControlEnginePrototype } from './engine';

declare global {
  interface Window {
    t: {
      engine: {
        ticker: TickerEnginePrototype;
        control: ControlEnginePrototype;
      };
      services: {
        console: ConsoleServicePrototype;
        input: InputServicePrototype;
        camera: CameraServicePrototype;
      };
    };
  }
}
