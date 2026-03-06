export default () => ({
  port: parseInt(process.env.PORT ?? '3001', 10) || 3001,
  database_url: process.env.DATABASE_URL || '',
  jwt_secret: process.env.JWT_SECRET || '',
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET || '',
  jwt_expiration_time: process.env.JWT_EXPIRATION_TIME || '120s',
  jwt_refresh_expiration_time: process.env.JWT_REFRESH_EXPIRATION_TIME || '7d',
  mail_host: process.env.MAIL_HOST || '',
  mail_port: process.env.MAIL_PORT || '587',
  mail_secure: process.env.MAIL_SECURE || 'false',
  mail_user: process.env.MAIL_USER || '',
  mail_pass: process.env.MAIL_PASS || '',
  mail_from: process.env.MAIL_FROM || '',
  imagekit: {
    public_key: process.env.IMAGEKIT_PUBLIC_KEY || '',
    private_key: process.env.IMAGEKIT_PRIVATE_KEY || '',
    url_endpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
  },
});
