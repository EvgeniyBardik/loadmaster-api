import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { LoadTestService } from './load-test.service';
import { LoadTest } from '../database/models/load-test.model';
import { TestResult } from '../database/models/test-result.model';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../database/models/user.model';
import { CreateLoadTestInput, UpdateLoadTestInput } from './dto/load-test.input';
import { LoadTestStatistics } from './dto/load-test-statistics.type';

const pubSub = new PubSub();

@Resolver(() => LoadTest)
export class LoadTestResolver {
  constructor(private loadTestService: LoadTestService) {}

  @Mutation(() => LoadTest)
  @UseGuards(GqlAuthGuard)
  async createLoadTest(
    @CurrentUser() user: User,
    @Args('input') input: CreateLoadTestInput,
  ): Promise<LoadTest> {
    return this.loadTestService.create(user.id, input);
  }

  @Query(() => [LoadTest])
  @UseGuards(GqlAuthGuard)
  async loadTests(@CurrentUser() user: User): Promise<LoadTest[]> {
    return this.loadTestService.findAll(user.id);
  }

  @Query(() => LoadTest)
  @UseGuards(GqlAuthGuard)
  async loadTest(
    @CurrentUser() user: User,
    @Args('id') id: string,
  ): Promise<LoadTest> {
    return this.loadTestService.findOne(id, user.id);
  }

  @Mutation(() => LoadTest)
  @UseGuards(GqlAuthGuard)
  async updateLoadTest(
    @CurrentUser() user: User,
    @Args('id') id: string,
    @Args('input') input: UpdateLoadTestInput,
  ): Promise<LoadTest> {
    return this.loadTestService.update(id, user.id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteLoadTest(
    @CurrentUser() user: User,
    @Args('id') id: string,
  ): Promise<boolean> {
    return this.loadTestService.delete(id, user.id);
  }

  @Mutation(() => LoadTest)
  @UseGuards(GqlAuthGuard)
  async startLoadTest(
    @CurrentUser() user: User,
    @Args('id') id: string,
  ): Promise<LoadTest> {
    const loadTest = await this.loadTestService.startTest(id, user.id);
    pubSub.publish('loadTestUpdated', { loadTestUpdated: loadTest });
    return loadTest;
  }

  @Mutation(() => LoadTest)
  @UseGuards(GqlAuthGuard)
  async stopLoadTest(
    @CurrentUser() user: User,
    @Args('id') id: string,
  ): Promise<LoadTest> {
    const loadTest = await this.loadTestService.stopTest(id, user.id);
    pubSub.publish('loadTestUpdated', { loadTestUpdated: loadTest });
    return loadTest;
  }

  @Query(() => [TestResult])
  @UseGuards(GqlAuthGuard)
  async testResults(
    @CurrentUser() user: User,
    @Args('testId') testId: string,
  ): Promise<TestResult[]> {
    return this.loadTestService.getTestResults(testId, user.id);
  }

  @Query(() => LoadTestStatistics)
  @UseGuards(GqlAuthGuard)
  async loadTestStatistics(@CurrentUser() user: User): Promise<LoadTestStatistics> {
    return this.loadTestService.getStatistics(user.id);
  }

  @Subscription(() => LoadTest, {
    filter: (payload, variables) => {
      return payload.loadTestUpdated.userId === variables.userId;
    },
  })
  loadTestUpdated(@Args('userId') userId: string) {
    return pubSub.asyncIterator('loadTestUpdated');
  }
}

