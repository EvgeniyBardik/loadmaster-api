import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Field, ObjectType, ID, Int } from '@nestjs/graphql';
import { User } from './user.model';
import { TestResult } from './test-result.model';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
@Table({
  tableName: 'load_tests',
  timestamps: true,
})
export class LoadTest extends Model {
  @Field(() => ID)
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Field()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Field({ nullable: true })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Field()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  targetUrl: string;

  @Field()
  @Column({
    type: DataType.ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH'),
    defaultValue: 'GET',
  })
  method: string;

  @Field(() => Int)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 10,
  })
  concurrentUsers: number;

  @Field(() => Int)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 100,
  })
  totalRequests: number;

  @Field(() => Int)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 60,
  })
  durationSeconds: number;

  @Field(() => Int)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 10,
  })
  requestsPerSecond: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  headers?: object;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  body?: object;

  @Field()
  @Column({
    type: DataType.ENUM('pending', 'queued', 'running', 'completed', 'failed', 'cancelled'),
    defaultValue: 'pending',
  })
  status: string;

  @Field({ nullable: true })
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  startedAt?: Date;

  @Field({ nullable: true })
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  completedAt?: Date;

  @Field()
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @Field(() => User)
  @BelongsTo(() => User)
  user: User;

  @Field(() => [TestResult])
  @HasMany(() => TestResult)
  results: TestResult[];

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

