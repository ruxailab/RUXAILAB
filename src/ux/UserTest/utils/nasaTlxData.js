export const ALL_NASA_TLX_TASKS = 'all'

export function getNASATLXTaskDefinitions(userTasks) {
  const tasks = Array.isArray(userTasks)
    ? userTasks.map((task, index) => [String(index), task])
    : Object.entries(userTasks || {})

  return tasks
    .map(([key, task], index) => ({
      task,
      index,
      id: String(task?.taskId ?? task?.id ?? key),
    }))
    .filter(({ task }) => task?.taskType === 'nasa-tlx')
}

function getTaskAnswerForDefinition(tasks, taskDefinition) {
  if (!tasks || typeof tasks !== 'object') return null

  const entries = Array.isArray(tasks)
    ? tasks.map((taskAnswer, index) => [String(index), taskAnswer])
    : Object.entries(tasks)

  const matchingId = entries.find(
    ([, taskAnswer]) =>
      taskAnswer?.taskId != null &&
      String(taskAnswer.taskId) === taskDefinition.id,
  )
  if (matchingId) return matchingId[1]

  const legacyEntry = entries.find(
    ([key, taskAnswer]) =>
      taskAnswer?.taskId == null &&
      (key === String(taskDefinition.index) || key === taskDefinition.id),
  )
  return legacyEntry?.[1] ?? null
}

export function getNASATLXResponses(
  answersByUser,
  taskDefinitions,
  selectedTaskIndex = ALL_NASA_TLX_TASKS,
) {
  const selectedTasks =
    selectedTaskIndex === ALL_NASA_TLX_TASKS
      ? taskDefinitions
      : taskDefinitions.filter(({ index }) => index === selectedTaskIndex)

  return Object.values(answersByUser || {}).flatMap((answer) =>
    selectedTasks.flatMap((taskDefinition) => {
      const taskAnswer = getTaskAnswerForDefinition(
        answer?.tasks,
        taskDefinition,
      )
      const nasaTlxAnswers = taskAnswer?.nasaTlxAnswers
      if (
        !nasaTlxAnswers ||
        typeof nasaTlxAnswers !== 'object' ||
        Object.keys(nasaTlxAnswers).length === 0
      ) {
        return []
      }

      const scores = Object.values(nasaTlxAnswers)
      return [
        {
          ...taskAnswer,
          nasaTlxAnswers,
          taskIndex: taskDefinition.index,
          taskName:
            taskDefinition.task.taskName || `Task ${taskDefinition.index + 1}`,
          overallScore:
            scores.length > 0
              ? Math.round(
                  (scores.reduce((sum, score) => sum + score, 0) /
                    scores.length) *
                    10,
                ) / 10
              : 0,
          name: answer.fullName,
        },
      ]
    }),
  )
}

export function getNASATLXData(nasaTlxData) {
  // Return empty state if no data provided
  if (!nasaTlxData || nasaTlxData.length === 0) {
    return {
      averageOverallScore: 0,
      totalRespondents: 0,
      mostStressfulDimension: 'N/A',
      leastStressfulDimension: 'N/A',
      dimensionAverages: {
        mentalDemand: 0,
        physicalDemand: 0,
        temporalDemand: 0,
        performance: 0,
        effort: 0,
        frustration: 0,
      },
      responses: [],
    }
  }

  const dimensionTotals = {
    mentalDemand: 0,
    physicalDemand: 0,
    temporalDemand: 0,
    performance: 0,
    effort: 0,
    frustration: 0,
  }

  nasaTlxData.forEach((response) => {
    Object.keys(dimensionTotals).forEach((key) => {
      dimensionTotals[key] += response.nasaTlxAnswers[key] || 0
    })
  })

  const dimensionAverages = Object.keys(dimensionTotals).reduce((acc, key) => {
    acc[key] = Math.round((dimensionTotals[key] / nasaTlxData.length) * 10) / 10
    return acc
  }, {})

  const dimensionEntries = Object.entries(dimensionAverages)
  const mostStressful = dimensionEntries.reduce((max, current) =>
    current[1] > max[1] ? current : max,
  )
  const leastStressful = dimensionEntries.reduce((min, current) =>
    current[1] < min[1] ? current : min,
  )

  // Calculate overall score as average of all 6 dimensions
  const overallScore =
    Math.round(
      ((dimensionAverages.mentalDemand +
        dimensionAverages.physicalDemand +
        dimensionAverages.temporalDemand +
        dimensionAverages.performance +
        dimensionAverages.effort +
        dimensionAverages.frustration) /
        6) *
        10,
    ) / 10

  return {
    averageOverallScore: overallScore,
    totalRespondents: nasaTlxData.length,
    mostStressfulDimension: formatDimensionName(mostStressful[0]),
    leastStressfulDimension: formatDimensionName(leastStressful[0]),
    dimensionAverages,
    responses: nasaTlxData,
  }
}

function formatDimensionName(key) {
  const names = {
    mentalDemand: 'Mental Demand',
    physicalDemand: 'Physical Demand',
    temporalDemand: 'Temporal Demand',
    performance: 'Performance',
    effort: 'Effort',
    frustration: 'Frustration',
  }
  return names[key] || key
}

export const tlxDimensions = [
  {
    key: 'mentalDemand',
    label: 'Mental Demand',
    description: 'How mentally demanding was the task?',
    color: '#e91e63',
  },
  {
    key: 'physicalDemand',
    label: 'Physical Demand',
    description: 'How physically demanding was the task?',
    color: '#ff9800',
  },
  {
    key: 'temporalDemand',
    label: 'Temporal Demand',
    description: 'How hurried or rushed was the pace of the task?',
    color: '#f44336',
  },
  {
    key: 'performance',
    label: 'Performance',
    description: 'How successful were you in accomplishing the task?',
    color: '#4caf50',
  },
  {
    key: 'effort',
    label: 'Effort',
    description: 'How hard did you have to work to accomplish it?',
    color: '#2196f3',
  },
  {
    key: 'frustration',
    label: 'Frustration',
    description: 'How stressed, annoyed, or irritated were you?',
    color: '#9c27b0',
  },
]
