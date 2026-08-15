import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals'
import { admin } from '../src/f.firebase.js'
import { onTestDelete } from '../src/triggers/onTestDelete.js'

const projectId = 'demo-ruxailab-delete-logging'

beforeAll(() => {
  if (!admin.apps.length) admin.initializeApp({ projectId })
})

afterAll(async () => admin.app().delete())

beforeEach(async () => {
  const db = admin.firestore()
  await db.recursiveDelete(db.collection('tests'))
  await db.doc('tests/study-1').set({ testType: 'HEURISTIC' })
  await Promise.all(
    ['studySessions', 'logs', 'logBatches', 'loggingMeta'].map((name) =>
      db.doc(`tests/study-1/${name}/child-1`).set({ retained: false }),
    ),
  )
})

describe('study deletion cleanup', () => {
  it('recursively removes every logging collection after the parent is gone', async () => {
    const studyRef = admin.firestore().doc('tests/study-1')
    const deletedSnapshot = await studyRef.get()
    await studyRef.delete()

    await onTestDelete.run({
      params: { docId: 'study-1' },
      data: deletedSnapshot,
    })

    for (const name of ['studySessions', 'logs', 'logBatches', 'loggingMeta']) {
      await expect(studyRef.collection(name).get()).resolves.toMatchObject({
        empty: true,
      })
    }
  })

  it('is idempotent and recovers when an earlier cleanup removed only some children', async () => {
    const studyRef = admin.firestore().doc('tests/study-1')
    const deletedSnapshot = await studyRef.get()
    await studyRef.delete()
    await studyRef.collection('logs').doc('child-1').delete()

    const event = { params: { docId: 'study-1' }, data: deletedSnapshot }
    await onTestDelete.run(event)
    await onTestDelete.run(event)

    const descendants = await Promise.all(
      ['studySessions', 'logs', 'logBatches', 'loggingMeta'].map((name) =>
        studyRef.collection(name).get(),
      ),
    )
    expect(descendants.every((snapshot) => snapshot.empty)).toBe(true)
  })

  it('rethrows persistent cleanup failures for platform retry', async () => {
    const db = admin.firestore()
    const original = db.recursiveDelete.bind(db)
    db.recursiveDelete = async () => {
      throw new Error('persistent delete failure')
    }

    try {
      await expect(
        onTestDelete.run({ params: { docId: 'study-1' }, data: null }),
      ).rejects.toThrow('persistent delete failure')
    } finally {
      db.recursiveDelete = original
    }
  })
})
