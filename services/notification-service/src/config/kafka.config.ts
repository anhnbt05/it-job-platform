import { ConfigService } from '@nestjs/config';
import { KafkaOptions, Transport } from '@nestjs/microservices';

export const createKafkaConfig = (
  configService: ConfigService,
): KafkaOptions => {
  return {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: configService.get<string>('kafka.client_id', ''),
        brokers: configService.get<string>('kafka.brokers', '').split(','),
      },
      consumer: {
        groupId: configService.get<string>('kafka.group_id', ''),
      },
    },
  };
};
