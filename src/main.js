import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@picocss/pico/css/pico.min.css'
import './assets/styles.css'
import App from './App.vue'
import router from './router'
import { useEditorStore } from './stores/editor'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const editorStore = useEditorStore(pinia)
editorStore.hydrate()

app.mount('#app')
