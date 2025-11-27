import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { API_BASE_PATH } from '../../common/constants/api.constants';

@ApiTags('Autenticação')
@Controller(`${API_BASE_PATH}/auth`)
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) { }

  @Post('register')
  @ApiOperation({
    summary: 'Registrar novo usuário',
    description: '**PRIMEIRO USUÁRIO**: O primeiro usuário cadastrado será automaticamente definido como ADMIN MASTER. Depois disso, somente admins podem criar novos usuários.',
  })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      admin: {
        summary: 'Primeiro Usuário (Admin Master)',
        description: 'Use estes dados para criar o primeiro usuário administrador',
        value: {
          name: 'Gadash Desafio',
          email: 'gadash@admin.com',
          password: 'Teste1@',
        },
      },
      user: {
        summary: 'Usuário Comum',
        value: {
          name: 'João Silva',
          email: 'joao@example.com',
          password: 'Senha123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário registrado com sucesso.',
    schema: {
      example: {
        user: {
          _id: '507f1f77bcf86cd799439011',
          name: 'Gadash Desafio',
          email: 'gadash@admin.com',
          role: 'admin',
          createdAt: '2025-11-27T10:30:00.000Z',
        },
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Email já está em uso.' })
  async register(@Body() registerDto: CreateUserDto) {
    return this.authService.register(registerDto);
  }

  @Post('register-admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Registrar novo admin (apenas admin)',
    description: 'Requer autenticação de admin. Cria um novo usuário com role de administrador.',
  })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      newAdmin: {
        summary: 'Novo Administrador',
        value: {
          name: 'Maria Santos',
          email: 'maria@admin.com',
          password: 'Admin123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Admin registrado com sucesso.',
    schema: {
      example: {
        user: {
          _id: '507f1f77bcf86cd799439011',
          name: 'Maria Santos',
          email: 'maria@admin.com',
          role: 'admin',
          createdAt: '2025-11-27T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado - Token inválido ou ausente.' })
  @ApiResponse({ status: 403, description: 'Acesso negado - Apenas admins podem criar outros admins.' })
  @UseGuards(JwtAuthGuard, AdminGuard)
  async registerAdmin(@Body() registerDto: CreateUserDto) {
    const userData = {
      ...registerDto,
      role: 'admin',
    };
    return this.authService.registerUserByAdmin(userData);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login do usuário',
    description: 'Autentica o usuário e retorna um token JWT para uso nas rotas protegidas.',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      admin: {
        summary: 'Login Admin',
        value: {
          email: 'gadash@admin.com',
          password: 'Teste1@',
        },
      },
      user: {
        summary: 'Login Usuário',
        value: {
          email: 'joao@example.com',
          password: 'Senha123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Login realizado com sucesso.',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6ImdhZGFzaEBhZG1pbi5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MzI3MDgwMDB9.abc123',
        user: {
          _id: '507f1f77bcf86cd799439011',
          name: 'Gadash Desafio',
          email: 'gadash@admin.com',
          role: 'admin',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas - Email ou senha incorretos.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('check-first-user')
  @ApiOperation({
    summary: 'Verifica se existe algum usuário cadastrado',
    description: 'Endpoint auxiliar para verificar se o sistema já possui usuários. Útil para saber se o próximo registro será o admin master.',
  })
  @ApiResponse({
    status: 200,
    description: 'Retorna se é o primeiro usuário.',
    schema: {
      example: {
        isFirstUser: true,
      },
    },
  })
  async checkFirstUser() {
    const userCount = await this.usersService.countUsers();
    return { isFirstUser: userCount === 0 };
  }
}