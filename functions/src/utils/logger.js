import { logger as functionsLogger } from 'firebase-functions';

/**
 * Log levels with tiered retention:
 *   INFO     → 1 month
 *   WARN     → 2 months
 *   ERROR    → 3 months
 *   CRITICAL → 6 months
 */
const LOG_LEVELS = Object.freeze({
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  CRITICAL: 'critical',
});

/**
 *
 * @param {string} functionName - Name of the Cloud Function (e.g., 'sendEmail').
 * @returns {{ info, warn, error, critical }} Scoped logger methods.
 */
const createLogger = (functionName = 'unknown') => {
  const log = (level, message, context = {}) => {
    const payload = {
      ...context,
      message,
      level,
      functionName,
      timestamp: new Date().toISOString(),
    };

    switch (level) {
      case LOG_LEVELS.CRITICAL:
        functionsLogger.error({ ...payload, severity: 'CRITICAL' });
        break;
      case LOG_LEVELS.ERROR:
        functionsLogger.error(payload);
        break;
      case LOG_LEVELS.WARN:
        functionsLogger.warn(payload);
        break;
      default:
        functionsLogger.info(payload);
        break;
    }
  };

  return {
    info: (message, context) => log(LOG_LEVELS.INFO, message, context),
    warn: (message, context) => log(LOG_LEVELS.WARN, message, context),
    error: (message, context) => log(LOG_LEVELS.ERROR, message, context),
    critical: (message, context) => log(LOG_LEVELS.CRITICAL, message, context),
  };
};

export { createLogger, LOG_LEVELS };