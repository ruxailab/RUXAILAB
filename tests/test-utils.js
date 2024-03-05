import { render as vtlRender } from "@testing-library/vue";
import Vue from 'vue'
import Vuex from 'vuex';
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import VueI18n from 'vue-i18n'
import en from '@/locales/en.json'
import store from '@/store/index'


export * from "@testing-library/vue";

Vue.use(Vuetify)

const renderWithVuetify = (component, options, callback) => {
  const root = document.createElement('div')
  root.setAttribute('data-app', 'true')

  return vtlRender(
    component,
    {
      container: document.body.appendChild(root),
      // for Vuetify components that use the $vuetify instance property
      vuetify: new Vuetify(),
      ...options,
    },
    callback,
  )
}


const router = new VueRouter()
const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en
  }
})

export function render(component, { customStore } = {}) {
  return renderWithVuetify(component, {}, vue => {
    vue.use(VueRouter)
    vue.use(VueI18n)
    vue.use(Vuex)
    return {
      router,
      i18n,
      store: customStore || store,
    }
  })
}
