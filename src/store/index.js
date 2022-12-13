import Vue from 'vue'
import Vuex from 'vuex'
import database from '@/store/modules/database/database'
import tests from '@/store/modules/database/tests'
import auth from '@/store/modules/auth/auth'
import users from '@/store/modules/database/users'
import reports from '@/store/modules/database/reports'
import answers from '@/store/modules/database/answers'
import cooperators from '@/store/modules/database/cooperators'
import templates from '@/store/modules/database/templates'
import Auth from '@/store/modules/newStores/Auth'
//import Heuristics from '@/store/modules/newStores/Heuristic'
import Templates from '@/store/modules/newStores/Template'
import Tests from '@/store/modules/newStores/Test'
import Users from '@/store/modules/newStores/User'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    database,
    auth,
    tests,
    users,
    reports,
    answers,
    cooperators,
    templates,
    Auth,
   // Heuristics,
    Templates,
    Tests,
    Users
  }
})
