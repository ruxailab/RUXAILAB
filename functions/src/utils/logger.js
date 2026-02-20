import { logger as functionsLogger } from 'firebase-functions';

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
  const log = (level, message = {}) => {
    const payload = {
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
    info: (message) => log(LOG_LEVELS.INFO, message),
    warn: (message) => log(LOG_LEVELS.WARN, message),
    error: (message) => log(LOG_LEVELS.ERROR, message),
    critical: (message) => log(LOG_LEVELS.CRITICAL, message),
  };
};

export { createLogger, LOG_LEVELS };
