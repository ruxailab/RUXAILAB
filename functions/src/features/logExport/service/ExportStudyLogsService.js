import { fail } from '../../../core/errors.js'
import { canViewStudyLogs } from '../../../shared/auth/index.js'
import { csvHeader, toCsvLine, toLogExportRow } from '../models/LogExportRow.js'
import {
  assertKnownRequestKeys,
  decodeCursor,
  encodeCursor,
  parseExportFilters,
  parseStudyId,
} from '../validators/exportStudyLogsValidator.js'

// About 1 MB of CSV per call, well under the callable response limit.
export const EXPORT_PAGE_SIZE = 2000

/**
 * Builds one page of a sanitized log export. The browser calls it again with
 * `nextCursor` until it is null, then joins the pages into a file. Each call
 * checks access again, so a revoked researcher cannot finish an export.
 */
export class ExportStudyLogsService {
  /**
   * @param {object} deps
   * @param {import('../../../shared/repositories/FirestoreStudyRepository.js').FirestoreStudyRepository} deps.studyRepository
   * @param {import('../../../shared/repositories/FirestoreUserRepository.js').FirestoreUserRepository} deps.userRepository
   * @param {import('../repositories/FirestoreStudyLogRepository.js').FirestoreStudyLogRepository} deps.logRepository
   * @param {() => Date} [deps.now]
   * @param {number} [deps.pageSize]
   */
  constructor({
    studyRepository,
    userRepository,
    logRepository,
    now = () => new Date(),
    pageSize = EXPORT_PAGE_SIZE,
  }) {
    this.studyRepository = studyRepository
    this.userRepository = userRepository
    this.logRepository = logRepository
    this.now = now
    this.pageSize = pageSize
  }

  /**
   * @param {object} params
   * @param {string} params.uid
   * @param {object} params.input
   * @returns {Promise<{
   *   format: 'csv'|'json',
   *   content?: string,
   *   events?: object[],
   *   rowCount: number,
   *   totalCount: number|null,
   *   exportedAt: string,
   *   nextCursor: string|null,
   * }>}
   */
  async execute({ uid, input }) {
    const studyId = parseStudyId(input)
    const [study, isSuperAdmin] = await Promise.all([
      this.studyRepository.get(studyId),
      this.userRepository.isSuperAdmin(uid),
    ])
    // Missing and forbidden studies look the same to the caller.
    if (!canViewStudyLogs(study, uid, isSuperAdmin)) {
      fail('permission-denied', 'Access denied')
    }

    assertKnownRequestKeys(input)
    const filters = parseExportFilters(input.filters)
    const position = input.cursor
      ? decodeCursor(input.cursor)
      : { cutoffMs: this.now().getTime(), after: null }

    const [page, totalCount] = await Promise.all([
      this.logRepository.getPage({
        studyId,
        filters,
        pageSize: this.pageSize,
        after: position.after,
      }),
      position.after
        ? Promise.resolve(null)
        : this.logRepository.count({ studyId, filters }),
    ])

    // Events received after the export started belong to a later export.
    const rows = page.events
      .filter((event) => !(event.receivedAt?.toMillis?.() > position.cutoffMs))
      .map(toLogExportRow)

    return {
      format: input.format,
      ...(input.format === 'csv'
        ? {
            content: `${position.after ? '' : csvHeader()}${rows
              .map(toCsvLine)
              .join('')}`,
          }
        : { events: rows }),
      rowCount: rows.length,
      totalCount,
      exportedAt: new Date(position.cutoffMs).toISOString(),
      nextCursor: page.next
        ? encodeCursor({ cutoffMs: position.cutoffMs, after: page.next })
        : null,
    }
  }
}
