import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity.js';
import { UserProfile } from './entities/user-profile.entity.js';
import { RegisterUserDto } from './dto/register-user.dto.js';
import { LoginUserDto } from './dto/login-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterUserDto) {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    return this.usersRepository.manager.transaction(async (manager) => {
      const user = manager.create(User, {
        email,
        passwordHash,
      });

      const savedUser = await manager.save(User, user);

      const profile = manager.create(UserProfile, {
        displayName: dto.displayName.trim(),
        user: savedUser,
      });

      await manager.save(UserProfile, profile);

      return {
        id: savedUser.id,
        email: savedUser.email,
        displayName: profile.displayName,
        isEmailVerified: savedUser.isEmailVerified,
        createdAt: savedUser.createdAt,
      };
    });
  }

  async login(dto: LoginUserDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('user.email = :email', { email })
      .getOne();

    if (
      !user ||
      user.status !== 'active' ||
      !(await bcrypt.compare(dto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.profile?.displayName ?? null,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: { profile: true },
    });

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User account is unavailable');
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.profile?.displayName ?? null,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };
  }
}
