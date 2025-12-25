import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LoadTestService } from './load-test.service';
import { LoadTestResolver } from './load-test.resolver';
import { LoadTest } from '../database/models/load-test.model';
import { TestResult } from '../database/models/test-result.model';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    SequelizeModule.forFeature([LoadTest, TestResult]),
    RabbitMQModule,
  ],
  providers: [LoadTestService, LoadTestResolver],
  exports: [LoadTestService],
})
export class LoadTestModule {}

