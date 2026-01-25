import * as functions from 'firebase-functions';

const logger = {
  log: (level, message, context = {}) => {
    const payload = { ...context, message, level, timestamp: new Date().toISOString() };
    if (level === 'error') {
      functions.logger.error(payload);
    } else if (level === 'warn') {
      functions.logger.warn(payload);
    } else {
      functions.logger.info(payload);
    }
  },
  info: (message, context) => logger.log('info', message, context),
  warn: (message, context) => logger.log('warn', message, context),
  error: (message, context) => logger.log('error', message, context),
};

export default logger;
