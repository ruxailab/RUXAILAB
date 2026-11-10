import { jest } from '@jest/globals'

const mockDelete = jest.fn()
const mockGet = jest.fn()
const mockDocGet = jest.fn()
const mockFilesDelete = jest.fn()
const mockDeleteUser = jest.fn()

jest.unstable_mockModule('../../../core/firebase/f.firebase.js', () => ({
  admin: {
    firestore: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          delete: mockDelete,
          get: mockDocGet,
        }),
        where: jest.fn().mockReturnValue({
          get: mockGet,
        }),
      }),
    }),
    storage: jest.fn().mockReturnValue({
      bucket: jest.fn().mockReturnValue({
        getFiles: jest.fn().mockResolvedValue([[{ delete: mockFilesDelete }]]),
      }),
    }),
    auth: jest.fn().mockReturnValue({
      deleteUser: mockDeleteUser,
    }),
  },
  getRegion: jest.fn(() => 'europe-west6'),
  functions: {
    onCall: jest.fn(({ handler, middlewares = [] }) => {
      const composed = middlewares.reduceRight(
        (next, middleware) => (request) =>
          middleware(request, () => next(request)),
        handler,
      )
      return composed
    }),
    https: {
      HttpsError: class HttpsError extends Error {
        constructor(code, message) {
          super(message)
          this.code = code
        }
      },
    },
  },
}))

const { deleteAuth } = await import('../interface/deleteAuth.js')

describe('features/users -> deleteAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('rejects unauthenticated requests', async () => {
    const data = {
      data: { userId: 'user-1' },
    }

    await expect(deleteAuth(data)).rejects.toMatchObject({
      code: 'unauthenticated',
      message: 'Authentication is required',
    })
  })

  it('rejects missing userId in request payload', async () => {
    const data = {
      auth: { uid: 'user-1' },
      data: {},
    }

    await expect(deleteAuth(data)).rejects.toMatchObject({
      code: 'invalid-argument',
      message: 'userId is required',
    })
  })

  it('rejects unauthorized caller', async () => {
    mockDocGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ accessLevel: 1 }),
    })

    const data = {
      auth: { uid: 'caller-user' },
      data: { userId: 'target-user' },
    }

    await expect(deleteAuth(data)).rejects.toMatchObject({
      code: 'permission-denied',
      message: 'Permission denied',
    })
  })

  it('allows self-deletion and cleans up user and tests', async () => {
    mockGet.mockResolvedValueOnce({
      empty: false,
      docs: [
        {
          id: 'test-1',
          data: () => ({ answersDocId: 'ans-1' }),
        },
      ],
    })

    const data = {
      auth: { uid: 'user-1' },
      data: { userId: 'user-1' },
    }

    const res = await deleteAuth(data)
    expect(res).toBe('User deleted successfully.')
    expect(mockDelete).toHaveBeenCalledTimes(3)
    expect(mockFilesDelete).toHaveBeenCalled()
    expect(mockDeleteUser).toHaveBeenCalledWith('user-1')
  })
})

