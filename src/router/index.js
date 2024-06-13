import {createRouter, createWebHistory} from 'vue-router';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/demo',
            name: 'demo',
            component: () => import('../views/DemoView.vue')
        },
        {
            path: '/wiki',
            name: 'wiki',
            component: () => import('../views/WikiView.vue')
        }
    ]
});

export default router;
