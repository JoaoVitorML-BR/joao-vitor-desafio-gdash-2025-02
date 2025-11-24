import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/schemas/user.schema';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { email: user.email, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(registerDto: CreateUserDto) {
    const userCount = await this.usersService.countUsers();
    const isFirstUser = userCount === 0;

    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const userData = {
      ...registerDto,
      password: hashedPassword,
      role: isFirstUser ? UserRole.ADMIN : UserRole.USER,
    };

    const user = await this.usersService.create(userData);
    const { password, ...result } = user.toObject();

    const payload = { email: user.email, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: result,
    };
  }

  async registerUserByAdmin(userData: any) {
    const existingUser = await this.usersService.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const userDataWithHash = {
      ...userData,
      password: hashedPassword,
      role: userData.role || UserRole.USER,
    };

    const user = await this.usersService.create(userDataWithHash);
    const { password, ...result } = user.toObject();

    return {
      message: 'Usuário criado com sucesso',
      user: result,
    };
  }
}
