import HeuristicQuestionAnswer from '@/ux/Heuristic/models/HeuristicQuestionAnswer'

describe('HeuristicQuestionAnswer model', () => {
  it('initializes timeSpent to 0 when not provided', () => {
    const answer = new HeuristicQuestionAnswer({ heuristicId: 1 })
    expect(answer.timeSpent).toBe(0)
  })

  it('allows preset timeSpent value', () => {
    const answer = new HeuristicQuestionAnswer({ heuristicId: 2, timeSpent: 1234 })
    expect(answer.timeSpent).toBe(1234)
  })

  it('includes timeSpent in toFirestore output', () => {
    const answer = new HeuristicQuestionAnswer({ heuristicId: 3, timeSpent: 5000 })
    const firestore = answer.toFirestore()
    expect(firestore.timeSpent).toBe(5000)
  })

  it('toHeuristicQuestionAnswer copies timeSpent from raw data', () => {
    const raw = {
      heuristicId: 4,
      heuristicAnswer: null,
      heuristicComment: '',
      answerImageUrl: '',
      timeSpent: 777,
    }
    const converted = HeuristicQuestionAnswer.toHeuristicQuestionAnswer(raw, [])
    expect(converted.timeSpent).toBe(777)
  })
})
