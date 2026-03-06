export default () => ({
  port: parseInt(process.env.PORT ?? '3001', 10) || 3001,
  database_url: process.env.DATABASE_URL || '',
  jwt_secret: process.env.JWT_SECRET || '',
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET || '',
  jwt_expiration_time: process.env.JWT_EXPIRATION_TIME || '120s',
  jwt_refresh_expiration_time: process.env.JWT_REFRESH_EXPIRATION_TIME || '7d',
});
