import { ref } from 'vue'
import { useCardSortingAnswerFilters } from '@/ux/CardSorting/composables/useCardSortingAnswerFilters'

describe('useCardSortingAnswerFilters', () => {
  const translate = (key, params) =>
    params ? `${key} ${params.number}` : key

  it('builds dynamic definitions and filters participants by pre-test answers', () => {
    const preTestQuestions = ref([
      {
        title: 'Role',
        selectionField: true,
        selectionFields: ['Designer', 'Developer'],
      },
      { title: 'Experience', textField: true },
    ])
    const answers = ref([
      {
        fullName: 'Alex Designer',
        preTestAnswer: [{ answer: 'Designer' }, { answer: 'Five years' }],
      },
      {
        fullName: 'Sam Developer',
        preTestAnswer: [{ answer: 'Developer' }, { answer: 'One year' }],
      },
    ])
    const filters = useCardSortingAnswerFilters({
      preTestQuestions,
      answers,
      t: translate,
    })

    expect(filters.filterDefinitions.value[0].items).toEqual([
      { title: 'analytics.all', value: '__ALL__' },
      { title: 'Designer', value: 'Designer' },
      { title: 'Developer', value: 'Developer' },
    ])
    expect(filters.filteredAnswers.value).toHaveLength(2)

    filters.onFilterChange(0, ['Designer'])
    expect(filters.filteredAnswers.value.map((answer) => answer.fullName)).toEqual([
      'Alex Designer',
    ])
    expect(filters.hasActiveFilters.value).toBe(true)

    filters.resetFilters()
    expect(filters.filteredAnswers.value).toHaveLength(2)
    expect(filters.hasActiveFilters.value).toBe(false)
  })

  it('filters open-ended answers by case-insensitive text', () => {
    const filters = useCardSortingAnswerFilters({
      preTestQuestions: ref([{ title: 'Experience', textField: true }]),
      answers: ref([
        { fullName: 'Alex', preTestAnswer: [{ answer: 'Five years' }] },
      ]),
      t: translate,
    })

    filters.selectedFilters.value[0] = 'FIVE'
    expect(filters.filteredAnswers.value.map((answer) => answer.fullName)).toEqual([
      'Alex',
    ])
  })
})
