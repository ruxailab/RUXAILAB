import { resolveHeuristicStudyMode } from './heuristicAnswerMode'

export const resolveAgentStudyMode = (test) => resolveHeuristicStudyMode(test)

/** One evaluation unit per heuristic except in detailed studies. */
export const prepareAgentStudy = (test) => {
  const studyMode = resolveAgentStudyMode(test)

  return {
    ...test,
    studyMode,
    testStructure: (test.testStructure || []).map((heuristic, index) => ({
      ...heuristic,
      questions:
        studyMode === 'detailed'
          ? heuristic.questions || []
          : [
              {
                id: heuristic.id ?? index,
                title: heuristic.title || heuristic.name || '',
                descriptions:
                  heuristic.descriptions ||
                  (heuristic.description
                    ? [{ text: heuristic.description }]
                    : []),
              },
            ],
    })),
  }
}
