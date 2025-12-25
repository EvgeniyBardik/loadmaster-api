import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../database/models/user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async create(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<User> {
    const existingUser = await this.userModel.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    return this.userModel.create(userData);
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findByPk(id);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  async updatePlan(userId: string, plan: string): Promise<User> {
    const user = await this.findById(userId);
    user.plan = plan;
    await user.save();
    return user;
  }

  async enableCloud(userId: string, apiKey: string): Promise<User> {
    const user = await this.findById(userId);
    user.cloudEnabled = true;
    user.cloudApiKey = apiKey;
    await user.save();
    return user;
  }
}

