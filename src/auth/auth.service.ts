import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../database/models/user.model';
import { LoginInput, RegisterInput } from './dto/auth.input';
import { AuthPayload } from './dto/auth.payload';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerInput: RegisterInput): Promise<AuthPayload> {
    const user = await this.usersService.create(registerInput);
    const token = this.generateToken(user);

    return {
      user,
      token,
    };
  }

  async login(loginInput: LoginInput): Promise<AuthPayload> {
    const user = await this.validateUser(loginInput.email, loginInput.password);
    const token = this.generateToken(user);

    return {
      user,
      token,
    };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.validatePassword(password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      plan: user.plan,
    };

    return this.jwtService.sign(payload);
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

