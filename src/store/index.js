import { createStore } from 'vuex'
import Auth from '@/features/auth/store/Auth'
import Templates from '@/features/templates/Template'
import Tests from '@/store/modules/Study'
import Users from '@/store/modules/User'
import Reports from '@/shared/store/Report'
import Heuristic from '@/ux/Heuristic/store/Heuristic'
import Answer from '@/shared/store/Answer'
import Language from '../features/language/store/Language'
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
    toastMessage: '',
    toastType: 'info',
  },
  mutations: {
    SET_TOAST(state, { message, type }) {
      state.toastMessage = message;
      state.toastType = type || 'info';
    },
    RESET_TOAST(state) {
      state.toastMessage = '';
      state.toastType = 'info';
    },
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
    getToastMessage(state) {
      return state.toastMessage
    },
    getToastType(state) {
      return state.toastType
    },
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
    Reports,
    Heuristic,
    Answer,
    Language,
    automaticReport,
  }
})
