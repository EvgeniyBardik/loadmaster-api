import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MetricsService } from './metrics.service';
import { MetricsResolver } from './metrics.resolver';
import { Metric } from '../database/models/metric.model';

@Module({
  imports: [SequelizeModule.forFeature([Metric])],
  providers: [MetricsService, MetricsResolver],
  exports: [MetricsService],
})
export class MetricsModule {}

