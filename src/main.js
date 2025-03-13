import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import i18n from './i18n'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import "@/assets/styles/toast.css"
Vue.config.productionTip = false

const options = {
  transition: "Vue-Toastification__fade",
  maxToasts: 3,
  newestOnTop: true,
  timeout: 4000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  closeButton: "button",
  icon: true,
  position: "top-center",
};
Vue.use(Toast, options)

new Vue({
  router,
  store,
  vuetify,
  i18n,

  render: (h) => h(App),
}).$mount('#app')
