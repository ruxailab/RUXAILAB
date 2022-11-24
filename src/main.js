import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import firebase from "firebase/app";
import vuetify from "./plugins/vuetify";
import i18n from "./i18n";

let isProduction = false;

const firebaseConfig = isProduction
  ? {
      apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
      authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
      storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
      databaseURL: process.env.VUE_APP_FIREBASE_DB_URL,
      projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
      messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VUE_APP_FIREBASE_APP_ID,
    }
  : {
      apiKey: process.env.VUE_APP_FIREBASE_API_KEY_DEV,
      authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN_DEV,
      storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET_DEV,
      databaseURL: process.env.VUE_APP_FIREBASE_DB_URL_DEV,
      projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID_DEV,
      messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID_DEV,
      appId: process.env.VUE_APP_FIREBASE_APP_ID_DEV,
      measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID_DEV,
    };

firebase.initializeApp(firebaseConfig);
if (!isProduction) firebase.analytics(); //remove if when added firebase analytics to production
// fetch('/__/firebase/init.json').then(response => {
//   firebase.initializeApp(response.json());
// });

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  i18n,

  render: (h) => h(App),
}).$mount("#app");
