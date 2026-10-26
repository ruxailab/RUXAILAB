import {
  exportFilters,
  exportStudyLogs,
} from '@/shared/services/studyLogExport'

jest.mock('@/app/plugins/firebase/FirebaseFunctionsService', () => ({
  FirebaseFunctionsController: { callHttpsCallableFunction: jest.fn() },
}))

const readBlob = (blob) =>
  new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsText(blob)
  })

const pagedCall = (pages) => {
  const call = jest.fn()
  pages.forEach((page) => call.mockResolvedValueOnce({ data: page }))
  return call
}

describe('studyLogExport', () => {
  it('sends Date bounds as ISO strings and drops empty filters', () => {
    expect(
      exportFilters({
        level: 'warning',
        participantLabel: null,
        occurredFrom: new Date('2026-08-14T00:00:00.000Z'),
      }),
    ).toEqual({ level: 'warning', occurredFrom: '2026-08-14T00:00:00.000Z' })
  })

  it('follows the cursor and joins CSV pages into one file', async () => {
    const call = pagedCall([
      {
        content: 'occurredAt,participantLabel\r\nA,P-002\r\n',
        rowCount: 1,
        totalCount: 2,
        exportedAt: '2026-08-14T11:00:00.000Z',
        nextCursor: 'page-2',
      },
      {
        content: 'B,P-001\r\n',
        rowCount: 1,
        totalCount: null,
        exportedAt: '2026-08-14T11:00:00.000Z',
        nextCursor: null,
      },
    ])
    const onProgress = jest.fn()

    const result = await exportStudyLogs({
      studyId: 'study-1',
      format: 'csv',
      filters: { level: 'warning' },
      onProgress,
      call,
    })

    expect(call.mock.calls.map(([data]) => data)).toEqual([
      { studyId: 'study-1', format: 'csv', filters: { level: 'warning' } },
      {
        studyId: 'study-1',
        format: 'csv',
        filters: { level: 'warning' },
        cursor: 'page-2',
      },
    ])
    expect(onProgress.mock.calls).toEqual([
      [{ exported: 1, total: 2 }],
      [{ exported: 2, total: 2 }],
    ])
    expect(result.filename).toBe('study-study-1-logs-20260814T110000Z.csv')
    expect(result.rowCount).toBe(2)
    expect(result.blob.type).toBe('text/csv;charset=utf-8')
    expect(await readBlob(result.blob)).toBe(
      'occurredAt,participantLabel\r\nA,P-002\r\nB,P-001\r\n',
    )
  })

  it('wraps JSON pages in one document', async () => {
    const call = pagedCall([
      {
        events: [{ participantLabel: 'P-001' }],
        rowCount: 1,
        totalCount: 1,
        exportedAt: '2026-08-14T11:00:00.000Z',
        nextCursor: null,
      },
    ])

    const result = await exportStudyLogs({
      studyId: 'study-1',
      format: 'json',
      call,
    })

    expect(JSON.parse(await readBlob(result.blob))).toEqual({
      schemaVersion: 1,
      studyId: 'study-1',
      exportedAt: '2026-08-14T11:00:00.000Z',
      filters: {},
      events: [{ participantLabel: 'P-001' }],
    })
  })

  it('produces no file when a page fails', async () => {
    const call = jest
      .fn()
      .mockResolvedValueOnce({
        data: {
          content: 'header\r\n',
          rowCount: 0,
          totalCount: 5,
          exportedAt: '2026-08-14T11:00:00.000Z',
          nextCursor: 'page-2',
        },
      })
      .mockRejectedValueOnce({ code: 'functions/permission-denied' })

    await expect(
      exportStudyLogs({ studyId: 'study-1', format: 'csv', call }),
    ).rejects.toEqual({ code: 'functions/permission-denied' })
  })
})
