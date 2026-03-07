import HeuristicQuestionAnswer from '@/ux/Heuristic/models/HeuristicQuestionAnswer'

describe('HeuristicQuestionAnswer', () => {
  describe('constructor', () => {
    it('sets all fields from provided data', () => {
      const data = {
        heuristicId: 1,
        heuristicAnswer: { text: 'Good', value: 4 },
        heuristicComment: 'Looks fine',
        answerImageUrl: 'https://example.com/img.png',
      }

      const answer = new HeuristicQuestionAnswer(data)

      expect(answer.heuristicId).toBe(1)
      expect(answer.heuristicAnswer).toEqual({ text: 'Good', value: 4 })
      expect(answer.heuristicComment).toBe('Looks fine')
      expect(answer.answerImageUrl).toBe('https://example.com/img.png')
    })

    it('defaults heuristicAnswer to empty object when undefined', () => {
      const answer = new HeuristicQuestionAnswer({})

      expect(answer.heuristicAnswer).toEqual({})
    })

    it('handles no arguments (empty constructor)', () => {
      const answer = new HeuristicQuestionAnswer()

      expect(answer.heuristicId).toBeUndefined()
      expect(answer.heuristicAnswer).toEqual({})
      expect(answer.heuristicComment).toBeUndefined()
      expect(answer.answerImageUrl).toBeUndefined()
    })
  })

  describe('toFirestore', () => {
    it('returns correct Firestore shape', () => {
      const answer = new HeuristicQuestionAnswer({
        heuristicId: 5,
        heuristicAnswer: { text: 'Bad', value: 1 },
        heuristicComment: 'Poor contrast',
        answerImageUrl: 'https://example.com/screenshot.png',
      })

      expect(answer.toFirestore()).toEqual({
        heuristicId: 5,
        heuristicAnswer: { text: 'Bad', value: 1 },
        heuristicComment: 'Poor contrast',
        answerImageUrl: 'https://example.com/screenshot.png',
      })
    })

    it('defaults answerImageUrl to empty string when falsy', () => {
      const answer = new HeuristicQuestionAnswer({ heuristicId: 1 })
      const result = answer.toFirestore()

      expect(result.answerImageUrl).toBe('')
    })

    it('preserves answerImageUrl when provided', () => {
      const answer = new HeuristicQuestionAnswer({
        answerImageUrl: 'https://img.example.com/a.png',
      })

      expect(answer.toFirestore().answerImageUrl).toBe('https://img.example.com/a.png')
    })
  })

  describe('toHeuristicQuestionAnswer (static factory)', () => {
    const testOptions = [
      { text: 'Very Bad', value: 0 },
      { text: 'Bad', value: 1 },
      { text: 'Neutral', value: 2 },
      { text: 'Good', value: 3 },
      { text: 'Very Good', value: 4 },
    ]

    it('keeps heuristicAnswer as-is when it already has a text property', () => {
      const data = {
        heuristicId: 10,
        heuristicAnswer: { text: 'Custom', value: 99 },
        heuristicComment: 'Already formatted',
      }

      const result = HeuristicQuestionAnswer.toHeuristicQuestionAnswer(data, testOptions)

      expect(result).toBeInstanceOf(HeuristicQuestionAnswer)
      expect(result.heuristicAnswer).toEqual({ text: 'Custom', value: 99 })
    })

    it('converts a numeric heuristicAnswer to object using testOptions', () => {
      const data = {
        heuristicId: 10,
        heuristicAnswer: 3,
        heuristicComment: 'Nice',
      }

      const result = HeuristicQuestionAnswer.toHeuristicQuestionAnswer(data, testOptions)

      expect(result).toBeInstanceOf(HeuristicQuestionAnswer)
      expect(result.heuristicAnswer).toEqual({ text: 'Good', value: 3 })
    })

    it('sets text to empty string when numeric value is not found in testOptions', () => {
      const data = {
        heuristicId: 10,
        heuristicAnswer: 999,
      }

      const result = HeuristicQuestionAnswer.toHeuristicQuestionAnswer(data, testOptions)

      expect(result.heuristicAnswer).toEqual({ text: '', value: 999 })
    })

    it('spreads remaining data fields onto the instance', () => {
      const data = {
        heuristicId: 7,
        heuristicAnswer: 0,
        heuristicComment: 'Terrible',
        answerImageUrl: 'https://img.test/x.png',
      }

      const result = HeuristicQuestionAnswer.toHeuristicQuestionAnswer(data, testOptions)

      expect(result.heuristicId).toBe(7)
      expect(result.heuristicComment).toBe('Terrible')
      expect(result.answerImageUrl).toBe('https://img.test/x.png')
      expect(result.heuristicAnswer).toEqual({ text: 'Very Bad', value: 0 })
    })

    it('handles null heuristicAnswer gracefully', () => {
      const data = {
        heuristicId: 1,
        heuristicAnswer: null,
      }

      const result = HeuristicQuestionAnswer.toHeuristicQuestionAnswer(data, testOptions)

      expect(result.heuristicAnswer).toEqual({ text: '', value: null })
    })
  })
})
