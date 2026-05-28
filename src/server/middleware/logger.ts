// src/server/middleware/logger.ts
import pino from 'pino';

// Simple JSON logger – can be swapped for Winston later
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const logInfo = (msg: string, context?: Record<string, unknown>) => {
  logger.info({ msg, ...context });
};

export const logError = (msg: string, err?: Error, context?: Record<string, unknown>) => {
  logger.error({ msg, err: err?.message, stack: err?.stack, ...context });
};

export const logDebug = (msg: string, context?: Record<string, unknown>) => {
  logger.debug({ msg, ...context });
};
