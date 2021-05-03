import type {
  CameraServicePrototype,
  ConsoleServicePrototype,
  InputServicePrototype,
} from './services';
import type { TickerEnginePrototype } from '../engines';
import type { ControlEnginePrototype } from './engine';
import type { LoaderPrototype } from './util';

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
      util: {
        loader: LoaderPrototype;
      };
    };
  }
}
