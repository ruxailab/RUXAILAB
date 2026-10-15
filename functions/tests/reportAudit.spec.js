import { jest } from '@jest/globals'

const serverTimestamp = jest.fn(() => 'server-time')
const auditAdd = jest.fn().mockResolvedValue(undefined)
const study = {
  testType: 'USER',
  testTitle: 'Usability study',
  testAdmin: { userDocId: 'owner' },
  cooperators: [{ userDocId: 'manager', accessLevel: 4, accepted: true }],
}
const studyRef = {
  get: jest.fn(async () => ({ exists: true, data: () => study })),
  collection: jest.fn(() => ({ add: auditAdd })),
}
const userRef = {
  get: jest.fn(async () => ({
    data: () => ({ email: 'manager@example.com' }),
  })),
}
const db = {
  collection: jest.fn((name) => ({
    doc: jest.fn(() => (name === 'tests' ? studyRef : userRef)),
  })),
}

jest.unstable_mockModule('../src/core/firebase/f.firebase.js', () => ({
  admin: {
    firestore: Object.assign(
      jest.fn(() => db),
      {
        FieldValue: { serverTimestamp },
      },
    ),
  },
  functions: {
    onCall: jest.fn((options) => options.handler),
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

const { assertReportDownloadAllowed, recordReportDownload } =
  await import('../src/https/reportAudit.js')

describe('report download audit', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    study.testType = 'USER'
    studyRef.get.mockResolvedValue({ exists: true, data: () => study })
    userRef.get.mockResolvedValue({
      data: () => ({ email: 'manager@example.com' }),
    })
  })

  it('records a report download for an authorized study manager', async () => {
    await expect(
      recordReportDownload({
        auth: { uid: 'manager' },
        data: { studyId: 'study-1' },
      }),
    ).resolves.toEqual({ status: 'recorded' })

    expect(auditAdd).toHaveBeenCalledWith({
      action: 'report.downloadRequested',
      actorId: 'manager',
      actorEmail: 'manager@example.com',
      target: 'study-1',
      targetLabel: 'Usability study',
      targetType: 'report',
      details: { studyType: 'USER' },
      timestamp: 'server-time',
    })
  })

  it('records heuristic study report downloads', async () => {
    study.testType = 'HEURISTIC'

    await expect(
      recordReportDownload({
        auth: { uid: 'manager' },
        data: { studyId: 'study-1' },
      }),
    ).resolves.toEqual({ status: 'recorded' })

    expect(auditAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'report.downloadRequested',
        details: { studyType: 'HEURISTIC' },
      }),
    )
  })

  it('rejects users without report export access', () => {
    expect(() =>
      assertReportDownloadAllowed({ study, uid: 'participant' }),
    ).toThrow(expect.objectContaining({ code: 'permission-denied' }))
  })
})
