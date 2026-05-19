import {
  Logger as GraphileLogger,
  type LogFunctionFactory,
  type LogLevel,
  type LogMeta,
} from '@graphile/logger';
import { Logger } from '@nestjs/common';

const GRACEFUL_SHUTDOWN_PATTERNS = [
  /Received 'SIGTERM'; attempting global graceful shutdown/i,
  /Received 'SIGINT'; attempting global graceful shutdown/i,
  /Ignoring 'SIGTERM' \(graceful shutdown already in progress\)/i,
  /Ignoring 'SIGINT' \(graceful shutdown already in progress\)/i,
  /Global graceful shutdown complete; killing self via SIGTERM/i,
  /Global graceful shutdown complete; killing self via SIGINT/i,
  /Not unregistering signal handlers as we're shutting down/i,
];

function isGracefulShutdownMessage(message: string) {
  return GRACEFUL_SHUTDOWN_PATTERNS.some((pattern) => pattern.test(message));
}

function graphileWorkerLogFactory(): LogFunctionFactory<{}> {
  const logger = new Logger('GraphileWorker');

  return () => (level: LogLevel, message: string, meta?: LogMeta) => {
    const formattedMessage =
      meta !== undefined ? `${message} - ${JSON.stringify(meta)}` : message;

    if (isGracefulShutdownMessage(message)) {
      logger.log(formattedMessage);
      return;
    }

    switch (level) {
      case 'error':
        logger.error(formattedMessage);
        break;
      case 'warning':
        logger.warn(formattedMessage);
        break;
      case 'info':
        logger.log(formattedMessage);
        break;
      case 'debug':
        logger.debug(formattedMessage, meta);
        break;
    }
  };
}

export const graphileWorkerLogger = new GraphileLogger(
  graphileWorkerLogFactory(),
);
