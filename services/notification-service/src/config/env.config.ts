export default () => ({
  port: parseInt(process.env.PORT ?? '3002', 10) || 3002,
  database_url: process.env.DATABASE_URL || '',
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
});
