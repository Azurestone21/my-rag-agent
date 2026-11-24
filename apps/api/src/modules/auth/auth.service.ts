import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity.js';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import * as bcrypt from 'bcrypt';
import { Roles } from '@my-rag-agent/shared';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // 登录
  async login(loginDto: LoginDto): Promise<{ userId: number; token: string }> {
    // 判断用户名是否存在
    const user = await this.userRepository.findOne({
      where: {
        username: loginDto.username,
      },
    });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    // 验证密码
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    // 生成 JWT
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    // 返回 JWT
    return {
      userId: user.id,
      token: accessToken,
    };
  }

  // 注册
  async register(registerDto: RegisterDto): Promise<void> {
    const { username, password, confirmPassword } = registerDto;
    // 判断密码是否一致
    if (password !== confirmPassword) {
      throw new BadRequestException('两次密码不一致');
    }
    // 判断用户名是否存在
    const isExist = await this.userRepository.findOne({
      where: {
        username,
      },
    });
    if (isExist) {
      throw new ConflictException('用户名已存在');
    }
    // 生成密码Hash
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await this.userRepository.create({
      username,
      password: hashedPassword,
      role: Roles.User,
    });
    // 保存用户信息
    await this.userRepository.save(newUser);
  }
}
