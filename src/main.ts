import { createApp } from 'vue';
import './styles/_main.scss';
import App from './app';
import router from './router';
import { initSdk } from './sdk';
import { Sdk } from './sdk/main';

initSdk(
  new Sdk({
    apiOrigin: 'http://localhost:1281',
  }),
);

createApp(App).use(router).mount('#app');
