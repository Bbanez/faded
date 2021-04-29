export interface ConsoleServiceData<T> {
  location?: string;
  payload: T;
}
export interface ConsoleServicePrototype {
  info<T>(data: ConsoleServiceData<T>): void;
  warn<T>(data: ConsoleServiceData<T>): void;
  error<T>(data: ConsoleServiceData<T>): void;
}
