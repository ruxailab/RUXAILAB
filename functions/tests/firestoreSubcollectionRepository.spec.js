import { jest } from '@jest/globals'
import { FirestoreSubcollectionRepository } from '../src/core/repositories/FirestoreSubcollectionRepository.js'

describe('FirestoreSubcollectionRepository', () => {
  const createRepo = () => {
    const docs = new Map()

    const makeRef = (path) => ({
      id: path.split('/').pop(),
      path,
      get: jest.fn(async () => {
        const data = docs.get(path)
        return {
          exists: data != null,
          id: path.split('/').pop(),
          data: () => data,
        }
      }),
      set: jest.fn(async (data) => {
        docs.set(path, { ...(docs.get(path) || {}), ...data })
      }),
      update: jest.fn(async (data) => {
        if (!docs.has(path)) throw new Error(`missing ${path}`)
        docs.set(path, { ...docs.get(path), ...data })
      }),
      delete: jest.fn(async () => {
        docs.delete(path)
      }),
    })

    const db = {
      collection: jest.fn((parentCollection) => ({
        doc: (parentId) => ({
          collection: (subcollectionName) => ({
            doc: (id) =>
              makeRef(`${parentCollection}/${parentId}/${subcollectionName}/${id}`),
            add: jest.fn(async (data) => {
              const id = 'generated'
              const path = `${parentCollection}/${parentId}/${subcollectionName}/${id}`
              docs.set(path, data)
              return { id }
            }),
          }),
        }),
      })),
    }

    const repo = new FirestoreSubcollectionRepository('tests', 'items', db)
    return { repo, db, docs }
  }

  it('reads and writes under the parent document', async () => {
    const { repo, docs } = createRepo()

    await repo.set('study-1', 'item-1', { name: 'one' })
    expect(docs.get('tests/study-1/items/item-1')).toEqual({ name: 'one' })

    await repo.update('study-1', 'item-1', { name: 'updated' })
    expect(await repo.get('study-1', 'item-1')).toEqual({
      id: 'item-1',
      name: 'updated',
    })

    await repo.delete('study-1', 'item-1')
    expect(await repo.get('study-1', 'item-1')).toBeNull()
  })

  it('creates in the nested collection and returns the new id', async () => {
    const { repo, docs } = createRepo()

    const id = await repo.create('study-1', { name: 'fresh' })
    expect(id).toBe('generated')
    expect(docs.get('tests/study-1/items/generated')).toEqual({ name: 'fresh' })
  })

  it('passes the parent id to fromFirestore', async () => {
    const { db } = createRepo()
    const repo = new FirestoreSubcollectionRepository(
      'tests',
      'items',
      db,
      (data, id, parentId) => ({ id, parentId, ...data }),
    )
    await repo.set('study-9', 'item-2', { name: 'nested' })

    expect(await repo.get('study-9', 'item-2')).toEqual({
      id: 'item-2',
      parentId: 'study-9',
      name: 'nested',
    })
  })
})
