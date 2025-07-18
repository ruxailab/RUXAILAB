import { createStore } from 'vuex'
import Auth from '@/store/modules/Auth'
import Templates from '@/store/modules/Template'
import Tests from '@/store/modules/Test'
import Users from '@/store/modules/User'
import Database from '@/store/modules/Database'
import Cooperators from '@/store/modules/Cooperators'
import Reports from '@/store/modules/Reports'
import Heuristic from '@/store/modules/Heuristic'
import Answer from '@/store/modules/Answer'
import Language from './modules/Language'
import Assessment from './modules/Assessment'
import ManualAccessibilityTest from './modules/ManualAccessibilityTest'
import AutomaticAccessibilityTest from './modules/AutomaticAccessibilityTest'
import automaticReport from '@/store/modules/automaticReport'

export default createStore({
  state: {
    loading: false,
    error: null,
    dialogLeave: false,
    localChanges: false,
    pathTo: null,
  },
  mutations: {
    setLoading(state, payload) {
      state.loading = payload
    },
    setError(state, payload) {
      state.error = {
        errorCode: payload.errorCode,
        message: payload.message,
      }
    },
    SET_DIALOG_LEAVE(state, payload) {
      state.dialogLeave = payload
    },
    SET_LOCAL_CHANGES(state, payload) {
      state.localChanges = payload
    },
    SET_PATH_TO(state, payload) {
      state.pathTo = payload
    },
  },
  getters: {
    getDialogLeaveStatus(state) {
      return state.dialogLeave
    },
    localChanges(state) {
      return state.localChanges
    },
  },
  modules: {
    manualAccessibility: ManualAccessibilityTest,
    automaticAccessibility: AutomaticAccessibilityTest,
    Assessment,
    Auth,
    Templates,
    Tests,
    Users,
    Database,
    Cooperators,
    Reports,
    Heuristic,
    Answer,
    Language,
    automaticReport,
  }
})
