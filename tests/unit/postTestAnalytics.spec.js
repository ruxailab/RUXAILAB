import {
  getPostTestSelectionCounts,
  getPostTestTextAnswers,
} from '@/ux/UserTest/utils/postTestAnalytics'

describe('post-test analytics', () => {
  it('counts selection answers from every session, including multi-select answers', () => {
    const questions = [
      { selectionFields: ['Yes', 'No', 'Maybe'] },
    ]
    const sessions = [
      { postTestAnswer: [{ answer: 'Yes' }] },
      { postTestAnswer: [{ answer: ['No', 'Maybe'] }] },
      { postTestAnswer: [] },
      {},
    ]

    expect(getPostTestSelectionCounts(0, questions, sessions)).toEqual({
      Yes: 1,
      No: 1,
      Maybe: 1,
    })
  })

  it('returns every non-empty text answer instead of only the first session answer', () => {
    const sessions = [
      { postTestAnswer: [{ answer: 'First response' }] },
      { postTestAnswer: [{ answer: 'Second response' }] },
      { postTestAnswer: [{ answer: '' }] },
      { postTestAnswer: [] },
      {},
    ]

    expect(getPostTestTextAnswers(0, sessions)).toEqual([
      'First response',
      'Second response',
    ])
  })

  it('uses the configured questions even when the first session has no answers', () => {
    const questions = [
      { selectionFields: ['Yes', 'No'] },
      { selectionFields: [] },
    ]
    const sessions = [
      { postTestAnswer: [] },
      { postTestAnswer: [{ answer: 'No' }, { answer: 'Free response' }] },
    ]

    expect(getPostTestSelectionCounts(0, questions, sessions)).toEqual({
      Yes: 0,
      No: 1,
    })
    expect(getPostTestTextAnswers(1, sessions)).toEqual(['Free response'])
  })
})
