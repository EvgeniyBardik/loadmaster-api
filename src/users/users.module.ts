import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { User } from '../database/models/user.model';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}

