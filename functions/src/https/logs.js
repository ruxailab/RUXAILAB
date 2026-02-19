import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { Logging } from '@google-cloud/logging'
import { createLogger, LOG_LEVELS } from '../utils/logger.js'

const logging = new Logging()
const logger = createLogger('getFunctionLogs')

const DEFAULT_PAGE_SIZE = 50
const MAX_PAGE_SIZE = 500

export const getFunctionLogs = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'Authentication is required to access system logs.',
    )
  }

  const {
    pageToken,
    nextPageToken,
    pageSize: requestedSize,
    startTime,
  } = request.data ?? {}

  const token = pageToken ?? nextPageToken

  let anchorTime

  if (token) {
    if (!startTime) {
      throw new HttpsError(
        'invalid-argument',
        'startTime is required when using pageToken.',
      )
    }
    anchorTime = startTime
  } else {
    anchorTime = startTime ?? new Date().toISOString()
  }

  /**
   * Page size sanitization
   */
  const pageSize = Math.min(
    Math.max(Number(requestedSize ?? DEFAULT_PAGE_SIZE), 1),
    MAX_PAGE_SIZE,
  )

  /**
   * Excludes logs from this function itself to prevent potential loops if we log a lot.
   */
  const filter = `
    resource.type="cloud_run_revision"
    AND timestamp <= "${anchorTime}"
    AND NOT resource.labels.service_name="getFunctionLogs"
    AND NOT jsonPayload.functionName="getFunctionLogs"
    AND NOT protoPayload:*
  `
    .replace(/\s+/g, ' ')
    .trim()

  const options = {
    filter,
    orderBy: 'timestamp desc',
    pageSize,
    autoPaginate: false,
    pageToken: token ?? undefined,
  }

  try {
    const [entries, nextQuery] = await logging.getEntries(options)

    const nextPageToken = nextQuery?.pageToken ?? null

    const logs = entries.map((entry) => {
      const metadata = entry.metadata || {}
      const rawPayload = entry.data || entry.jsonPayload || {}
      const jsonPayload = typeof rawPayload === 'object' ? rawPayload : {}
      const textPayload =
        typeof rawPayload === 'string' ? rawPayload : entry.textPayload

      // Map GCP severity to our internal levels if not present in payload
      let level = jsonPayload.level
      if (!level) {
        const severity = metadata.severity || 'DEFAULT'
        if (
          severity === 'ERROR' ||
          severity === 'CRITICAL' ||
          severity === 'ALERT' ||
          severity === 'EMERGENCY'
        ) {
          level = LOG_LEVELS.ERROR
        } else if (severity === 'WARNING') {
          level = LOG_LEVELS.WARN
        } else {
          level = LOG_LEVELS.INFO
        }
      }

      return {
        timestamp:
          metadata.timestamp?.toISOString?.() ||
          new Date(metadata.timestamp).toISOString(),
        severity: metadata.severity || 'DEFAULT',
        level,
        functionName:
          jsonPayload.functionName ||
          metadata.resource?.labels?.service_name ||
          metadata.labels?.function_name ||
          'unknown',
        message:
          jsonPayload.message ||
          textPayload ||
          entry.protoPayload?.status?.message ||
          (Object.keys(jsonPayload).length > 0
            ? JSON.stringify(jsonPayload)
            : 'Empty log body'),
        insertId: metadata.insertId,
      }
    })

    return {
      logs,
      nextPageToken,
      startTime: anchorTime,
    }
  } catch (error) {
    logger.error({
      message: 'Failed to retrieve logs from Cloud Logging.',
      error: error?.message,
      stack: error?.stack,
    })

    throw new HttpsError(
      'internal',
      'Failed to retrieve logs from Cloud Logging.',
      error?.message,
    )
  }
})
