type EnvRecord = Record<string, string | undefined>;

const DURATION_PATTERN = /^\d+\s*([a-zA-Z]+)?$/;

export function validateEnvConfig(config: EnvRecord) {
  const errors: string[] = [];

  requireNonEmpty(config, 'DATABASE_URL', errors);
  requireValidUrl(config, 'DATABASE_URL', errors, ['postgresql:', 'postgres:']);
  requireNonEmpty(config, 'JWT_SECRET', errors);
  requireNonEmpty(config, 'JWT_REFRESH_SECRET', errors);
  requireDuration(config, 'JWT_EXPIRATION_TIME', errors);
  requireDuration(config, 'JWT_REFRESH_EXPIRATION_TIME', errors);
  requireNonEmpty(config, 'KAFKA_BROKERS', errors);

  if (config.FRONTEND_LOGIN_URL?.trim()) {
    requireValidUrl(config, 'FRONTEND_LOGIN_URL', errors, ['http:', 'https:']);
  }

  if (config.IMAGEKIT_URL_ENDPOINT?.trim()) {
    requireValidUrl(config, 'IMAGEKIT_URL_ENDPOINT', errors, [
      'http:',
      'https:',
    ]);
  }

  if (errors.length > 0) {
    throw new Error(
      `identity-service env validation failed:\n- ${errors.join('\n- ')}`,
    );
  }

  return config;
}

function requireNonEmpty(
  config: EnvRecord,
  key: keyof EnvRecord,
  errors: string[],
) {
  if (!config[key]?.trim()) {
    errors.push(`${String(key)} is required`);
  }
}

function requireDuration(
  config: EnvRecord,
  key: keyof EnvRecord,
  errors: string[],
) {
  const value = config[key]?.trim();

  if (!value) {
    errors.push(`${String(key)} is required`);
    return;
  }

  if (!DURATION_PATTERN.test(value)) {
    errors.push(
      `${String(key)} must use a format like 120s, 15m, 2h, or 7d`,
    );
  }
}

function requireValidUrl(
  config: EnvRecord,
  key: keyof EnvRecord,
  errors: string[],
  allowedProtocols: string[],
) {
  const value = config[key]?.trim();

  if (!value) {
    return;
  }

  try {
    const parsed = new URL(value);
    if (!allowedProtocols.includes(parsed.protocol)) {
      errors.push(
        `${String(key)} must use one of: ${allowedProtocols.join(', ')}`,
      );
    }
  } catch {
    errors.push(`${String(key)} must be a valid URL`);
  }
}
