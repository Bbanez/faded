import type {
  CameraServicePrototype,
  ConsoleServicePrototype,
  InputServicePrototype,
} from './services';
import type { TickerEnginePrototype } from '../engines';

declare global {
  interface Window {
    t: {
      engine: {
        ticker: TickerEnginePrototype;
      };
      services: {
        console: ConsoleServicePrototype;
        input: InputServicePrototype;
        camera: CameraServicePrototype;
      };
    };
  }
}
