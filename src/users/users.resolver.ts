import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../database/models/user.model';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async user(@Args('id') id: string): Promise<User> {
    return this.usersService.findById(id);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updatePlan(
    @CurrentUser() user: User,
    @Args('plan') plan: string,
  ): Promise<User> {
    return this.usersService.updatePlan(user.id, plan);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async enableCloud(
    @CurrentUser() user: User,
    @Args('apiKey') apiKey: string,
  ): Promise<User> {
    return this.usersService.enableCloud(user.id, apiKey);
  }
}

