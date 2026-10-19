import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals'
import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { admin } from '../../../core/firebase/f.firebase.js'
import {
  FirestoreStudyRepository,
  FirestoreUserRepository,
} from '../../../shared/repositories/index.js'
import { exportStudyLogs } from '../interface/exportStudyLogs.js'
import { FirestoreStudyLogRepository } from '../repositories/FirestoreStudyLogRepository.js'
import { ExportStudyLogsService } from '../service/ExportStudyLogsService.js'
import { CSV_COLUMNS } from '../models/LogExportRow.js'

// Own project so clearing it never touches other suites on a shared emulator.
const projectId = 'demo-ruxailab-log-export'
let testEnv
let ownedAdminApp
jest.setTimeout(30000)

const db = () => admin.firestore()
const timestamp = (iso) => admin.firestore.Timestamp.fromDate(new Date(iso))
const call = (data, uid = 'owner') =>
  exportStudyLogs.run({ auth: uid ? { uid } : null, data })
const rejection = async (promise) => {
  try {
    await promise
  } catch (error) {
    return error
  }
  throw new Error('Expected the call to be rejected')
}

const storedEvent = (overrides = {}) => ({
  eventId: 'event-secret-id',
  batchId: 'batch-secret-id',
  sessionId: 'session-secret-hash',
  participantLabel: 'P-001',
  actorRole: 'evaluator',
  eventType: 'STUDY_VIEW_OPENED',
  layer: 'methodological',
  level: 'info',
  source: 'study-client',
  message: 'Study view opened',
  occurredAt: timestamp('2026-08-14T10:00:00.000Z'),
  receivedAt: timestamp('2026-08-14T10:00:01.000Z'),
  timeQuality: 'client-unverified',
  details: {},
  ...overrides,
})

const seedLog = (id, overrides) =>
  db().doc(`tests/study-1/logs/${id}`).set(storedEvent(overrides))

const csvRows = (content) => content.split('\r\n').filter(Boolean)

beforeAll(async () => {
  if (!admin.apps.length) ownedAdminApp = admin.initializeApp({ projectId })
  testEnv = await initializeTestEnvironment({ projectId })
})

afterAll(async () => {
  await testEnv.cleanup()
  if (ownedAdminApp) await ownedAdminApp.delete()
})

beforeEach(async () => {
  await testEnv.clearFirestore()
  await db()
    .doc('tests/study-1')
    .set({
      testType: 'HEURISTIC',
      testAdmin: { userDocId: 'owner' },
      studyRoleMap: {
        owner: 0,
        'mapped-admin': 0,
        manager: 4,
        evaluator: 1,
        guest: 2,
      },
      cooperators: [
        { userDocId: 'legacy-cooperator', accessLevel: 0, accepted: true },
      ],
    })
  await db().doc('users/super-admin').set({ accessLevel: 0 })
  await db().doc('users/owner').set({ accessLevel: 1 })
})

describe('exportStudyLogs access', () => {
  it('requires a signed-in caller', async () => {
    const error = await rejection(
      call({ studyId: 'study-1', format: 'csv' }, null),
    )
    expect(error.code).toBe('unauthenticated')
  })

  it.each(['manager', 'evaluator', 'guest', 'legacy-cooperator', 'stranger'])(
    'denies %s, who cannot read logs in the Firestore rules',
    async (uid) => {
      await seedLog('log-1')
      const error = await rejection(
        call({ studyId: 'study-1', format: 'csv' }, uid),
      )
      expect(error.code).toBe('permission-denied')
    },
  )

  it('answers a missing study exactly like a forbidden one', async () => {
    const missing = await rejection(
      call({ studyId: 'no-such-study', format: 'csv' }),
    )
    const forbidden = await rejection(
      call({ studyId: 'study-1', format: 'csv' }, 'stranger'),
    )
    expect([missing.code, missing.message]).toEqual([
      forbidden.code,
      forbidden.message,
    ])
  })

  it('checks access before reporting malformed filters', async () => {
    const error = await rejection(
      call(
        { studyId: 'study-1', format: 'csv', filters: { nope: true } },
        'stranger',
      ),
    )
    expect(error.code).toBe('permission-denied')
  })

  it.each(['owner', 'mapped-admin', 'super-admin'])(
    'allows %s',
    async (uid) => {
      await seedLog('log-1')
      const result = await call({ studyId: 'study-1', format: 'json' }, uid)
      expect(result.rowCount).toBe(1)
    },
  )
})

