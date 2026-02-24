export default {
  namespaced: true,
  state: {
    isVisible: false,
    completedSteps: [], // e.g., ['org_setup', 'system_setup']
    totalSteps: 6, // We can adjust this based on the number of steps we have
    stepsConfig: [
      { id: 'home_tour', nameKey: 'wizard.steps.home_tour', icon: 'mdi-home' },
      {
        id: 'org_setup',
        nameKey: 'wizard.steps.org_setup',
        icon: 'mdi-domain',
      },
      {
        id: 'system_setup',
        nameKey: 'wizard.steps.system_setup',
        icon: 'mdi-cog',
      },
      {
        id: 'accounting_setup',
        nameKey: 'wizard.steps.accounting_setup',
        icon: 'mdi-calculator',
      },
      {
        id: 'products_setup',
        nameKey: 'wizard.steps.products_setup',
        icon: 'mdi-package-variant',
      },
      {
        id: 'funds_reports',
        nameKey: 'wizard.steps.funds_reports',
        icon: 'mdi-chart-bar',
      },
    ],
  },
  getters: {
    isVisible(state) {
      return state.isVisible
    },
    completedSteps(state) {
      return state.completedSteps
    },
    progressPercentage(state) {
      if (state.totalSteps === 0) return 0
      return Math.round((state.completedSteps.length / state.totalSteps) * 100)
    },
    steps(state) {
      return state.stepsConfig.map((step) => ({
        ...step,
        completed: state.completedSteps.includes(step.id),
      }))
    },
  },
  mutations: {
    SET_VISIBILITY(state, isVisible) {
      state.isVisible = isVisible
    },
    MARK_STEP_COMPLETED(state, stepId) {
      if (!state.completedSteps.includes(stepId)) {
        state.completedSteps.push(stepId)
      }
    },
    LOAD_STATE(state, savedState) {
      if (savedState && savedState.completedSteps) {
        state.completedSteps = savedState.completedSteps
      }
    },
  },
  actions: {
    initializeWizard({ commit, state }) {
      // In a real app we might fetch this from the user's backend profile.
      // For now, load from localStorage to persist across refreshes
      const saved = localStorage.getItem('ruxailab_wizard_state')
      if (saved) {
        const parsed = JSON.parse(saved)
        commit('LOAD_STATE', parsed)
        // If not all steps completed, maybe we show it?
        // Or if they explicitly closed it, we respect that.
        // For simplicity, if progress < 100, we might show it. Let's rely on a separate flag for hasClosed.
        const hasClosed =
          localStorage.getItem('ruxailab_wizard_closed') === 'true'
        if (!hasClosed && parsed.completedSteps.length < state.totalSteps) {
          commit('SET_VISIBILITY', true)
        }
      } else {
        commit('SET_VISIBILITY', true)
      }
    },
    closeWizard({ commit, state }) {
      commit('SET_VISIBILITY', false)
      localStorage.setItem('ruxailab_wizard_closed', 'true')
    },
    completeStep({ commit, state }, stepId) {
      commit('MARK_STEP_COMPLETED', stepId)
      // Save state to localStorage
      localStorage.setItem(
        'ruxailab_wizard_state',
        JSON.stringify({
          completedSteps: state.completedSteps,
        }),
      )
    },
    openWizard({ commit }) {
      commit('SET_VISIBILITY', true)
      localStorage.setItem('ruxailab_wizard_closed', 'false')
    },
  },
}
