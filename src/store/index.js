import { createStore } from 'vuex'
import Auth from '@/features/auth/store/Auth'
import Templates from '@/features/templates/Template'
import Tests from '@/store/modules/Study'
import Users from '@/features/super/store/User'
import Reports from '@/shared/store/Report'
import Heuristic from '@/ux/Heuristic/store/Heuristic'
import Answer from '@/shared/store/Answer'
import Language from '../features/language/store/Language'
import Assessment from '../ux/accessibility/store/Assessment'
import ManualAccessibilityTest from '../ux/accessibility/store/ManualAccessibilityTest'
import AutomaticAccessibilityTest from '../ux/accessibility/store/AutomaticAccessibilityTest'
import automaticReport from '@/ux/accessibility/store/automaticReport'
import UserStudy from '@/ux/UserTest/store/UserStudy'
import notification from '@/features/notifications/store/notification'

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
    UserStudy,
    notification,
  }
})
