import Vue from 'vue'
import Vuex from 'vuex'
import database from '@/store/modules/database/database'
import tests from '@/store/modules/database/tests'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    database,
    tests
  }
})
