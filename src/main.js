import '../node_modules/@fortawesome/fontawesome-free/css/fontawesome.css';
import '../node_modules/@fortawesome/fontawesome-free/css/solid.css';
import './style/style.scss';

import {createApp} from 'vue';
import App from './App.vue';
import router from './router';
import mermaid from "mermaid";

const app = createApp(App);

app.use(router);

app.mount('#app');

mermaid.initialize({
    theme: 'dark'
});
