import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from './router'
import { key, store } from './store'
import { vuetify } from './plugins/vuetify'

createApp(App).use(store, key).use(router).use(vuetify).mount('#app')