describe('exportStudyLogs output', () => {
  it('exports allowlisted fields only, never IDs or unexpected data', async () => {
    await seedLog('firestore-doc-id', {
      uid: 'participant-uid',
      email: 'participant@example.com',
      actorRole: 'participant@example.com',
      eventType: 'ANSWER_EDITED',
      details: {
        fieldRef: 'heuristic:0:question:0:comment',
        editSpanMs: 1400,
        editOperations: 3,
        pasteOperations: 1,
        initialLength: 4,
        resultingLength: 12,
        answerText: 'my phone number is 555-0100',
        nested: { uid: 'participant-uid' },
      },
    })
    await seedLog('free-text-ref', {
      eventType: 'TASK_STARTED',
      details: { taskRef: 'I am participant@example.com', taskType: 'sus' },
    })

    const json = await call({ studyId: 'study-1', format: 'json' })
    const csv = await call({ studyId: 'study-1', format: 'csv' })
    const output = JSON.stringify(json) + csv.content

    for (const secret of [
      'firestore-doc-id',
      'free-text-ref',
      'event-secret-id',
      'batch-secret-id',
      'session-secret-hash',
      'participant-uid',
      'participant@example.com',
      '555-0100',
      'answerText',
      'nested',
    ]) {
      expect(output).not.toContain(secret)
    }
    expect(json.events.map((event) => Object.keys(event).sort())).toEqual([
      [
        'actorRole',
        'details',
        'eventType',
        'layer',
        'level',
        'message',
        'occurredAt',
        'participantLabel',
        'receivedAt',
        'source',
        'timeQuality',
      ],
      expect.any(Array),
    ])
    const answerEdit = json.events.find(
      (event) => event.eventType === 'ANSWER_EDITED',
    )
    expect(answerEdit).toMatchObject({
      participantLabel: 'P-001',
      actorRole: '',
      details: {
        fieldRef: 'heuristic:0:question:0:comment',
        editSpanMs: 1400,
        editOperations: 3,
        pasteOperations: 1,
        initialLength: 4,
        resultingLength: 12,
      },
    })
    expect(
      json.events.find((event) => event.eventType === 'TASK_STARTED').details,
    ).toEqual({ taskType: 'sus' })
  })

  it('writes CSV that spreadsheets read as plain text', async () => {
    await seedLog('log-1', {
      message: '=HYPERLINK("http://evil.example", "click"), then more',
    })

    const result = await call({ studyId: 'study-1', format: 'csv' })
    const [header, row] = csvRows(result.content)

    expect(header).toBe(CSV_COLUMNS.join(','))
    expect(result.content.endsWith('\r\n')).toBe(true)
    expect(row).toBe(
      [
        '2026-08-14T10:00:00.000Z',
        '2026-08-14T10:00:01.000Z',
        'P-001',
        'evaluator',
        'STUDY_VIEW_OPENED',
        'info',
        'methodological',
        'study-client',
        '"\'=HYPERLINK(""http://evil.example"", ""click""), then more"',
        'client-unverified',
        '',
      ].join(','),
    )
  })

  it('returns a header-only CSV and an empty JSON list for no events', async () => {
    const csv = await call({ studyId: 'study-1', format: 'csv' })
    const json = await call({ studyId: 'study-1', format: 'json' })

    expect(csv).toMatchObject({
      content: `${CSV_COLUMNS.join(',')}\r\n`,
      rowCount: 0,
      totalCount: 0,
      nextCursor: null,
    })
    expect(json).toMatchObject({ events: [], rowCount: 0, nextCursor: null })
  })

  it('applies the Log Explorer filters on the server', async () => {
    await seedLog('info', { level: 'info' })
    await seedLog('warning', { level: 'warning', participantLabel: 'P-002' })

    const result = await call({
      studyId: 'study-1',
      format: 'json',
      filters: { level: 'warning' },
    })

    expect(result.totalCount).toBe(1)
    expect(result.events.map((event) => event.participantLabel)).toEqual([
      'P-002',
    ])
  })

  it.each([
    [{ level: 'debug' }],
    [{ participantLabel: 'session-secret-hash' }],
    [{ occurredFrom: '2026-08-14' }],
    [
      {
        occurredFrom: '2026-08-15T00:00:00.000Z',
        occurredBefore: '2026-08-14T00:00:00.000Z',
      },
    ],
    [{ sessionId: 'session-secret-hash' }],
  ])('rejects invalid filters %j', async (filters) => {
    const error = await rejection(
      call({ studyId: 'study-1', format: 'csv', filters }),
    )
    expect(error.code).toBe('invalid-argument')
  })

  it('rejects unknown request fields and tampered cursors', async () => {
    const extra = await rejection(
      call({ studyId: 'study-1', format: 'csv', path: 'tests/other/logs' }),
    )
    const cursor = await rejection(
      call({ studyId: 'study-1', format: 'csv', cursor: 'not-a-cursor' }),
    )
    expect(extra.code).toBe('invalid-argument')
    expect(cursor.code).toBe('invalid-argument')
  })
})

