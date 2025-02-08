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
            children: [
                {
                    path: '',
                    name: 'wiki',
                    component: () => import('../views/WikiView.vue')
                },
                {
                    path: 'new',
                    name: 'wikiPageNew',
                    component: () => import('../views/WikiPageNewView.vue')
                },
                {
                    path: ':entryId([0-9a-f-]+)',
                    name: 'wikiPage',
                    component: () => import('../views/WikiPageView.vue')
                }
            ]
        }
    ]
});

export default router;
