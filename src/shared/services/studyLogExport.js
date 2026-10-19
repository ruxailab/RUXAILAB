import { FirebaseFunctionsController } from '@/app/plugins/firebase/FirebaseFunctionsService'

const CONTENT_TYPES = Object.freeze({
  csv: 'text/csv;charset=utf-8',
  json: 'application/json;charset=utf-8',
})
// Each page is a separate request, so one slow page never hits the limit
// for the whole export.
const PAGE_TIMEOUT_MS = 120000

const callExport = (data) =>
  FirebaseFunctionsController.callHttpsCallableFunction(
    'exportStudyLogs',
    data,
    { timeout: PAGE_TIMEOUT_MS },
  )

/**
 * Turns Log Explorer filters (with Date bounds) into the callable's
 * ISO-string filters.
 */
export const exportFilters = (filters = {}) =>
  Object.fromEntries(
    Object.entries(filters).flatMap(([key, value]) => {
      if (value === null || value === undefined || value === '') return []
      return [[key, value instanceof Date ? value.toISOString() : value]]
    }),
  )

const fileStamp = (iso) => iso.replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')

/**
 * Exports a study's logs page by page. The server checks access, filters and
 * sanitizes every page; the browser only joins the pages into one file.
 *
 * @param {object} params
 * @param {string} params.studyId
 * @param {'csv'|'json'} params.format
 * @param {object} [params.filters] Applied Log Explorer filters.
 * @param {(progress: { exported: number, total: number|null }) => void} [params.onProgress]
 * @param {(data: object) => Promise<{ data: object }>} [params.call]
 * @returns {Promise<{ blob: Blob, filename: string, rowCount: number }>}
 */
export const exportStudyLogs = async ({
  studyId,
  format,
  filters = {},
  onProgress = () => {},
  call = callExport,
}) => {
  const requestFilters = exportFilters(filters)
  const parts = []
  const events = []
  let cursor = null
  let total = null
  let exportedAt = null
  let exported = 0
  do {
    const { data } = await call({
      studyId,
      format,
      filters: requestFilters,
      ...(cursor ? { cursor } : {}),
    })
    if (format === 'csv') parts.push(data.content)
    else events.push(...data.events)
    exported += data.rowCount
    total = data.totalCount ?? total
    exportedAt = exportedAt || data.exportedAt
    cursor = data.nextCursor
    onProgress({ exported, total })
  } while (cursor)

  if (format === 'json') {
    parts.push(
      JSON.stringify(
        {
          schemaVersion: 1,
          studyId,
          exportedAt,
          filters: requestFilters,
          events,
        },
        null,
        2,
      ),
    )
  }
  return {
    blob: new Blob(parts, { type: CONTENT_TYPES[format] }),
    filename: `study-${studyId}-logs-${fileStamp(exportedAt)}.${format}`,
    rowCount: exported,
  }
}

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
