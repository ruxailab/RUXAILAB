import { calculateUserStorageUsage } from '@/shared/utils/storageUtils'

describe('storageUtils.js', () => {
  describe('calculateUserStorageUsage', () => {
    it('should return 0 for a user with no answers or tests', () => {
      const user = { myAnswers: {}, myTests: {} }
      expect(calculateUserStorageUsage(user)).toBe(0)
    })

    it('should calculate storage correctly for answers with media', () => {
      const user = {
        myAnswers: {
          answer1: {
            tasks: [
              { videoRecordURL: 'http://video' }, // 50MB
              { audioRecordURL: 'http://audio' }, // 10MB
            ],
          },
          answer2: {
            tasks: {
              task1: { screenRecordURL: 'http://screen' }, // 100MB
            },
          },
        },
        myTests: {},
      }
      // Response base: 0.01 * 2 = 0.02
      // Media: 50 + 10 + 100 = 160
      // Total: 160.02
      expect(calculateUserStorageUsage(user)).toBe(160.02)
    })

    it('should calculate storage correctly for tests with answers', () => {
      const user = {
        myAnswers: {},
        myTests: {
          test1: {
            answers: [
              {
                tasks: [
                  { webcamRecordURL: 'http://webcam' }, // 50MB
                ],
              },
            ],
          },
        },
      }
      // Response base: 0.01 * 1 = 0.01
      // Media: 50
      // Total: 50.01
      expect(calculateUserStorageUsage(user)).toBe(50.01)
    })

    it('should handle missing properties gracefully', () => {
      const user = {}
      expect(calculateUserStorageUsage(user)).toBe(0)
    })
  })
})
