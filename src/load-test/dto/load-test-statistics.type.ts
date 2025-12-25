import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class LoadTestStatistics {
  @Field(() => Int)
  totalTests: number;

  @Field(() => Int)
  completedTests: number;

  @Field(() => Int)
  runningTests: number;

  @Field(() => Int)
  failedTests: number;

  @Field(() => Float)
  successRate: number;
}

