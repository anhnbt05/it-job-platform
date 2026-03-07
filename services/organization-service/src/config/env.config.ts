export default () => ({
  port: parseInt(process.env.PORT ?? '3002', 10) || 3002,
  database_url: process.env.DATABASE_URL || '',
  kafka: {
    client_id: process.env.KAFKA_CLIENT_ID || '',
    group_id: process.env.KAFKA_GROUP_ID || '',
    brokers: process.env.KAFKA_BROKERS || '',
  },
});
