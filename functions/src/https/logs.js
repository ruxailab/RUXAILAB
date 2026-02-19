import { Logging } from '@google-cloud/logging'
import { functions } from '../f.firebase.js'
import { createLogger } from '../utils/logger.js'
import UserRepository from '../repositories/UserRepository.js'

const logger = createLogger('getFunctionLogs')

const DEFAULT_PAGE_SIZE = 100
const MAX_PAGE_SIZE = 500

const logging = new Logging()

export const getFunctionLogs = functions.onCall({
  handler: async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.',
      )
    }

    const userRepository = new UserRepository()
    const user = await userRepository.get(request.auth.uid)

    if (user?.accessLevel !== 0) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only administrators can view function logs.',
      )
    }

    const { pageToken, pageSize: rawPageSize } = request.data ?? {}

    const parsed = Number(rawPageSize)
    let pageSize = DEFAULT_PAGE_SIZE

    if (Number.isFinite(parsed)) {
      pageSize = Math.floor(parsed)
      if (pageSize < 1) pageSize = 1
      if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE
    }

const filter = [
  '(resource.type="cloud_function" OR resource.type="cloud_run_revision")',
  'jsonPayload:*',
  'NOT resource.labels.function_name="getfunctionlogs"',
  'NOT resource.labels.service_name="getfunctionlogs"',
].join(' AND ');


    const options = {
      filter,
      pageSize,
      orderBy: 'timestamp desc',
      autoPaginate: false,
      ...(pageToken ? { pageToken } : {}),
    }

    try {
      const [entries, , response] = await logging.getEntries(options)

      const logs = entries.map((entry) => {
        const ts = entry.metadata.timestamp
        const timestamp =
          ts && typeof ts.toISOString === 'function'
            ? ts.toISOString()
            : ts?.seconds != null
              ? new Date(Number(ts.seconds) * 1000).toISOString()
              : (ts ?? null)

        return {
          timestamp,
          severity: entry.metadata.severity ?? null,
          functionName:
            entry.metadata.resource?.labels?.function_name ??
            entry.metadata.resource?.labels?.service_name ??
            null,
          message: entry.data?.message ?? null,
          level: entry.data?.level ?? null,
          insertId: entry.metadata.insertId,
        }
      })

      const nextPageToken = response?.nextPageToken ?? null

      return { logs, nextPageToken }
    } catch (err) {
      logger.error('Failed to retrieve function logs', { error: err?.message })
      throw new functions.https.HttpsError(
        'internal',
        'Failed to retrieve function logs.',
      )
    }
  },
})
