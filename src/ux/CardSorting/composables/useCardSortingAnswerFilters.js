import { computed, ref } from 'vue'

export function useCardSortingAnswerFilters({ preTestQuestions, answers, t }) {
  const searchTerm = ref('')
  const selectedFilters = ref({})
  const showFilters = ref(true)
  const allValue = '__ALL__'

  const filterDefinitions = computed(() =>
    preTestQuestions.value.map((question, index) => {
      const currentQuestion = question || {}
      const optionsSet = new Set(
        Array.isArray(currentQuestion.selectionFields)
          ? currentQuestion.selectionFields
          : [],
      )

      answers.value.forEach((participant) => {
        const answer = participant?.preTestAnswer?.[index]?.answer
        const values = Array.isArray(answer) ? answer : [answer]
        values.forEach((value) => {
          if (value !== undefined && value !== null && value !== '') {
            optionsSet.add(value)
          }
        })
      })

      const options = [...optionsSet].sort((a, b) =>
        String(a).localeCompare(String(b)),
      )
      const isSelection =
        currentQuestion.selectionField === true ||
        currentQuestion.type === 'selection' ||
        (Array.isArray(currentQuestion.selectionFields) &&
          currentQuestion.selectionFields.length > 0)
      const isCategorical =
        isSelection || (options.length >= 2 && options.length <= 50)

      return {
        index,
        title:
          currentQuestion.title ||
          currentQuestion.question ||
          t('analytics.question', { number: index + 1 }),
        isCategorical,
        items: isCategorical
          ? [
              { title: t('analytics.all'), value: allValue },
              ...options.map((option) => ({
                title: String(option),
                value: option,
              })),
            ]
          : [],
      }
    }),
  )

  const hasActiveFilters = computed(
    () =>
      !!searchTerm.value.trim() ||
      Object.values(selectedFilters.value).some((filter) =>
        Array.isArray(filter)
          ? filter.length > 0 && !filter.includes(allValue)
          : !!filter,
      ),
  )

  const filteredAnswers = computed(() => {
    const term = searchTerm.value.trim().toLowerCase()
    return answers.value.filter((participant) => {
      if (term && !(participant.fullName || '').toLowerCase().includes(term)) {
        return false
      }

      return filterDefinitions.value.every((definition) => {
        const filter = selectedFilters.value[definition.index]
        if (
          filter === undefined ||
          filter === null ||
          filter === '' ||
          (Array.isArray(filter) &&
            (filter.length === 0 || filter.includes(allValue)))
        ) {
          return true
        }

        const response =
          participant.preTestAnswer?.[definition.index]?.answer ?? ''
        if (definition.isCategorical) {
          const values = Array.isArray(response) ? response : [response]
          return (
            Array.isArray(filter) &&
            values.some((value) => filter.includes(value))
          )
        }

        return String(response)
          .toLowerCase()
          .includes(String(filter).toLowerCase())
      })
    })
  })

  const onFilterChange = (index, value) => {
    if (!value?.length) {
      selectedFilters.value[index] = []
    } else if (value.includes(allValue)) {
      selectedFilters.value[index] = [allValue]
    } else {
      selectedFilters.value[index] = value
    }
  }

  const resetFilters = () => {
    searchTerm.value = ''
    selectedFilters.value = {}
  }

  const toggleFilters = () => {
    showFilters.value = !showFilters.value
  }

  return {
    searchTerm,
    selectedFilters,
    showFilters,
    filterDefinitions,
    hasActiveFilters,
    filteredAnswers,
    onFilterChange,
    resetFilters,
    toggleFilters,
  }
}
