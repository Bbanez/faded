import { createApp } from 'vue';
import './styles/_main.scss';
import { App } from './app';
import { invoke } from '@tauri-apps/api';

async function log(args: any[]) {
  console.log(args);
  await invoke('report_error', {
    err: args
      .map((arg) => {
        if (typeof arg === 'object') {
          if (arg.message && arg.stack) {
            return `${arg.message}\n${arg.stack}`;
          }
          return JSON.stringify(arg, null, '  ');
        } else {
          return arg;
        }
      })
      .join(', '),
  });
}

const _warn = console.warn,
  _error = console.error;

console.warn = (...data) => {
  log(data);
  return _warn.apply(console, data);
};

console.error = (...data) => {
  log(data);
  return _error.apply(console, data);
};

createApp(App).mount('#app');