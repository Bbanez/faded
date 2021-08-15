export interface TimeTracker {
  track: {
    timeToComplete<T>(
      message: string,
      fn: () => T | Promise<T>
    ): T | Promise<T>;
  };
}
