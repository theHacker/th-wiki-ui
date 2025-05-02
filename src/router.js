import {createRouter, createWebHistory} from 'vue-router';
import HomeView from './views/HomeView.vue';
import VersionView from './views/VersionView.vue';

const router = createRouter({
    history: createWebHistory(window.env.BASE_URL || import.meta.env.BASE_URL),
    linkActiveClass: 'active',
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/admin',
            children: [
                {
                    path: '',
                    name: 'admin',
                    component: () => import('./views/admin/AdminView.vue')
                },
                {
                    path: 'projects',
                    name: 'adminProjects',
                    component: () => import('./views/admin/AdminProjectsView.vue')
                },
                {
                    path: 'tags',
                    children: [
                        {
                            path: '',
                            name: 'adminTags',
                            component: () => import('./views/admin/AdminTagsView.vue')
                        },
                        {
                            path: 'new/:projectId([0-9a-f-]+)?',
                            name: 'adminTagNew',
                            component: () => import('./views/admin/AdminTagNewView.vue')
                        },
                        {
                            path: ':tagId([0-9a-f-]+)/edit',
                            name: 'adminTagEdit',
                            component: () => import('./views/admin/AdminTagEditView.vue')
                        }
                    ]
                }
            ]
        },
        {
            path: '/issues',
            children: [
                {
                    path: '',
                    name: 'issues',
                    component: () => import('./views/issues/IssuesView.vue')
                },
                {
                    path: 'new',
                    name: 'issueNew',
                    component: () => import('./views/issues/IssueNewView.vue')
                },
                {
                    path: ':issueId([0-9a-f-]+)',
                    name: 'issue',
                    component: () => import('./views/issues/IssueView.vue')
                },
                {
                    path: ':issueId([0-9a-f-]+)/edit',
                    name: 'issueEdit',
                    component: () => import('./views/issues/IssueEditView.vue')
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
                    component: () => import('./views/wiki/WikiPageView.vue')
                },
                {
                    path: 'new',
                    name: 'wikiPageNew',
                    component: () => import('./views/wiki/WikiPageNewView.vue')
                },
                {
                    path: ':wikiPageId([0-9a-f-]+)',
                    name: 'wikiPage',
                    component: () => import('./views/wiki/WikiPageView.vue')
                },
                {
                    path: ':wikiPageId([0-9a-f-]+)/edit',
                    name: 'wikiPageEdit',
                    component: () => import('./views/wiki/WikiPageEditView.vue')
                }
            ]
        }
    ]
});

export default router;
