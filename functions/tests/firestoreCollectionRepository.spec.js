import { jest } from '@jest/globals'
import { FirestoreCollectionRepository } from '../src/core/repositories/FirestoreCollectionRepository.js'

describe('FirestoreCollectionRepository.deleteMany', () => {
  const createRepo = () => {
    const commits = []
    const deletedRefs = []

    const batch = () => {
      const ops = []
      return {
        delete: jest.fn((ref) => {
          ops.push(ref)
          deletedRefs.push(ref)
        }),
        commit: jest.fn(async () => {
          commits.push([...ops])
        }),
      }
    }

    const docRefs = new Map()
    const collectionRef = {
      doc: jest.fn((id) => {
        if (!docRefs.has(id)) {
          docRefs.set(id, { id, path: `items/${id}` })
        }
        return docRefs.get(id)
      }),
      add: jest.fn(),
    }

    const db = {
      collection: jest.fn(() => collectionRef),
      batch: jest.fn(batch),
    }

    const repo = new FirestoreCollectionRepository('items', db)
    return { repo, db, commits, deletedRefs, collectionRef }
  }

  it('returns 0 and does not create a batch for empty input', async () => {
    const { repo, db } = createRepo()

    expect(await repo.deleteMany([])).toBe(0)
    expect(await repo.deleteMany(null)).toBe(0)
    expect(await repo.deleteMany(undefined)).toBe(0)
    expect(db.batch).not.toHaveBeenCalled()
  })

  it('deduplicates ids and deletes once each', async () => {
    const { repo, db, commits, deletedRefs } = createRepo()

    const count = await repo.deleteMany(['a', 'b', 'a', '', null, 'b'])

    expect(count).toBe(2)
    expect(db.batch).toHaveBeenCalledTimes(1)
    expect(commits).toHaveLength(1)
    expect(deletedRefs.map((ref) => ref.id).sort()).toEqual(['a', 'b'])
  })

  it('chunks deletes into batches of 500', async () => {
    const { repo, db, commits } = createRepo()
    const ids = Array.from({ length: 501 }, (_, i) => `id-${i}`)

    const count = await repo.deleteMany(ids)

    expect(count).toBe(501)
    expect(db.batch).toHaveBeenCalledTimes(2)
    expect(commits).toHaveLength(2)
    expect(commits[0]).toHaveLength(500)
    expect(commits[1]).toHaveLength(1)
  })
})
