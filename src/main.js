import '@fortawesome/fontawesome-free/css/fontawesome.css';
import '@fortawesome/fontawesome-free/css/solid.css';
import './style/style.scss';

import {createApp} from 'vue';
import {createHead} from '@unhead/vue/client';
import App from './App.vue';
import router from './router';
import mermaid from "mermaid";

const app = createApp(App);
const head = createHead({
    init: [
        {
            titleTemplate: title => title ? `${title} · tH-Wiki` : 'tH-Wiki'
        }
    ]
});

app.use(head);
app.use(router);

app.mount('#app');

mermaid.initialize({
    theme: 'dark'
});
