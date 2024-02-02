import { RustModel } from './model.ts';

export interface RustSettings {
  model: RustModel;
  resolution: [number, number]
}