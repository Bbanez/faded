export interface ErrorEvent {
  mainSource: string;
  place: string;
  message: string;
  jsError: Error;
}
// eslint-disable-next-line no-shadow
export enum ErrorEventType {
  WARN = 'WARN',
  ERROR = 'ERROR',
}
export type ErrorManagerCallback = (
  type: ErrorEventType,
  err: ErrorEvent
) => void;
export interface ErrorManagerPrototype {
  subscribe(callback: ErrorManagerCallback): () => void;
  trigger(type: ErrorEventType, event: ErrorEvent): void;
}
export interface ErrorHandlerPrototype {
  warn(place: string, ...args: Array<unknown>): void;
  break(place: string, ...args: Array<unknown>): Error;
}
