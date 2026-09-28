/**
 * Tests for SentimentAnalyticsController.
 *
 * Covers: happy-path, doc-not-found, independent facial/text null handling,
 * bySignal vs legacy flat key fallback, and Firestore errors.
 */

jest.mock('@/app/plugins/firebase', () => ({
  db: {},
  auth: {},
  storage: {},
}))

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  getFirestore: jest.fn(),
  connectFirestoreEmulator: jest.fn(),
}))

const { getDoc } = require('firebase/firestore')
const SentimentAnalyticsController =
  require('@/ai/sentiment/SentimentAnalyticsController').default

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a minimal SentimentSignalSlice as stored by the Cloud Function
 * (bySignal sub-object).
 */
const makeSlice = ({
  facialPositive = 60,
  facialNegative = 20,
  facialNeutral = 20,
  facialSampleCount = 3,
  textPositive = 70,
  textNegative = 10,
  textNeutral = 20,
  textSampleCount = 2,
} = {}) => ({
  combined: {
    Positive: 65,
    Neutral: 20,
    Negative: 15,
    sampleCount: 5,
    dominant: 'Positive',
  },
  bySignal: {
    facial: {
      Positive: facialPositive,
      Neutral: facialNeutral,
      Negative: facialNegative,
      sampleCount: facialSampleCount,
      dominant: 'Positive',
    },
    text: {
      Positive: textPositive,
      Neutral: textNeutral,
      Negative: textNegative,
      sampleCount: textSampleCount,
      dominant: 'Positive',
    },
  },
})

const mockSnap = (exists, data = {}) => ({
  exists: () => exists,
  data: () => data,
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SentimentAnalyticsController', () => {
  let controller

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new SentimentAnalyticsController()
  })

  it('returns null when answersDocId is falsy', async () => {
    const result = await controller.getByAnswersDocId(null)
    expect(result).toBeNull()
    expect(getDoc).not.toHaveBeenCalled()
  })

  it('returns null when Firestore document does not exist', async () => {
    getDoc.mockResolvedValue(mockSnap(false))
    const result = await controller.getByAnswersDocId('answers-1')
    expect(result).toBeNull()
  })

  it('returns normalized general + tasks on success', async () => {
    const data = {
      general: makeSlice(),
      tasks: {
        task0: makeSlice({ facialPositive: 64, textPositive: 78 }),
        task1: makeSlice({ facialPositive: 44, textPositive: 58 }),
      },
      updatedAt: 'ts',
    }
    getDoc.mockResolvedValue(mockSnap(true, data))

    const result = await controller.getByAnswersDocId('answers-1')

    expect(result).not.toBeNull()
    expect(result.tasks.task0.facial.Positive).toBe(64)
    expect(result.tasks.task0.text.Positive).toBe(78)
    expect(result.tasks.task1.facial.Positive).toBe(44)
    expect(result.updatedAt).toBe('ts')
  })

  it('returns null facial bucket when facial sampleCount is 0', async () => {
    const slice = makeSlice()
    slice.bySignal.facial.sampleCount = 0

    getDoc.mockResolvedValue(
      mockSnap(true, {
        tasks: { task0: slice },
        updatedAt: null,
      }),
    )

    const result = await controller.getByAnswersDocId('answers-1')
    expect(result.tasks.task0.facial).toBeNull()
    // text must still be populated
    expect(result.tasks.task0.text).not.toBeNull()
    expect(result.tasks.task0.text.Positive).toBe(70)
  })

  it('returns null text bucket when text sampleCount is 0', async () => {
    const slice = makeSlice()
    slice.bySignal.text.sampleCount = 0

    getDoc.mockResolvedValue(
      mockSnap(true, {
        tasks: { task0: slice },
        updatedAt: null,
      }),
    )

    const result = await controller.getByAnswersDocId('answers-1')
    expect(result.tasks.task0.text).toBeNull()
    // facial must still be populated
    expect(result.tasks.task0.facial).not.toBeNull()
    expect(result.tasks.task0.facial.Positive).toBe(60)
  })

  it('falls back to legacy flat facial/text keys when bySignal is absent', async () => {
    const flatSlice = {
      facial: { Positive: 55, Neutral: 25, Negative: 20, sampleCount: 2 },
      text: { Positive: 66, Neutral: 14, Negative: 20, sampleCount: 1 },
    }

    getDoc.mockResolvedValue(
      mockSnap(true, { tasks: { task0: flatSlice }, updatedAt: null }),
    )

    const result = await controller.getByAnswersDocId('answers-1')
    expect(result.tasks.task0.facial.Positive).toBe(55)
    expect(result.tasks.task0.text.Positive).toBe(66)
  })

  it('returns both buckets null when entire slice is missing', async () => {
    getDoc.mockResolvedValue(
      mockSnap(true, { tasks: { task0: null }, updatedAt: null }),
    )

    const result = await controller.getByAnswersDocId('answers-1')
    expect(result.tasks.task0.facial).toBeNull()
    expect(result.tasks.task0.text).toBeNull()
  })

  it('propagates Firestore errors', async () => {
    getDoc.mockRejectedValue(new Error('permission-denied'))
    await expect(
      controller.getByAnswersDocId('answers-1'),
    ).rejects.toThrow('permission-denied')
  })
})
