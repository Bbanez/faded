import './assets/styles/main.scss';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', function () {
//     navigator.serviceWorker.register('/sw.js').then(
//       function (registration) {
//         // Registration was successful
//         console.log(
//           'ServiceWorker registration successful with scope: ',
//           registration.scope
//         );
//       },
//       function (err) {
//         // registration failed :(
//         console.log('ServiceWorker registration failed: ', err);
//       }
//     );
//   });
// }


createApp(App).use(store).use(router).mount('#app');
