import { createApp } from 'vue'
import App from './app/App.vue'
import router from './app/router/index.js'
import store from './store'
import vuetify from './app/plugins/vuetify.js'
import i18n from './app/plugins/i18n'
import Toast, { useToast } from 'vue-toastification'
import TextClamp from 'vue3-text-clamp'
import { quillEditor } from 'vue3-quill'
import 'vue-toastification/dist/index.css'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

// Harmless browser warning triggered by menus/overlays resizing rapidly (e.g. Vuetify v-menu).
// Suppress it so it doesn't trip the webpack-dev-server error overlay.
const resizeObserverLoopErrRe = /ResizeObserver loop/
window.addEventListener('error', (event) => {
  if (resizeObserverLoopErrRe.test(event.message)) {
    event.stopImmediatePropagation()
  }
})

const app = createApp(App)

const options = {
  newestOnTop: true,
  position: 'top-right',
  draggable: true,
  pauseOnHover: true,
  closeOnClick: true,
  timeout: 4000,
}

// Use plugins
app.use(router)
app.use(store)
app.use(vuetify)
app.use(i18n)
app.use(Toast, options)
app.use(TextClamp)
app.use(quillEditor)

app.config.globalProperties.$toast = useToast()

// Global error handler — catches unhandled errors from any component
app.config.errorHandler = (err, instance, info) => {
  console.error('[Global Error Handler]', {
    message: err.message,
    stack: err.stack,
    component: instance?.$options?.name || 'Unknown',
    info,
    timestamp: new Date().toISOString(),
  })
}

// Mount the app
app.mount('#app')
