import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
            console.log('Service Worker registrado:', registration)
        })
        .catch((err) => {
            console.log('Erro ao registrar Service Worker:', err)
        })
}

createApp(App).use(router).mount('#app')