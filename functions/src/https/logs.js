import { Logging } from '@google-cloud/logging';
import { functions } from '../f.firebase.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('getFunctionLogs');

const PAGE_SIZE = 100;

const logging = new Logging();

export const getFunctionLogs = functions.onCall({
  handler: async (data) => {
    const { pageToken } = data.data ?? {};

    const filter = 'resource.type="cloud_function" OR resource.type="cloud_run_revision"';

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

      const logs = entries.map((entry) => ({
        timestamp: entry.metadata.timestamp,
        severity: entry.metadata.severity,
        functionName: entry.metadata.resource?.labels?.function_name
          ?? entry.metadata.resource?.labels?.service_name
          ?? null,
        message: typeof entry.data === 'string'
          ? entry.data
          : entry.data?.message ?? entry.data ?? null,
        level: entry.data?.level ?? null,
        context: typeof entry.data === 'object'
          ? (() => {
              const { message, level, functionName, timestamp, severity, ...rest } = entry.data;
              return Object.keys(rest).length > 0 ? rest : null;
            })()
          : null,
        insertId: entry.metadata.insertId,
      }));

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
