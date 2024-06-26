import { createRouter, createWebHistory } from 'vue-router'
import SearchView from '../views/SearchView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'Search',
            component: SearchView,
            meta: {
                keepAlive: true,
            }
        },
        {
            path: '/artifact/:groupId/:artifactName',
            name: 'Artifact',
            component: () => import('../views/ArtifactView.vue'),
        },
    ],
})

export default router
