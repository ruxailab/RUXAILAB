const state = {
  // Current selection state
  selectedPrincipleIdx: 0,
  selectedGuidelineIdx: 0,
  selectedRuleIdx: 0,

  // WCAG data
  wcagData: null,

  // UI state
  isLoading: false,
  error: null,

  // Assessment progress
  completedRules: [],
  notes: {},
  ruleAssessments: {} // { ruleId: { severity: '', status: '', notes: [{ text, imageName }] } }
}

const getters = {
  // Get current principle
  currentPrinciple: (state) => {
    console.log('Getting current principle:', state.selectedPrincipleIdx, state.wcagData?.principles)
    return state.wcagData?.principles?.[state.selectedPrincipleIdx] || {}
  },

  // Get current guideline
  currentGuideline: (state, getters) => {
    const principle = getters.currentPrinciple
    console.log('Getting current guideline:', state.selectedGuidelineIdx, principle?.Guidelines)
    return principle?.Guidelines?.[state.selectedGuidelineIdx] || {}
  },

  // Get current rule
  currentRule: (state, getters) => {
    const guideline = getters.currentGuideline
    console.log('Getting current rule:', state.selectedRuleIdx, guideline?.rules)
    return guideline?.rules?.[state.selectedRuleIdx] || {}
  },

  // Get completion status for a rule
  isRuleCompleted: (state) => (ruleId) => {
    return state.completedRules.includes(ruleId)
  },

  // Get assessment for a rule
  getRuleAssessment: (state) => (ruleId) => {
    const ra = state.ruleAssessments[ruleId]
    if (!ra) {
      // fallback for legacy notes
      return {
        severity: '',
        status: '',
        notes: typeof state.notes[ruleId] === 'string'
          ? [{ text: state.notes[ruleId], imageName: null }]
          : []
      }
    }
    // Always return notes as array of { text, imageName }
    return {
      ...ra,
      notes: Array.isArray(ra.notes)
        ? ra.notes.map(n =>
          typeof n === 'string'
            ? { text: n, imageName: null }
            : { text: n.text || '', imageName: n.imageName || null }
        )
        : (typeof ra.notes === 'string'
          ? [{ text: ra.notes, imageName: null }]
          : [])
    }
  },

  // Get notes for a rule (kept for backward compatibility)
  getRuleNotes: (state) => (ruleId) => {
    const ra = state.ruleAssessments[ruleId]
    if (ra && Array.isArray(ra.notes)) {
      return ra.notes
    }
    if (ra && typeof ra.notes === 'string') {
      return [{ text: ra.notes, imageName: null }]
    }
    if (typeof state.notes[ruleId] === 'string') {
      return [{ text: state.notes[ruleId], imageName: null }]
    }
    return []
  },

  // Get overall completion percentage
  completionPercentage: (state) => {
    if (!state.wcagData) return 0

    const totalRules = state.wcagData.principles.reduce((total, principle) => {
      return total + principle.Guidelines.reduce((guidelineTotal, guideline) => {
        return guidelineTotal + (guideline.rules?.length || 0)
      }, 0)
    }, 0)

    return totalRules > 0 ? Math.round((state.completedRules.length / totalRules) * 100) : 0
  }
}

