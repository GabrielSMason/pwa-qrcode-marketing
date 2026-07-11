import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'

const routes = [
    { path: '/login', component: Login },
    { path: '/', component: Home, meta: { requerAuth: true } }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to) => {
    const token = localStorage.getItem('token')
    if (to.meta.requerAuth && !token) {
        return '/login'
    }
})

export default router