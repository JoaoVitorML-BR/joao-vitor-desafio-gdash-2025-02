import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) { }

  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso.' })
  @ApiResponse({ status: 409, description: 'Email já está em uso.' })
  async register(@Body() registerDto: CreateUserDto) {
    return this.authService.register(registerDto);
  }

  @Post('register-admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Registrar admin (apenas admin)' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Admin registrado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @UseGuards(JwtAuthGuard, AdminGuard)
  async registerAdmin(@Body() registerDto: CreateUserDto) {
    const userData = {
      ...registerDto,
      role: 'admin',
    };
    return this.authService.registerUserByAdmin(userData);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login do usuário' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: 'Login realizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('check-first-user')
  @ApiOperation({ summary: 'Verifica se existe algum usuário cadastrado' })
  @ApiResponse({ status: 200, description: 'Retorna se é o primeiro usuário.' })
  async checkFirstUser() {
    const userCount = await this.usersService.countUsers();
    return { isFirstUser: userCount === 0 };
  }
}
