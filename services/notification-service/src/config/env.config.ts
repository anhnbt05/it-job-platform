export default () => ({
  port: parseInt(process.env.PORT ?? '3003', 10) || 3003,
  database_url: process.env.DATABASE_URL || '',
  db_pool_max: parseInt(process.env.DB_POOL_MAX ?? '10', 10) || 10,
  db_pool_idle_timeout_ms:
    parseInt(process.env.DB_POOL_IDLE_TIMEOUT_MS ?? '30000', 10) || 30000,
  db_pool_connection_timeout_ms:
    parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT_MS ?? '5000', 10) || 5000,
  jwt_secret: process.env.JWT_SECRET || '',
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET || '',
  jwt_expiration_time: process.env.JWT_EXPIRATION_TIME || '120s',
  jwt_refresh_expiration_time:
    process.env.JWT_REFRESH_EXPIRATION_TIME || '7d',
  kafka: {
    client_id: process.env.KAFKA_CLIENT_ID || '',
    group_id: process.env.KAFKA_GROUP_ID || '',
    brokers: process.env.KAFKA_BROKERS || '',
  },
  mail_host: process.env.MAIL_HOST || '',
  mail_port: process.env.MAIL_PORT || '587',
  mail_secure: process.env.MAIL_SECURE || 'false',
  mail_user: process.env.MAIL_USER || '',
  mail_pass: process.env.MAIL_PASS || '',
  mail_from: process.env.MAIL_FROM || '',
  frontend_login_url: process.env.FRONTEND_LOGIN_URL || '',
});
