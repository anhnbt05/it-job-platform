export default () => ({
  port: parseInt(process.env.PORT ?? '3001', 10) || 3001,
  database_url: process.env.DATABASE_URL || '',
  jwt_secret: process.env.JWT_SECRET || '',
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET || '',
  jwt_expiration_time: process.env.JWT_EXPIRATION_TIME || '120s',
  jwt_refresh_expiration_time: process.env.JWT_REFRESH_EXPIRATION_TIME || '7d',
  imagekit: {
    public_key: process.env.IMAGEKIT_PUBLIC_KEY || '',
    private_key: process.env.IMAGEKIT_PRIVATE_KEY || '',
    url_endpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
  },
  kafka: {
    client_id: process.env.KAFKA_CLIENT_ID || '',
    group_id: process.env.KAFKA_GROUP_ID || '',
    brokers: process.env.KAFKA_BROKERS || '',
  },
  frontend_login_url: process.env.FRONTEND_LOGIN_URL || '',
});
