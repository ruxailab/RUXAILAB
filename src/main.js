import { createApp } from 'vue';
import App from './app/App.vue';
import router from './app/router/index.js';
import store from './store';
import vuetify from './app/plugins/vuetify.js';
import i18n from './app/plugins/i18n';
import Toast, { useToast } from 'vue-toastification';
import TextClamp from 'vue3-text-clamp';
import { quillEditor } from 'vue3-quill'
import 'vue-toastification/dist/index.css';
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const app = createApp(App);

const options = {
  newestOnTop: true,
  position: 'top-right',
  draggable: true,
  pauseOnHover: true,
  closeOnClick: true,
  timeout: 4000,
};

// Use plugins
app.use(router);
app.use(store);
app.use(vuetify);
app.use(i18n);
app.use(Toast, options);
app.use(TextClamp);
app.use(quillEditor)

app.config.globalProperties.$toast = useToast();

// Mount the app
app.mount('#app');
