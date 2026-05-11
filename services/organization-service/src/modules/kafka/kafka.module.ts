import { createKafkaConfig } from '@/config/kafka.config';
import { KafkaService } from '@/modules/kafka/kafka.service';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import {
  BranchSnapshotEventFactory,
  CategorySnapshotEventFactory,
  CompanySnapshotEventFactory,
  SnapshotEventPublisher,
} from './snapshot-events';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) =>
          createKafkaConfig(configService),
      },
    ]),
  ],
  providers: [
    KafkaService,
    SnapshotEventPublisher,
    CompanySnapshotEventFactory,
    BranchSnapshotEventFactory,
    CategorySnapshotEventFactory,
  ],
  exports: [KafkaService, SnapshotEventPublisher, ClientsModule],
})
export class KafkaModule {}
