import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Field, ObjectType, ID, Int, Float } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { LoadTest } from './load-test.model';

@ObjectType()
@Table({
  tableName: 'test_results',
  timestamps: true,
})
export class TestResult extends Model {
  @Field(() => ID)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Field()
  @ForeignKey(() => LoadTest)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  loadTestId: string;

  @Field(() => LoadTest)
  @BelongsTo(() => LoadTest)
  loadTest: LoadTest;

  @Field(() => Int)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  totalRequests: number;

  @Field(() => Int)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  successfulRequests: number;

  @Field(() => Int)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  failedRequests: number;

  @Field(() => Float)
  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  averageResponseTime: number;

  @Field(() => Float)
  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  minResponseTime: number;

  @Field(() => Float)
  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  maxResponseTime: number;

  @Field(() => Float)
  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  p50ResponseTime: number;

  @Field(() => Float)
  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  p95ResponseTime: number;

  @Field(() => Float)
  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  p99ResponseTime: number;

  @Field(() => Float)
  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  requestsPerSecond: number;

  @Field(() => Float)
  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  errorRate: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  statusCodeDistribution?: object;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  errorDistribution?: object;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  timeSeriesData?: object;

  @Field()
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  createdAt: Date;

  @Field()
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  updatedAt: Date;
}

