import {createRouter, createWebHistory} from 'vue-router';
import HomeView from './views/HomeView.vue';
import VersionView from './views/VersionView.vue';

const uuidRegExp = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

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
                            path: `new/:projectId(${uuidRegExp})?`,
                            name: 'adminTagNew',
                            component: () => import('./views/admin/AdminTagNewView.vue')
                        },
                        {
                            path: `:tagId(${uuidRegExp})/edit`,
                            name: 'adminTagEdit',
                            component: () => import('./views/admin/AdminTagEditView.vue')
                        }
                    ]
                }
            ]
        },
        {
            path: '/help',
            name: 'help',
            component: () => import('./views/HelpView.vue')
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
                    path: `:issueId(${uuidRegExp})`,
                    name: 'issue',
                    component: () => import('./views/issues/IssueView.vue')
                },
                {
                    path: `:issueKey([a-z]+-[0-9]+)`,
                    name: 'issueByIssueKey',
                    component: () => import('./views/issues/IssueKeyRedirectView.vue')
                },
                {
                    path: `:issueId(${uuidRegExp})/edit`,
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
                    path: `:wikiPageId(${uuidRegExp})`,
                    name: 'wikiPage',
                    component: () => import('./views/wiki/WikiPageView.vue')
                },
                {
                    path: `:wikiPageId(${uuidRegExp})/edit`,
                    name: 'wikiPageEdit',
                    component: () => import('./views/wiki/WikiPageEditView.vue')
                }
            ]
        }
    ]
});

export default router;
