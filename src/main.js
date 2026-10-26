import { createApp } from 'vue'
import App from './app/App.vue'
import router from './app/router/index.js'
import store from './store'
import vuetify from './app/plugins/vuetify.js'
import i18n from './app/plugins/i18n'
import Toast, { useToast } from 'vue-toastification'
import TextClamp from 'vue3-text-clamp'
import { quillEditor } from 'vue3-quill'
import safeHtml from '@/shared/directives/safeHtml'
import { sweepExpiredStudyLogging } from '@/shared/services/studyLoggingClient'
import { installFieldLabelAriaCleanup } from '@/shared/utils/fieldLabelAria'
import { initAuthListener } from '@/features/auth/services/authStateManager'
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

// Install the single persistent Firebase Auth state listener before the router
// so navigation guards await initial auth resolution. The callback handles
// subsequent changes (token refresh, sign-out in another tab, account switch)
// by syncing the Vuex store reactively.
let authSequence = 0

initAuthListener(async (firebaseUser) => {
  const currentSeq = ++authSequence

  if (!firebaseUser) {
    // Firebase says the user is gone — clear the Vuex profile so the UI
    // reflects reality instead of showing a stale session.
    // If a newer auth event arrived while logout was scheduled, skip to avoid
    // clobbering the newer state.
    if (store.state.Auth.user && currentSeq === authSequence) {
      await store.dispatch('logout', { silent: true })
    }
  } else if (!firebaseUser.isAnonymous) {
    const currentUser = store.state.Auth.user
    const isDifferentUser =
      !currentUser ||
      (currentUser.id !== firebaseUser.uid &&
        currentUser.uid !== firebaseUser.uid)

    if (isDifferentUser && currentSeq === authSequence) {
      // A valid Firebase user exists but the Vuex store is empty or holds a different user.
      // This handles cold loads, cross-tab sign-ins, and account switches.
      try {
        await store.dispatch('autoSignIn')
      } catch {
        // Ignored: transient load errors will be retried on next navigation
      }
    }
  }
})

void sweepExpiredStudyLogging()

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
app.directive('safe-html', safeHtml)

app.config.globalProperties.$toast = useToast()

// Global error handler — catches unhandled errors from any component
app.config.errorHandler = (err, instance, info) => {
  // eslint-disable-next-line no-console
  console.error('[Global Error Handler]', {
    message: err.message,
    stack: err.stack,
    component: instance?.$options?.name || 'Unknown',
    info,
    timestamp: new Date().toISOString(),
  })
}

// Field labels must not carry the redundant aria-hidden Vuetify renders on
// them; see src/shared/utils/fieldLabelAria.js.
installFieldLabelAriaCleanup()

// Mount the app
app.mount('#app')