describe('exportStudyLogs paging', () => {
  const service = (options = {}) =>
    new ExportStudyLogsService({
      studyRepository: new FirestoreStudyRepository(db()),
      userRepository: new FirestoreUserRepository(db()),
      logRepository: new FirestoreStudyLogRepository(db()),
      pageSize: 2,
      ...options,
    })

  const exportAll = async (exporter, format) => {
    const pages = []
    let cursor = null
    do {
      const page = await exporter.execute({
        uid: 'owner',
        input: { studyId: 'study-1', format, ...(cursor ? { cursor } : {}) },
      })
      pages.push(page)
      cursor = page.nextCursor
    } while (cursor)
    return pages
  }

  it('pages through every event once, newest first, without a row cap', async () => {
    // Two events share an occurrence time to exercise the ID tie-breaker.
    const times = [
      '2026-08-14T10:00:00.000Z',
      '2026-08-14T10:01:00.000Z',
      '2026-08-14T10:01:00.000Z',
      '2026-08-14T10:02:00.000Z',
      '2026-08-14T10:03:00.000Z',
    ]
    await Promise.all(
      times.map((time, index) =>
        seedLog(`log-${index}`, {
          occurredAt: timestamp(time),
          participantLabel: `P-00${index + 1}`,
        }),
      ),
    )

    const pages = await exportAll(service(), 'csv')
    const rows = pages.flatMap((page) => csvRows(page.content))

    expect(pages).toHaveLength(3)
    expect(pages[0].totalCount).toBe(5)
    expect(pages.slice(1).map((page) => page.totalCount)).toEqual([null, null])
    expect(rows.filter((row) => row.startsWith('occurredAt'))).toHaveLength(1)
    expect(rows.slice(1).map((row) => row.split(',')[2])).toEqual([
      'P-005',
      'P-004',
      'P-003',
      'P-002',
      'P-001',
    ])
  })

  it('leaves out events received after the export started', async () => {
    await seedLog('before', {
      participantLabel: 'P-001',
      receivedAt: timestamp('2026-08-14T10:00:00.000Z'),
    })
    await seedLog('after', {
      participantLabel: 'P-002',
      receivedAt: timestamp('2026-08-14T12:00:00.000Z'),
    })

    const pages = await exportAll(
      service({ now: () => new Date('2026-08-14T11:00:00.000Z') }),
      'json',
    )

    expect(pages[0].exportedAt).toBe('2026-08-14T11:00:00.000Z')
    expect(
      pages.flatMap((page) => page.events.map((e) => e.participantLabel)),
    ).toEqual(['P-001'])
  })

  it('checks access again on every page', async () => {
    await Promise.all(
      [0, 1, 2].map((index) =>
        seedLog(`log-${index}`, {
          occurredAt: timestamp(`2026-08-14T10:0${index}:00.000Z`),
        }),
      ),
    )
    const exporter = service()
    const first = await exporter.execute({
      uid: 'mapped-admin',
      input: { studyId: 'study-1', format: 'csv' },
    })
    await db().doc('tests/study-1').update({ 'studyRoleMap.mapped-admin': 4 })

    const error = await rejection(
      exporter.execute({
        uid: 'mapped-admin',
        input: {
          studyId: 'study-1',
          format: 'csv',
          cursor: first.nextCursor,
        },
      }),
    )
    expect(error.code).toBe('permission-denied')
  })
})
