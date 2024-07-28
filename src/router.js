import {createRouter, createWebHistory} from 'vue-router';
import HomeView from './views/HomeView.vue';
import VersionView from './views/VersionView.vue';

const router = createRouter({
    history: createWebHistory(window.env.BASE_URL || import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/demo',
            name: 'demo',
            component: () => import('./views/DemoView.vue')
        },
        {
            path: '/tasks',
            children: [
                {
                    path: '',
                    name: 'tasks',
                    component: () => import('./views/tasks/TasksView.vue')
                },
                {
                    path: 'new',
                    name: 'tasksNew',
                    component: () => import('./views/tasks/TasksNewView.vue')
                },
                {
                    path: ':entryId([0-9a-f-]+)',
                    name: 'task',
                    component: () => import('./views/tasks/TaskView.vue')
                },
                {
                    path: ':entryId([0-9a-f-]+)/edit',
                    name: 'taskEdit',
                    component: () => import('./views/tasks/TaskEditView.vue')
                }
            ]
        },
        {
            path: '/version',
            name: 'version',
            component: VersionView
        },
        {
            path: '/wiki',
            children: [
                {
                    path: '',
                    name: 'wiki',
                    component: () => import('./views/wiki/WikiView.vue')
                },
                {
                    path: 'new',
                    name: 'wikiPageNew',
                    component: () => import('./views/wiki/WikiPageNewView.vue')
                },
                {
                    path: ':entryId([0-9a-f-]+)',
                    name: 'wikiPage',
                    component: () => import('./views/wiki/WikiPageView.vue')
                },
                {
                    path: ':entryId([0-9a-f-]+)/edit',
                    name: 'wikiPageEdit',
                    component: () => import('./views/wiki/WikiPageEditView.vue')
                }
            ]
        }
    ]
});

export default router;
