import { Table, Column, Model, DataType, HasMany, BeforeCreate } from 'sequelize-typescript';
import { Field, ObjectType, ID } from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
import { LoadTest } from './load-test.model';

@ObjectType()
@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model {
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
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Field()
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Field()
  @Column({
    type: DataType.ENUM('free', 'professional', 'enterprise'),
    defaultValue: 'free',
  })
  plan: string;

  @Field()
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  cloudEnabled: boolean;

  @Field({ nullable: true })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  cloudApiKey?: string;

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

  @HasMany(() => LoadTest)
  loadTests: LoadTest[];

  @BeforeCreate
  static async hashPassword(user: User) {
    if (user.password) {
      user.password = await bcrypt.hash(user.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

