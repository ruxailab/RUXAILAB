import { Logging } from '@google-cloud/logging';
import { functions } from '../f.firebase.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('getFunctionLogs');

const PAGE_SIZE = 100;

const logging = new Logging();

export const getFunctionLogs = functions.onCall({
  handler: async (data) => {
    const { pageToken } = data.data ?? {};

    const filter = [
      '(resource.type="cloud_function" OR resource.type="cloud_run_revision")',
      'jsonPayload:*',
    ].join(' AND ');

    const options = {
      filter,
      pageSize: PAGE_SIZE,
      orderBy: 'timestamp desc',
    };

    if (pageToken) {
      options.pageToken = pageToken;
    }

    try {
      const [entries, , response] = await logging.getEntries(options);

      const logs = entries.map((entry) => {
        const ts = entry.metadata.timestamp;
        const timestamp = (ts && typeof ts.toISOString === 'function')
          ? ts.toISOString()
          : (ts?.seconds != null)
            ? new Date(Number(ts.seconds) * 1000).toISOString()
            : ts ?? null;

        return {
          timestamp,
          severity: entry.metadata.severity ?? null,
          functionName: entry.metadata.resource?.labels?.function_name
            ?? entry.metadata.resource?.labels?.service_name
            ?? null,
          message: entry.data?.message ?? null,
          level: entry.data?.level ?? null,
          context: (() => {
            if (typeof entry.data !== 'object' || entry.data === null) return null;
            const { message, level, functionName, timestamp: _ts, severity, ...rest } = entry.data;
            return Object.keys(rest).length > 0 ? rest : null;
          })(),
          insertId: entry.metadata.insertId,
        };
      });

      const nextPageToken = response?.nextPageToken ?? null;

      return { logs, nextPageToken };
    } catch (err) {
      logger.error('Failed to retrieve function logs', { error: err.message });
      throw new functions.https.HttpsError(
        'internal',
        'Failed to retrieve function logs.'
      );
    }
  },
});
