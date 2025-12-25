import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsUrl, IsInt, IsEnum, IsOptional, Min, Max } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateLoadTestInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field()
  @IsUrl()
  targetUrl: string;

  @Field()
  @IsEnum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
  method: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(10000)
  concurrentUsers: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  totalRequests: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(3600)
  durationSeconds: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(10000)
  requestsPerSecond: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  headers?: object;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  body?: object;
}

@InputType()
export class UpdateLoadTestInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsUrl()
  @IsOptional()
  targetUrl?: string;

  @Field({ nullable: true })
  @IsEnum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
  @IsOptional()
  method?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  concurrentUsers?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  totalRequests?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  durationSeconds?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  requestsPerSecond?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  headers?: object;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  body?: object;
}

