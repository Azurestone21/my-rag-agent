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
import { Roles, WORKSPACE_ROLE, WORKSPACE_TYPE } from '@my-rag-agent/shared';
import { WorkspaceMember } from '../../entities/workspace-member.entity.js';
import { Workspace } from '../../entities/workspace.entity.js';
import { LoginVo } from './vo/login.vo.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
    private readonly jwtService: JwtService,
  ) {}

  // 登录
  async login(loginDto: LoginDto): Promise<LoginVo> {
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
    // 查询用户所有工作空间
    const members = await this.workspaceMemberRepository.find({
      where: { userId: user.id },
      relations: {
        workspace: true,
      },
    });
    if (members.length === 0) {
      const workspace = await this.workspaceRepository.save({
        name: `${user.username}的空间`,
        type: WORKSPACE_TYPE.PERSONAL,
        ownerId: user.id,
      });
      await this.workspaceMemberRepository.save({
        workspaceId: workspace.id,
        userId: user.id,
        role: WORKSPACE_ROLE.OWNER,
      });
      // 把新空间塞进列表
      members.push({ workspace } as any);
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
      workspaces: members.map((m) => ({
        id: m.workspace.id,
        name: m.workspace.name,
        type: m.workspace.type,
        role: m.role, // 用户在这个空间里的角色
      })),
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
    const user = await this.userRepository.save(newUser);

    // 自动创建个人空间
    const workspace = await this.workspaceRepository.save({
      name: `${user.username}的空间`,
      type: WORKSPACE_TYPE.PERSONAL,
      ownerId: user.id,
    });

    // 把他加进成员表
    await this.workspaceMemberRepository.save({
      workspaceId: workspace.id,
      userId: user.id,
      role: WORKSPACE_ROLE.OWNER,
    });
  }
}
