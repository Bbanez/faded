import './styles/_main.scss';
import { createApp } from 'vue';
import router from './router';
import { App } from './app';

const app = createApp(App);

app.use(router);

app.mount('#app');
