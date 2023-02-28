import { createApp } from 'vue';
import App from './app';
import router from './router';

import './styles/_main.scss';

createApp(App).use(router).mount('#app');
