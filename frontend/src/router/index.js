import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Admin from '../views/Admin.vue'

const routes = [
    { path: '/login', component: Login },
    { path: '/', component: Home, meta: { requerAuth: true } },
    { path: '/admin', component: Admin, meta: { requerAuth: true, requerAdmin: true } }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to) => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    if (to.meta.requerAuth && !token) return '/login'
    if (to.meta.requerAdmin && role !== 'admin') return '/'
})

export default router