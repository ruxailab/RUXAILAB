import { jest } from '@jest/globals'
import { RtdbCollectionRepository } from '../src/core/repositories/RtdbCollectionRepository.js'

describe('RtdbCollectionRepository', () => {
  const createRepo = () => {
    const nodes = new Map()

    const makeRef = (path) => ({
      path,
      get: jest.fn(async () => ({
        exists: () => nodes.has(path),
        val: () => (nodes.has(path) ? nodes.get(path) : null),
      })),
      set: jest.fn(async (data) => {
        nodes.set(path, data)
      }),
      update: jest.fn(async (data) => {
        nodes.set(path, { ...(nodes.get(path) || {}), ...data })
      }),
      remove: jest.fn(async () => {
        nodes.delete(path)
      }),
    })

    const rtdb = {
      ref: jest.fn((path) => makeRef(path)),
    }
    const repo = new RtdbCollectionRepository('presence', rtdb)
    return { repo, rtdb, nodes }
  }

  it('reads and writes children under the collection path', async () => {
    const { repo, nodes } = createRepo()

    await repo.set('token-1', { connected: true, id: 'token-1' })
    expect(nodes.get('presence/token-1')).toEqual({ connected: true })

    expect(await repo.get('token-1')).toEqual({
      id: 'token-1',
      connected: true,
    })

    await repo.update('token-1', { connected: false })
    expect(await repo.get('token-1')).toEqual({
      id: 'token-1',
      connected: false,
    })

    await repo.delete('token-1')
    expect(await repo.get('token-1')).toBeNull()
  })

  it('does not touch the database for a missing client or an unsafe id', async () => {
    const { repo, rtdb } = createRepo()
    const empty = new RtdbCollectionRepository('presence', null)

    await empty.set('token-1', { connected: true })
    expect(await empty.get('token-1')).toBeNull()
    await empty.delete('token-1')

    await repo.delete('')
    await repo.delete('a/b')
    expect(rtdb.ref).not.toHaveBeenCalled()
  })
})
