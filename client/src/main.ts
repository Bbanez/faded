import { BCMSImageConfig } from '@becomes/cms-most/frontend';
import { createApp } from 'vue';
import App from './app';
import router from './router';

import './styles/_main.scss';

BCMSImageConfig.cmsOrigin = 'https://cms.vajaga.com';
BCMSImageConfig.publicApiKeyId = '63753b269fab4733bcf04b9b';
BCMSImageConfig.localeImageProcessing = false;

createApp(App).use(router).mount('#app');