const mutations = {
  // Set WCAG data
  SET_WCAG_DATA(state, data) {
    state.wcagData = data
  },

  // Navigation
  SET_SELECTED_PRINCIPLE(state, index) {
    state.selectedPrincipleIdx = index
    state.selectedGuidelineIdx = 0
    state.selectedRuleIdx = 0
  },

  SET_SELECTED_GUIDELINE(state, index) {
    state.selectedGuidelineIdx = index
    state.selectedRuleIdx = 0
  },

  SET_SELECTED_RULE(state, index) {
    state.selectedRuleIdx = index
  },

  // Toggle rule completion
  TOGGLE_RULE_COMPLETION(state, ruleId) {
    const index = state.completedRules.indexOf(ruleId)
    if (index === -1) {
      state.completedRules.push(ruleId)
    } else {
      state.completedRules.splice(index, 1)
    }
  },

  // Update rule assessment
  UPDATE_RULE_ASSESSMENT(state, { ruleId, assessment }) {
    // Always store notes as array of { text, imageName }
    let notes = assessment.notes
    if (notes && !Array.isArray(notes)) {
      if (typeof notes === 'string') {
        notes = [{ text: notes, imageName: null }]
      } else {
        notes = []
      }
    }
    if (Array.isArray(notes)) {
      notes = notes.map(n =>
        typeof n === 'string'
          ? { text: n, imageName: null }
          : { text: n.text || '', imageName: n.imageName || null }
      )
    }
    state.ruleAssessments = {
      ...state.ruleAssessments,
      [ruleId]: {
        ...state.ruleAssessments[ruleId],
        ...assessment,
        ...(notes !== undefined ? { notes } : {})
      }
    }
  },

  // Update notes for a rule
  UPDATE_RULE_NOTES(state, { ruleId, notes }) {
    // Always store notes as array of { text, imageName }
    let formattedNotes = notes
    if (notes && !Array.isArray(notes)) {
      if (typeof notes === 'string') {
        formattedNotes = [{ text: notes, imageName: null }]
      } else {
        formattedNotes = []
      }
    }
    if (Array.isArray(formattedNotes)) {
      formattedNotes = formattedNotes.map(n =>
        typeof n === 'string'
          ? { text: n, imageName: null }
          : { text: n.text || '', imageName: n.imageName || null }
      )
    }
    state.notes = {
      ...state.notes,
      [ruleId]: formattedNotes
    }
    if (!state.ruleAssessments[ruleId]) {
      state.ruleAssessments[ruleId] = {}
    }
    state.ruleAssessments[ruleId].notes = formattedNotes
  },

  // Reset assessment
  RESET_ASSESSMENT(state) {
    state.selectedPrincipleIdx = 0
    state.selectedGuidelineIdx = 0
    state.selectedRuleIdx = 0
    state.completedRules = []
    state.notes = {}
  },

  // Loading and error states
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading
  },

  SET_ERROR(state, error) {
    state.error = error
  }
}

