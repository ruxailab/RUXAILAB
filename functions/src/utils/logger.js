import { logger as functionsLogger } from 'firebase-functions';

const logger = {
  log: (level, message, context = {}) => {
    const payload = { ...context, message, level, timestamp: new Date().toISOString() };
    if (level === 'error') {
      functionsLogger.error(payload);
    } else if (level === 'warn') {
      functionsLogger.warn(payload);
    } else {
      functionsLogger.info(payload);
    }
  },
  info: (message, context) => logger.log('info', message, context),
  warn: (message, context) => logger.log('warn', message, context),
  error: (message, context) => logger.log('error', message, context),
};

export default logger;