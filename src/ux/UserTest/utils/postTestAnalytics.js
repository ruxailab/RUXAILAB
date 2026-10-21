export function getPostTestSelectionCounts(questionIndex, questions, sessions) {
  const options = questions?.[questionIndex]?.selectionFields
  if (!Array.isArray(options)) return {}

  const counts = Object.fromEntries(options.map((option) => [option, 0]))

  sessions.forEach((session) => {
    const answer = session.postTestAnswer?.[questionIndex]?.answer
    const selectedOptions = Array.isArray(answer) ? answer : [answer]

    selectedOptions.forEach((option) => {
      if (Object.hasOwn(counts, option)) counts[option]++
    })
  })

  return counts
}

export function getPostTestTextAnswers(questionIndex, sessions) {
  return sessions.flatMap((session) => {
    const answer = session.postTestAnswer?.[questionIndex]?.answer
    if (answer === undefined || answer === null || answer === '') return []
    return (Array.isArray(answer) ? answer : [answer]).map(String)
  })
}
