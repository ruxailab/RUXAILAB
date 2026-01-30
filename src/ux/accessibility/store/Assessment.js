const state = {
  // Current selection state
  selectedPrincipleIdx: 0,
  selectedGuidelineIdx: 0,
  selectedRuleIdx: 0,

  // WCAG data
  wcagData: null,
  // Filtered WCAG data (based on config)
  filteredWcagData: null,

  // Assessment progress
  completedRules: [],
  notes: {},
  ruleAssessments: {}, // { ruleId: { severity: '', status: '', notes: [{ text, imageName }] } }

  // Configuration
  configuration: {
    complianceLevel: 'AA',
    includeNonInterference: true,
    showExperimentalRules: false,
    enableAutomaticSave: true,
    updatedAt: null,
  },
}

const getters = {
  // Get current principle (from filtered data)
  currentPrinciple: (state) => {
    return (
      state.filteredWcagData?.principles?.[state.selectedPrincipleIdx] || {}
    )
  },

  // Get current guideline (from filtered data)
  currentGuideline: (state, getters) => {
    const principle = getters.currentPrinciple
    return principle?.Guidelines?.[state.selectedGuidelineIdx] || {}
  },

  // Get current rule (from filtered data)
  currentRule: (state, getters) => {
    const guideline = getters.currentGuideline
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
      const legacyNote = state.notes[ruleId]
      const notes =
        typeof legacyNote === 'string'
          ? [{ text: legacyNote, imageName: null }]
          : []

      return {
        severity: '',
        status: '',
        notes,
      }
    }

    // Normalize notes
    let normalizedNotes = []

    if (Array.isArray(ra.notes)) {
      normalizedNotes = ra.notes.map((n) => {
        if (typeof n === 'string') {
          return { text: n, imageName: null }
        }
        return {
          text: n.text || '',
          imageName: n.imageName || null,
        }
      })
    } else if (typeof ra.notes === 'string') {
      normalizedNotes = [{ text: ra.notes, imageName: null }]
    }

    return {
      ...ra,
      notes: normalizedNotes,
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

  // Get overall completion percentage (filtered)
  completionPercentage: (state) => {
    if (!state.filteredWcagData) return 0
    const totalRules = state.filteredWcagData.principles.reduce(
      (total, principle) => {
        return (
          total +
          principle.Guidelines.reduce((guidelineTotal, guideline) => {
            return guidelineTotal + (guideline.rules?.length || 0)
          }, 0)
        )
      },
      0,
    )
    return totalRules > 0
      ? Math.round((state.completedRules.length / totalRules) * 100)
      : 0
  },

  // Get all assessments (filtered)
  getAllAssessments: (state, getters) => {
    if (!state.filteredWcagData) return {}
    const allAssessments = {}
    state.filteredWcagData.principles.forEach((principle) => {
      principle.Guidelines?.forEach((guideline) => {
        guideline.rules?.forEach((rule) => {
          const assessment = getters.getRuleAssessment(rule.id)
          if (assessment) {
            allAssessments[rule.id] = {
              ruleId: rule.id,
              ruleTitle: rule.title,
              principle: principle.title,
              guideline: guideline.title,
              level: rule.level,
              version: rule.version,
              ...assessment,
            }
          }
        })
      })
    })
    return allAssessments
  },

  // Get configuration
  getConfiguration: (state) => {
    return state.configuration
  },
}

// Helper: filter rules by compliance level, selected guidelines, and selected rules
function filterWcagByComplianceLevel(
  wcagData,
  complianceLevel,
  selectedGuidelines = null,
  selectedRulesByGuideline = null,
) {
  if (!wcagData?.principles) return { principles: [] }

  // Map complianceLevel to allowed levels
  let allowedLevels = []
  if (complianceLevel === 'A') allowedLevels = ['A']
  else if (complianceLevel === 'AA') allowedLevels = ['A', 'AA']
  else if (complianceLevel === 'AAA') allowedLevels = ['A', 'AA', 'AAA']
  else allowedLevels = ['A', 'AA', 'AAA']

  // Deep clone and filter
  const filteredPrinciples = wcagData.principles
    .map((principle) => {
      const filteredGuidelines =
        principle.Guidelines?.map((guideline) => {
          // Only include guideline if selected, if selection is present
          if (selectedGuidelines?.includes(guideline.id) === false) return null

          let filteredRules =
            guideline.rules?.filter((rule) =>
              allowedLevels.includes(rule.level),
            ) || []

          // If rules are selected for this guideline, filter further
          if (selectedRulesByGuideline?.[guideline.id]?.length > 0) {
            filteredRules = filteredRules.filter((rule) =>
              selectedRulesByGuideline[guideline.id]?.includes(rule.id),
            )
          }
          if (!filteredRules.length) return null

          return { ...guideline, rules: filteredRules }
        })?.filter((g) => g?.rules?.length > 0) || [] // Refactored Line

      if (!filteredGuidelines.length) return null
      return { ...principle, Guidelines: filteredGuidelines }
    })
    .filter((p) => p?.Guidelines?.length > 0) // Refactored Line

  return { principles: filteredPrinciples }
}

const mutations = {
  // Set configuration
  SET_CONFIGURATION(state, config) {
    state.configuration = { ...state.configuration, ...config }
  },

  // Set filtered WCAG data
  SET_FILTERED_WCAG_DATA(state, filteredData) {
    state.filteredWcagData = filteredData
  },
  // Set WCAG data
  SET_WCAG_DATA(state, data) {
    state.wcagData = data
  },

  // Set rule assessments (used when loading from Firestore)
  SET_RULE_ASSESSMENTS(state, assessments) {
    state.ruleAssessments = { ...assessments }
  },

  // Set completed rules
  SET_COMPLETED_RULES(state, ruleIds) {
    state.completedRules = [...ruleIds]
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
      notes = notes.map((n) =>
        typeof n === 'string'
          ? { text: n, imageName: null }
          : { text: n.text || '', imageName: n.imageName || null },
      )
    }
    state.ruleAssessments = {
      ...state.ruleAssessments,
      [ruleId]: {
        ...state.ruleAssessments[ruleId],
        ...assessment,
        ...(notes !== undefined ? { notes } : {}),
      },
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
      formattedNotes = formattedNotes.map((n) =>
        typeof n === 'string'
          ? { text: n, imageName: null }
          : { text: n.text || '', imageName: n.imageName || null },
      )
    }
    state.notes = {
      ...state.notes,
      [ruleId]: formattedNotes,
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
}

// Import the assessment controller
import * as assessmentController from '../controllers/assessmentController'
import { saveConfigData } from '../controllers/assessmentController'

const actions = {
  // Update configuration (local and Firestore)
  async updateConfiguration(
    { commit, dispatch, rootState },
    { configData, testId },
  ) {
    commit('SET_CONFIGURATION', configData)

    // Re-filter WCAG data if config changes
    if (configData.complianceLevel) {
      dispatch('filterByComplianceLevel', {
        complianceLevel: configData.complianceLevel,
        selectedGuidelines: configData.selectedGuidelines,
        selectedRulesByGuideline: configData.selectedRulesByGuideline,
      })
    }

    // Save configuration to Firestore
    try {
      const userId = rootState.Auth.user?.id // Corrected casing for Auth module
      if (!userId || !testId) throw new Error('User or Test not authenticated')

      await saveConfigData(userId, testId, configData)
    } catch {
      // Failed to save configuration to Firestore
    }
  },

  // Get configuration (local only)
  getConfiguration({ state }) {
    return state.configuration
  },

  // Filter WCAG data by compliance level
  filterByComplianceLevel({ state, commit }, complianceLevel) {
    if (!state.wcagData) return
    // Use selectedGuidelines and selectedRulesByGuideline from config if present
    const selectedGuidelines = state.configuration.selectedGuidelines || null
    const selectedRulesByGuideline =
      state.configuration.selectedRulesByGuideline || null
    const filtered = filterWcagByComplianceLevel(
      state.wcagData,
      complianceLevel,
      selectedGuidelines,
      selectedRulesByGuideline,
    )
    commit('SET_FILTERED_WCAG_DATA', filtered)
  },
  // Initialize the assessment with WCAG data
  async initializeAssessment({ commit, state, dispatch }) {
    try {
      commit('setLoading', true, { root: true })

      // Import the WCAG data
      const wcagData = await import('@/assets/WacgAxe.json')

      // Transform the data to match our expected format
      const transformedData = {
        principles: [],
      }

      // Process each principle
      if (Array.isArray(wcagData.default)) {
        wcagData.default.forEach((principleObj) => {
          const principleKey = Object.keys(principleObj)[0]
          const principle = principleObj[principleKey]

          if (principle) {
            const transformedPrinciple = {
              id: principleKey,
              title: principle.title || '',
              description: principle.description || '',
              Guidelines: [],
            }

            // Process guidelines if they exist
            if (Array.isArray(principle.Guidelines)) {
              principle.Guidelines.forEach((guideline) => {
                if (guideline) {
                  const transformedGuideline = {
                    id: guideline.id || '',
                    title: guideline.title || '',
                    description: guideline.description || '',
                    rules: [],
                  }

                  // Process rules if they exist
                  if (Array.isArray(guideline.Rules)) {
                    transformedGuideline.rules = guideline.Rules.map(
                      (rule) => ({
                        id: rule.id || '',
                        title: rule.title || '',
                        level: rule.level || '',
                        version: rule.version || '2.0',
                        criteria: Array.isArray(rule.criteria)
                          ? rule.criteria
                          : [],
                      }),
                    )
                  }

                  transformedPrinciple.Guidelines.push(transformedGuideline)
                }
              })
            }

            transformedData.principles.push(transformedPrinciple)
          }
        })
      }

      commit('SET_WCAG_DATA', transformedData)
      // Filter by config
      await dispatch(
        'filterByComplianceLevel',
        state.configuration.complianceLevel,
      )
      return transformedData
    } catch (error) {
      commit(
        'setError',
        { errorCode: 'ASSESSMENT_INIT_ERROR', message: error.message },
        { root: true },
      )
      throw error
    } finally {
      commit('setLoading', false, { root: true })
    }
  },

  // Navigation actions
  selectPrinciple({ commit, state }, index) {
    if (index >= 0 && index < state.wcagData.principles.length) {
      commit('SET_SELECTED_PRINCIPLE', index)
    }
  },

  selectGuideline({ commit, state }, index) {
    if (
      state.wcagData?.principles?.[state.selectedPrincipleIdx]?.Guidelines?.[
        index
      ]
    ) {
      commit('SET_SELECTED_GUIDELINE', index)
    }
  },

  selectRule({ commit, state }, index) {
    const guideline =
      state.wcagData?.principles?.[state.selectedPrincipleIdx]?.Guidelines?.[
        state.selectedGuidelineIdx
      ]
    if (guideline?.rules?.[index]) {
      commit('SET_SELECTED_RULE', index)
    }
  },

  // Toggle rule completion
  toggleRuleCompletion({ commit }, ruleId) {
    commit('TOGGLE_RULE_COMPLETION', ruleId)
  },

  // Navigate to next rule
  nextRule({ state, commit }) {
    const currentPrinciple =
      state.wcagData?.principles?.[state.selectedPrincipleIdx]
    if (!currentPrinciple) return

    const currentGuideline =
      currentPrinciple.Guidelines?.[state.selectedGuidelineIdx]
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
        const nextPrinciple =
          state.wcagData?.principles?.[state.selectedPrincipleIdx + 1]
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
    function moveToLastRuleOfPreviousGuideline(currentPrinciple) {
      const prevGuidelineIdx = state.selectedGuidelineIdx - 1
      const prevGuideline = currentPrinciple.Guidelines?.[prevGuidelineIdx]
      const prevRules = prevGuideline?.rules || []
      if (prevRules.length > 0) {
        commit('SET_SELECTED_GUIDELINE', prevGuidelineIdx)
        commit('SET_SELECTED_RULE', prevRules.length - 1)
        return true
      }
      return false
    }

    function moveToLastRuleOfPreviousPrinciple() {
      const prevPrincipleIdx = state.selectedPrincipleIdx - 1
      const prevPrinciple = state.wcagData?.principles?.[prevPrincipleIdx]
      if (!prevPrinciple?.Guidelines?.length) return
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

    if (state.selectedRuleIdx > 0) {
      commit('SET_SELECTED_RULE', state.selectedRuleIdx - 1)
      return
    }

    const currentPrinciple =
      state.wcagData?.principles?.[state.selectedPrincipleIdx]
    if (!currentPrinciple) return

    if (state.selectedGuidelineIdx > 0) {
      if (moveToLastRuleOfPreviousGuideline(currentPrinciple)) return
    } else if (state.selectedPrincipleIdx > 0) {
      moveToLastRuleOfPreviousPrinciple()
    }
  },

  // Update rule notes (kept for backward compatibility)
  updateRuleNotes({ commit }, { ruleId, notes }) {
    commit('UPDATE_RULE_NOTES', { ruleId, notes })
    commit('UPDATE_RULE_ASSESSMENT', {
      ruleId,
      assessment: { notes },
    })
  },

  // Reset assessment
  async resetAssessment({ commit, rootState }, { testId }) {
    try {
      const userId = rootState.auth.user?.uid
      if (userId && testId) {
        await assessmentController.deleteAssessment(userId, testId)
      }
      commit('RESET_ASSESSMENT')
    } catch (error) {
      throw error
    }
  },

  // Save assessment to Firestore
  async saveAssessment({ state }, { userId, testId, testType = 'manual' }) {
    try {
      if (!userId) throw new Error('User ID is required')

      // Convert rule assessments to array format
      const assessmentData = Object.entries(state.ruleAssessments).map(
        ([ruleId, assessment]) => ({
          ruleId,
          ...assessment,
          // Add any additional fields needed from the rule data
          ...(state.wcagData && {
            // Include rule metadata for easier querying
            ruleTitle: findRuleTitle(ruleId, state.wcagData),
            principle: findPrincipleForRule(ruleId, state.wcagData),
            guideline: findGuidelineForRule(ruleId, state.wcogData),
          }),
        }),
      )

      await assessmentController.saveAssessment(
        userId,
        testId,
        testType,
        assessmentData,
      )
      return { success: true }
    } catch (error) {
      throw error
    }
  },

  // Load assessment from Firestore
  async loadAssessment({ commit }, { userId, testId }) {
    try {
      if (!userId) throw new Error('User ID is required')

      const assessment = await assessmentController.getAssessment(
        userId,
        testId,
      )
      if (!assessment) return null

      // Update the store with loaded assessment data
      const ruleAssessments = {}
      const completedRules = []

      assessment.assessmentData.forEach((item) => {
        const { ruleId, status, severity, notes } = item
        ruleAssessments[ruleId] = { status, severity, notes }
        if (status) completedRules.push(ruleId)
      })

      commit('SET_RULE_ASSESSMENTS', ruleAssessments)
      commit('SET_COMPLETED_RULES', completedRules)

      return assessment
    } catch (error) {
      throw error
    }
  },

  // Update a single rule assessment
  async updateRuleAssessment(
    { commit, state },
    { userId, testId, ruleId, assessment },
  ) {
    try {
      if (!userId) throw new Error('User ID is required')

      // First update local state
      commit('UPDATE_RULE_ASSESSMENT', { ruleId, assessment })

      // Then update in Firestore
      await assessmentController.updateRuleAssessment(userId, testId, {
        ruleId,
        ...assessment,
        // Add any additional metadata
        ...(state.wcagData && {
          ruleTitle: findRuleTitle(ruleId, state.wcagData),
          principle: findPrincipleForRule(ruleId, state.wcagData),
          guideline: findGuidelineForRule(ruleId, state.wcogData),
        }),
      })

      return { success: true }
    } catch (error) {
      throw error
    }
  },

  // Add a new action to fetch configData from Firestore
  async fetchConfigData({ commit, state, rootState }, testId) {
    try {
      // Check if configData is already available in the store
      if (state.configuration && state.configuration.testId === testId) {
        return state.configuration
      }

      // Fetch userId from Auth module
      const userId = rootState.Auth.user?.id
      if (!userId) throw new Error('User not authenticated')

      // Fetch configData from Firestore (replace with actual Firestore fetch logic)
      const configData = await assessmentController.getConfigData(
        userId,
        testId,
      )

      // Commit the fetched configData to the store
      commit('SET_CONFIGURATION', configData)

      return configData
    } catch (error) {
      throw error
    }
  },
}

// Helper function to find rule title by ID
function findRuleTitle(ruleId, wcagData) {
  if (!wcagData?.principles) return ''

  for (const principle of wcagData.principles) {
    for (const guideline of principle.Guidelines || []) {
      const rule = guideline.rules?.find((r) => r.id === ruleId)
      if (rule) return rule.title
    }
  }
  return ''
}

// Helper function to find principle for a rule
function findPrincipleForRule(ruleId, wcagData) {
  if (!wcagData?.principles) return ''

  for (const principle of wcagData.principles) {
    for (const guideline of principle.Guidelines || []) {
      const rule = guideline.rules?.find((r) => r.id === ruleId)
      if (rule) return principle.title
    }
  }
  return ''
}

// Helper function to find guideline for a rule
function findGuidelineForRule(ruleId, wcagData) {
  if (!wcagData?.principles) return ''

  for (const principle of wcagData.principles) {
    for (const guideline of principle.Guidelines || []) {
      const rule = guideline.rules?.find((r) => r.id === ruleId)
      if (rule) return guideline.title
    }
  }
  return ''
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