const actions = {
  // Initialize the assessment with WCAG data
  async initializeAssessment({ commit, state }) {
    try {
      commit('SET_LOADING', true)
      console.log('Initializing assessment...')

      // Import the WCAG data
      const wcagData = await import('@/assets/WacgAxe.json')
      console.log('Raw WCAG data:', wcagData)

      // Transform the data to match our expected format
      const transformedData = {
        principles: []
      }

      // Process each principle
      if (Array.isArray(wcagData.default)) {
        wcagData.default.forEach(principleObj => {
          const principleKey = Object.keys(principleObj)[0]
          const principle = principleObj[principleKey]

          if (principle) {
            const transformedPrinciple = {
              id: principleKey,
              title: principle.title || '',
              description: principle.description || '',
              Guidelines: []
            }

            // Process guidelines if they exist
            if (Array.isArray(principle.Guidelines)) {
              principle.Guidelines.forEach(guideline => {
                if (guideline) {
                  const transformedGuideline = {
                    id: guideline.id || '',
                    title: guideline.title || '',
                    description: guideline.description || '',
                    rules: []
                  }

                  // Process rules if they exist
                  if (Array.isArray(guideline.Rules)) {
                    transformedGuideline.rules = guideline.Rules.map(rule => ({
                      id: rule.id || '',
                      title: rule.title || '',
                      level: rule.level || '',
                      version: rule.version || '2.0',
                      criteria: Array.isArray(rule.criteria) ? rule.criteria : []
                    }))
                  }

                  transformedPrinciple.Guidelines.push(transformedGuideline)
                }
              })
            }

            transformedData.principles.push(transformedPrinciple)
          }
        })
      }

      console.log('Transformed data:', transformedData)
      commit('SET_WCAG_DATA', transformedData)
      return transformedData
    } catch (error) {
      console.error('Error initializing assessment:', error)
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Navigation actions
  selectPrinciple({ commit, state }, index) {
    if (index >= 0 && index < state.wcagData.principles.length) {
      commit('SET_SELECTED_PRINCIPLE', index)
    }
  },

  selectGuideline({ commit, state }, index) {
    if (state.wcagData?.principles?.[state.selectedPrincipleIdx]?.Guidelines?.[index]) {
      commit('SET_SELECTED_GUIDELINE', index)
    }
  },

  selectRule({ commit, state }, index) {
    const guideline = state.wcagData?.principles?.[state.selectedPrincipleIdx]?.Guidelines?.[state.selectedGuidelineIdx]
    if (guideline?.rules?.[index]) {
      commit('SET_SELECTED_RULE', index)
    }
  },

  // Toggle rule completion
  toggleRuleCompletion({ commit }, ruleId) {
    commit('TOGGLE_RULE_COMPLETION', ruleId)
  },

  // Navigate to next rule
  nextRule({ state, commit, dispatch }) {
    const currentPrinciple = state.wcagData?.principles?.[state.selectedPrincipleIdx]
    if (!currentPrinciple) return

    const currentGuideline = currentPrinciple.Guidelines?.[state.selectedGuidelineIdx]
    if (!currentGuideline) return

    const currentRules = currentGuideline.rules || []
    const nextRuleIdx = state.selectedRuleIdx + 1

    if (nextRuleIdx < currentRules.length) {
      // Move to next rule in current guideline
      commit('SET_SELECTED_RULE', nextRuleIdx)
    } else {
      // Move to first rule of next guideline
      const nextGuidelineIdx = state.selectedGuidelineIdx + 1
      const nextGuideline = currentPrinciple.Guidelines?.[nextGuidelineIdx]

      if (nextGuideline?.rules?.length > 0) {
        // Next guideline has rules, go to first rule
        commit('SET_SELECTED_GUIDELINE', nextGuidelineIdx)
        commit('SET_SELECTED_RULE', 0)
      } else {
        // No more guidelines in current principle, go to next principle
        const nextPrinciple = state.wcagData?.principles?.[state.selectedPrincipleIdx + 1]
        if (nextPrinciple?.Guidelines?.length > 0) {
          commit('SET_SELECTED_PRINCIPLE', state.selectedPrincipleIdx + 1)
          commit('SET_SELECTED_GUIDELINE', 0)
          commit('SET_SELECTED_RULE', 0)
        }
      }
    }
  },

  // Navigate to previous rule
  prevRule({ state, commit }) {
    if (state.selectedRuleIdx > 0) {
      // Move to previous rule in current guideline
      commit('SET_SELECTED_RULE', state.selectedRuleIdx - 1)
    } else {
      // Move to last rule of previous guideline
      const currentPrinciple = state.wcagData?.principles?.[state.selectedPrincipleIdx]
      if (!currentPrinciple) return

      if (state.selectedGuidelineIdx > 0) {
        // Previous guideline in same principle
        const prevGuidelineIdx = state.selectedGuidelineIdx - 1
        const prevGuideline = currentPrinciple.Guidelines?.[prevGuidelineIdx]
        const prevRules = prevGuideline?.rules || []

        if (prevRules.length > 0) {
          commit('SET_SELECTED_GUIDELINE', prevGuidelineIdx)
          commit('SET_SELECTED_RULE', prevRules.length - 1)
        }
      } else if (state.selectedPrincipleIdx > 0) {
        // Previous principle
        const prevPrincipleIdx = state.selectedPrincipleIdx - 1
        const prevPrinciple = state.wcagData?.principles?.[prevPrincipleIdx]
        if (!prevPrinciple?.Guidelines?.length) return

        // Find last guideline with rules
        for (let i = prevPrinciple.Guidelines.length - 1; i >= 0; i--) {
          const guideline = prevPrinciple.Guidelines[i]
          if (guideline.rules?.length > 0) {
            commit('SET_SELECTED_PRINCIPLE', prevPrincipleIdx)
            commit('SET_SELECTED_GUIDELINE', i)
            commit('SET_SELECTED_RULE', guideline.rules.length - 1)
            break
          }
        }
      }
    }
  },

  // Update rule assessment
  updateRuleAssessment({ commit }, { ruleId, severity, status, notes }) {
    // Accept notes as array or string
    commit('UPDATE_RULE_ASSESSMENT', {
      ruleId,
      assessment: { severity, status, notes }
    })
    if (notes !== undefined) {
      commit('UPDATE_RULE_NOTES', { ruleId, notes })
    }
  },

  // Update rule notes (kept for backward compatibility)
  updateRuleNotes({ commit }, { ruleId, notes }) {
    commit('UPDATE_RULE_NOTES', { ruleId, notes })
    commit('UPDATE_RULE_ASSESSMENT', {
      ruleId,
      assessment: { notes }
    })
  },

  // Reset assessment
  resetAssessment({ commit }) {
    commit('RESET_ASSESSMENT')
  },

  // Save assessment (in a real app, this would save to a backend)
  async saveAssessment({ state }) {
    // In a real app, you would save the assessment data to a backend
    return {
      completedRules: state.completedRules,
      notes: state.notes,
      timestamp: new Date().toISOString()
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
