import {
  ALL_NASA_TLX_TASKS,
  getNASATLXResponses,
  getNASATLXTaskDefinitions,
} from '@/ux/UserTest/utils/nasaTlxData'

const scores = (value) => ({
  mentalDemand: value,
  physicalDemand: value,
  temporalDemand: value,
  performance: value,
  effort: value,
  frustration: value,
})

describe('NASA-TLX task analytics', () => {
  const userTasks = [
    { id: 'planning', taskName: 'Planning', taskType: 'nasa-tlx' },
    { id: 'checkout', taskName: 'Checkout', taskType: 'text-area' },
    { id: 'review', taskName: 'Review', taskType: 'nasa-tlx' },
  ]
  const answers = {
    user1: {
      fullName: 'User 1',
      tasks: [
        { taskId: 'planning', nasaTlxAnswers: scores(20) },
        { taskId: 'checkout' },
        { taskId: 'review', nasaTlxAnswers: scores(80) },
      ],
    },
    user2: {
      fullName: 'User 2',
      tasks: {
        planning: { taskId: 'planning', nasaTlxAnswers: scores(40) },
        checkout: { taskId: 'checkout' },
        review: { taskId: 'review', nasaTlxAnswers: scores(60) },
      },
    },
  }

  it('lists only tasks that contain a NASA-TLX form', () => {
    expect(getNASATLXTaskDefinitions(userTasks)).toEqual([
      { task: userTasks[0], index: 0, id: 'planning' },
      { task: userTasks[2], index: 2, id: 'review' },
    ])
  })

  it('isolates results by selected task and aggregates only for All tasks', () => {
    const definitions = getNASATLXTaskDefinitions(userTasks)

    const planning = getNASATLXResponses(answers, definitions, 0)
    expect(
      planning.map((response) => response.nasaTlxAnswers.mentalDemand),
    ).toEqual([20, 40])
    expect(planning.map((response) => response.taskName)).toEqual([
      'Planning',
      'Planning',
    ])

    const review = getNASATLXResponses(answers, definitions, 2)
    expect(
      review.map((response) => response.nasaTlxAnswers.mentalDemand),
    ).toEqual([80, 60])
    expect(review.every((response) => response.taskName === 'Review')).toBe(
      true,
    )

    const allTasks = getNASATLXResponses(
      answers,
      definitions,
      ALL_NASA_TLX_TASKS,
    )
    expect(allTasks).toHaveLength(4)
  })
})
