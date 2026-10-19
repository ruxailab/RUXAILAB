import { FirestoreAnswerRepository } from '../src/shared/repositories/FirestoreAnswerRepository.js'
import { FirestoreSentimentRepository } from '../src/shared/repositories/FirestoreSentimentRepository.js'
import { Sentiment } from '../src/shared/models/Sentiment.js'

function createDb() {
  const docs = new Map()

  const refFor = (path) => ({
    path,
    get: async () => {
      const data = docs.get(path)
      return {
        exists: data !== undefined,
        id: path.split('/').pop(),
        data: () => data,
      }
    },
    set: async (data) => {
      docs.set(path, data)
    },
    update: async (patch) => {
      const current = docs.get(path) || {}
      const next = structuredClone(current)
      for (const [field, value] of Object.entries(patch)) {
        const parts = field.split('.')
        let cursor = next
        for (const part of parts.slice(0, -1)) {
          cursor[part] = cursor[part] || {}
          cursor = cursor[part]
        }
        cursor[parts.at(-1)] = value
      }
      docs.set(path, next)
    },
  })

  const db = {
    docs,
    collection(name) {
      return {
        doc: (id) => refFor(`${name}/${id}`),
      }
    },
    async runTransaction(fn) {
      const transaction = {
        get: (ref) => ref.get(),
        set: (ref, data) => ref.set(data),
        update: (ref, data) => ref.update(data),
      }
      return fn(transaction)
    },
  }

  return db
}

describe('FirestoreSentimentRepository.upsertSide', () => {
  it('builds a stable document id for one participant task', () => {
    expect(Sentiment.documentId('answer/1', 'user-1', 0)).toBe(
      'answer_1__user-1__0',
    )
  })

  it('keeps facial and text on the same document when both run without a pointer', async () => {
    const db = createDb()
    db.docs.set('answers/answer-1', {
      taskAnswers: {
        'user-1': {
          tasks: {
            '0': {},
          },
        },
      },
    })
    const sentimentRepository = new FirestoreSentimentRepository(db)
    const answerRepository = new FirestoreAnswerRepository(db)
    const facial = { Happy: 40 }
    const text = { Positive: 50, Neutral: 30, Negative: 20, sampleCount: 1 }

    const facialSaved = await sentimentRepository.upsertSide({
      answerRepository,
      answersDocId: 'answer-1',
      userDocId: 'user-1',
      taskId: '0',
      side: 'facial',
      payload: facial,
      updatedAt: 't1',
    })
    const textSaved = await sentimentRepository.upsertSide({
      answerRepository,
      answersDocId: 'answer-1',
      userDocId: 'user-1',
      taskId: '0',
      side: 'text',
      payload: text,
      updatedAt: 't2',
    })

    expect(facialSaved.id).toBe('answer-1__user-1__0')
    expect(textSaved.id).toBe(facialSaved.id)
    expect(textSaved.facial).toEqual(facial)
    expect(textSaved.text).toEqual(text)
    expect(db.docs.get('answers/answer-1')).toMatchObject({
      taskAnswers: {
        'user-1': {
          tasks: {
            '0': { sentimentDocId: facialSaved.id },
          },
        },
      },
    })
    expect([...db.docs.keys()].filter((key) => key.startsWith('sentiment/')))
      .toEqual(['sentiment/answer-1__user-1__0'])
  })

  it('reuses an existing sentiment pointer instead of the canonical id', async () => {
    const db = createDb()
    db.docs.set('answers/answer-1', {
      taskAnswers: {
        'user-1': {
          tasks: {
            '0': { sentimentDocId: 'legacy-sent' },
          },
        },
      },
    })
    db.docs.set('sentiment/legacy-sent', {
      answersDocId: 'answer-1',
      userDocId: 'user-1',
      taskId: '0',
      facial: { Happy: 10 },
      text: null,
      createdAt: 'old',
      updatedAt: 'old',
    })
    const sentimentRepository = new FirestoreSentimentRepository(db)
    const answerRepository = new FirestoreAnswerRepository(db)

    const saved = await sentimentRepository.upsertSide({
      answerRepository,
      answersDocId: 'answer-1',
      userDocId: 'user-1',
      taskId: 0,
      side: 'text',
      payload: { Positive: 1, Neutral: 0, Negative: 0, sampleCount: 1 },
      updatedAt: 't2',
    })

    expect(saved.id).toBe('legacy-sent')
    expect(saved.facial).toEqual({ Happy: 10 })
    expect(saved.createdAt).toBe('old')
    expect(db.docs.has('sentiment/answer-1__user-1__0')).toBe(false)
  })
})
