/**
 * Validates Heuristic draft content.
 * @param {object} draft
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateHeuristicDraft(draft) {
  const errors = []
  const structure = draft?.testStructure

  if (!Array.isArray(structure) || structure.length < 1) {
    errors.push('testStructure must be a non-empty array for HEURISTIC')
    return { valid: false, errors }
  }

  structure.forEach((heuristic, hIndex) => {
    if (!heuristic?.title || String(heuristic.title).trim() === '') {
      errors.push(`testStructure[${hIndex}].title is required`)
    }

    const questions = heuristic?.questions
    if (!Array.isArray(questions) || questions.length < 1) {
      errors.push(`testStructure[${hIndex}].questions must have at least 1 item`)
      return
    }

    questions.forEach((question, qIndex) => {
      if (!question?.title || String(question.title).trim() === '') {
        errors.push(
          `testStructure[${hIndex}].questions[${qIndex}].title is required`,
        )
      }
    })
  })

  return { valid: errors.length === 0, errors }
}
