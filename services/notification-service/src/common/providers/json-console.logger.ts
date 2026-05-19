import { LoggerService, LogLevel } from '@nestjs/common';
import { appendFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';

type JsonLogLevel = LogLevel | 'fatal';

export class JsonConsoleLogger implements LoggerService {
  private readonly logFilePath: string;

  constructor(private readonly service: string) {
    this.logFilePath =
      process.env.OBSERVABILITY_LOG_FILE ||
      resolve(
        __dirname,
        '../../../../../runtime-logs',
        `${this.service}.log`,
      );

    try {
      mkdirSync(dirname(this.logFilePath), { recursive: true });
    } catch {}
  }

  log(message: unknown, ...optionalParams: unknown[]) {
    this.write('log', message, this.parseCommonParams(optionalParams));
  }

  error(message: unknown, ...optionalParams: unknown[]) {
    this.write('error', message, this.parseErrorParams(optionalParams));
  }

  warn(message: unknown, ...optionalParams: unknown[]) {
    this.write('warn', message, this.parseCommonParams(optionalParams));
  }

  debug(message: unknown, ...optionalParams: unknown[]) {
    this.write('debug', message, this.parseCommonParams(optionalParams));
  }

  verbose(message: unknown, ...optionalParams: unknown[]) {
    this.write('verbose', message, this.parseCommonParams(optionalParams));
  }

  fatal(message: unknown, ...optionalParams: unknown[]) {
    this.write('fatal', message, this.parseErrorParams(optionalParams));
  }

  private parseCommonParams(optionalParams: unknown[]) {
    if (optionalParams.length === 0) {
      return {};
    }

    if (optionalParams.length === 1 && typeof optionalParams[0] === 'string') {
      return { context: optionalParams[0] as string };
    }

    const context =
      typeof optionalParams[optionalParams.length - 1] === 'string'
        ? (optionalParams[optionalParams.length - 1] as string)
        : undefined;

    const meta = context ? optionalParams.slice(0, -1) : optionalParams;

    return {
      context,
      meta: meta.length > 0 ? meta : undefined,
    };
  }

  private parseErrorParams(optionalParams: unknown[]) {
    const trace =
      typeof optionalParams[0] === 'string'
        ? (optionalParams[0] as string)
        : undefined;
    const context =
      typeof optionalParams[1] === 'string'
        ? (optionalParams[1] as string)
        : undefined;
    const meta = optionalParams.slice(context ? 2 : trace ? 1 : 0);

    return {
      trace,
      context,
      meta: meta.length > 0 ? meta : undefined,
    };
  }

  private write(
    level: JsonLogLevel,
    message: unknown,
    options: {
      context?: string;
      trace?: string;
      meta?: unknown;
    },
  ) {
    const normalizedMessage = this.normalize(message);
    const structuredMessage =
      normalizedMessage &&
      typeof normalizedMessage === 'object' &&
      !Array.isArray(normalizedMessage)
        ? (normalizedMessage as Record<string, unknown>)
        : undefined;

    const payload = {
      timestamp: new Date().toISOString(),
      level: level === 'log' ? 'info' : level,
      service: this.service,
      pid: process.pid,
      context: options.context,
      ...(structuredMessage ?? {}),
      message: structuredMessage ? undefined : normalizedMessage,
      trace: options.trace,
      meta: this.normalize(options.meta),
    };

    const stream =
      level === 'error' || level === 'fatal' || level === 'warn'
        ? process.stderr
        : process.stdout;

    const line = `${JSON.stringify(payload)}\n`;
    stream.write(line);
    this.writeToFile(line);
  }

  private normalize(value: unknown) {
    if (value === undefined) {
      return undefined;
    }

    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }

    if (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return value;
    }

    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return String(value);
    }
  }

  private writeToFile(line: string) {
    try {
      appendFileSync(this.logFilePath, line, 'utf8');
    } catch {}
  }
}
