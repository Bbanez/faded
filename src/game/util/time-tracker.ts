import type { TimeTracker } from '../types';

function createTimeTracker(): TimeTracker {
  return {
    track: {
      async timeToComplete(message, fn) {
        console.log(message);
        const timeOffset = Date.now();
        return new Promise((resolve, reject) => {
          const res = fn();
          if (res instanceof Promise) {
            res
              .then((output) => {
                console.log(
                  `${message} done in ${(Date.now() - timeOffset) / 1000}s`
                );
                resolve(output);
              })
              .catch((err) => {
                console.log(
                  `${message} failed after ${(Date.now() - timeOffset) / 1000}s`
                );
                reject(err);
              });
          } else {
            console.log(
              `${message} done in ${(Date.now() - timeOffset) / 1000}s`
            );
            resolve(res);
          }
        });
      },
    },
  };
}
export const TimeTrackerUtil = createTimeTracker();
