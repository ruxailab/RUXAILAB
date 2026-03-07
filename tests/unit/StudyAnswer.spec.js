import StudyAnswer from '@/shared/models/StudyAnswer'

describe('StudyAnswer', () => {
  describe('constructor', () => {
    it('sets type from provided data', () => {
      const answer = new StudyAnswer({ type: 'HEURISTIC' })
      expect(answer.type).toBe('HEURISTIC')
    })

    it('handles missing type', () => {
      const answer = new StudyAnswer({})
      expect(answer.type).toBeUndefined()
    })

    it('handles no arguments', () => {
      const answer = new StudyAnswer()
      expect(answer.type).toBeUndefined()
    })
  })

  describe('toFirestore', () => {
    it('returns correct shape with type', () => {
      const answer = new StudyAnswer({ type: 'USER' })
      expect(answer.toFirestore()).toEqual({ type: 'USER' })
    })

    it('defaults type to empty string when null', () => {
      const answer = new StudyAnswer({ type: null })
      expect(answer.toFirestore()).toEqual({ type: '' })
    })

    it('defaults type to empty string when undefined', () => {
      const answer = new StudyAnswer({})
      expect(answer.toFirestore()).toEqual({ type: '' })
    })
  })
})
