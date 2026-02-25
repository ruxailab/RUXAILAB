export default {
  namespaced: true,
  state: {
    isOpen: false,
    completedSteps: [],
  },
  mutations: {
    SET_IS_OPEN(state, isOpen) {
      state.isOpen = isOpen
    },
    ADD_COMPLETED_STEP(state, stepId) {
      if (!state.completedSteps.includes(stepId)) {
        state.completedSteps.push(stepId)
      }
    },
    SET_COMPLETED_STEPS(state, steps) {
      state.completedSteps = steps
    },
  },
  actions: {
    toggleWizard({ commit, dispatch, state }, isOpen) {
      const newIsOpen = isOpen !== undefined ? isOpen : !state.isOpen
      commit('SET_IS_OPEN', newIsOpen)

      if (newIsOpen) {
        // Load persisted state if any
        dispatch('loadPersistedSteps')
      }
    },
    markStepCompleted({ commit, state }, stepId) {
      commit('ADD_COMPLETED_STEP', stepId)
      // TODO: In the future, sync this profile progress to the backend DB instead of just localStorage
      localStorage.setItem(
        'ruxailab_onboarding_completed',
        JSON.stringify(state.completedSteps),
      )
    },
    checkFirstLogin({ dispatch }) {
      // Check if user has already seen the wizard for the first time
      const hasSeenWizard = localStorage.getItem('ruxailab_onboarding_seen')

      dispatch('loadPersistedSteps')

      if (!hasSeenWizard) {
        // Automatically open wizard on first login
        dispatch('toggleWizard', true)
        localStorage.setItem('ruxailab_onboarding_seen', 'true')
      }
    },
    resetWizard({ commit }) {
      commit('SET_COMPLETED_STEPS', [])
      localStorage.removeItem('ruxailab_onboarding_completed')
    },
    loadPersistedSteps({ commit }) {
      const saved = localStorage.getItem('ruxailab_onboarding_completed')
      if (saved) {
        try {
          commit('SET_COMPLETED_STEPS', JSON.parse(saved))
        } catch (e) {
          console.error(
            'Failed to parse onboarding steps from local storage',
            e,
          )
        }
      }
    },
  },
  getters: {
    isOpen: (state) => state.isOpen,
    completedSteps: (state) => state.completedSteps,
    isStepCompleted: (state) => (stepId) =>
      state.completedSteps.includes(stepId),
  },
}
