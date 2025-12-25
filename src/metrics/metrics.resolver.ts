import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { Metric } from '../database/models/metric.model';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import GraphQLJSON from 'graphql-type-json';

@Resolver(() => Metric)
export class MetricsResolver {
  constructor(private metricsService: MetricsService) {}

  @Query(() => [Metric])
  @UseGuards(GqlAuthGuard)
  async metrics(@Args('loadTestId') loadTestId: string): Promise<Metric[]> {
    return this.metricsService.findByLoadTest(loadTestId);
  }

  @Query(() => [Metric])
  @UseGuards(GqlAuthGuard)
  async metricsInTimeRange(
    @Args('loadTestId') loadTestId: string,
    @Args('startTime') startTime: Date,
    @Args('endTime') endTime: Date,
  ): Promise<Metric[]> {
    return this.metricsService.findByTimeRange(loadTestId, startTime, endTime);
  }

  @Query(() => GraphQLJSON, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async aggregatedMetrics(@Args('loadTestId') loadTestId: string): Promise<any> {
    return this.metricsService.getAggregatedMetrics(loadTestId);
  }
}

