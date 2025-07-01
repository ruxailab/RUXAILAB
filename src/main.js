import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import i18n from './i18n';
import Toast, { useToast } from 'vue-toastification';
import TextClamp from 'vue3-text-clamp';
import { quillEditor } from 'vue3-quill'
import 'vue-toastification/dist/index.css';

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
