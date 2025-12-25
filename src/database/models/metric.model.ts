import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Field, ObjectType, ID, Int, Float } from '@nestjs/graphql';
import { LoadTest } from './load-test.model';

@ObjectType()
@Table({
  tableName: 'metrics',
  timestamps: true,
  indexes: [
    {
      fields: ['loadTestId', 'timestamp'],
    },
  ],
})
export class Metric extends Model {
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

  @Field()
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  timestamp: Date;

  @Field(() => Int)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  requestCount: number;

  @Field(() => Int)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  successCount: number;

  @Field(() => Int)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  errorCount: number;

  @Field(() => Float)
  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  avgResponseTime: number;

  @Field(() => Int, { nullable: true })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  statusCode?: number;

  @Field({ nullable: true })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  errorMessage?: string;

  @Field(() => Int)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  activeUsers: number;

  @Field()
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  createdAt: Date;
}

