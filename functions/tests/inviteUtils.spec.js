import { jest } from '@jest/globals'

const addMock = jest.fn()
const collectionMock = jest.fn(() => ({ add: addMock }))
const firestoreMock = Object.assign(
  jest.fn(() => ({ collection: collectionMock })),
  { FieldValue: { serverTimestamp: jest.fn(() => 'server-timestamp') } },
)

jest.unstable_mockModule('../src/core/firebase/f.firebase.js', () => ({
  admin: { firestore: firestoreMock },
}))

const { default: InviteUtils } = await import('../src/utils/inviteUtils.js')

describe('InviteUtils.generateInviteLink', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('preserves admin access level zero in the stored invite', async () => {
    await InviteUtils.generateInviteLink(
      'study-1',
      null,
      'Heuristic study',
      true,
      0,
      true,
    )

    expect(addMock).toHaveBeenCalledWith(
      expect.objectContaining({ accessLevel: 0 }),
    )
  })
})
