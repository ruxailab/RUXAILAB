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

// refactored store
import answerv1 from '@/store/modules/v1/answer'
import testv1 from '@/store/modules/v1/test'
import templatev1 from '@/store/modules/v1/answer'
import userv1 from '@/store/modules/v1/answer'
import authv1 from '@/store/modules/v1/answer'

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
    answerv1,
    testv1,
    templatev1,
    userv1,
    authv1,
  }
})
