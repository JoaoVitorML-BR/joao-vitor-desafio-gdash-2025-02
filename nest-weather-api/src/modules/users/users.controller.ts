import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { API_BASE_PATH } from '../../common/constants/api.constants';

@ApiTags('Usuários')
@Controller(`${API_BASE_PATH}/users`)
@UsePipes(new ValidationPipe({ transform: true }))
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description: 'Retorna a lista completa de usuários cadastrados no sistema.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso.',
    schema: {
      example: [
        {
          id: '507f1f77bcf86cd799439011',
          name: 'Gadash Desafio',
          email: 'gadash@admin.com',
          role: 'admin',
          createdAt: '2025-11-27T10:30:00.000Z',
          updatedAt: '2025-11-27T10:30:00.000Z',
        },
        {
          id: '507f1f77bcf86cd799439012',
          name: 'João Silva',
          email: 'joao@example.com',
          role: 'user',
          createdAt: '2025-11-27T11:00:00.000Z',
          updatedAt: '2025-11-27T11:00:00.000Z',
        },
      ],
    },
  })
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Buscar usuário por ID',
    description: 'Requer autenticação. Usuários comuns só podem buscar seus próprios dados. Admins podem buscar qualquer usuário.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID do usuário (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado com sucesso.',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        name: 'Gadash Desafio',
        email: 'gadash@admin.com',
        role: 'admin',
        createdAt: '2025-11-27T10:30:00.000Z',
        updatedAt: '2025-11-27T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Sem permissão para acessar este usuário.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  async findOne(@Param('id') id: string, @Req() req) {
    const isAuth = req.user;
    if (!isAuth || (isAuth.userId !== id && isAuth.role !== 'admin')) {
      throw new ForbiddenException('Você não tem permissão para acessar este usuário.');
    }
    const user = await this.usersService.findById(id);
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('name/:name')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Buscar usuário por nome (apenas admin)' })
  @ApiParam({ name: 'name', type: String })
  @ApiResponse({ status: 200, description: 'Usuário encontrado.' })
  @ApiResponse({ status: 403, description: 'Sem permissão para acessar este usuário.' })
  async findByName(@Param('name') name: string, @Req() req) {
    const isAuth = req.user;
    if (!isAuth || (isAuth.role !== 'admin')) {
      throw new ForbiddenException('Você não tem permissão para acessar este usuário.');
    }
    const user = await this.usersService.findByName(name);
    if (!user) {
      return { message: 'Usuário não encontrado' };
    }
    return {
      id: user._id.toString(),
      name: user.name
    };
  }

  @Get('validate/:id')
  @ApiOperation({ summary: 'Validar usuário por ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Validação do usuário.' })
  async validateUser(@Param('id') id: string) {
    const isValid = await this.usersService.validateUser(id);
    return {
      userId: id,
      isValid,
      message: isValid ? 'Usuário válido' : 'Usuário não encontrado'
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Deletar usuário por ID',
    description: 'Requer autenticação de admin. Admin Master pode deletar qualquer um. Admin comum só pode deletar usuários comuns. Ninguém pode deletar a si mesmo.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID do usuário a ser deletado',
    example: '507f1f77bcf86cd799439012',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário excluído com sucesso.',
    schema: {
      example: {
        message: 'Usuário excluído com sucesso',
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Sem permissão para deletar este usuário.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  async deleteUser(@Param('id') id: string, @Req() req) {
    const currentUser = req.user;
    const targetUser = await this.usersService.findById(id);
    const isAdminMaster = currentUser.role === 'admin-master';
    const isAdmin = currentUser.role === 'admin';
    const isSelf = currentUser.userId === id;

    if (isSelf) {
      throw new ForbiddenException('Você não pode deletar sua própria conta.');
    }

    if (isAdminMaster) {
      await this.usersService.remove(id);
      return { message: 'Usuário excluído com sucesso' };
    }

    if (isAdmin) {
      if (targetUser.role === 'admin' || targetUser.role === 'admin-master') {
        throw new ForbiddenException('Apenas o Admin Master pode deletar administradores.');
      }
      await this.usersService.remove(id);
      return { message: 'Usuário excluído com sucesso' };
    }

    throw new ForbiddenException('Você não tem permissão para deletar usuários.');
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Atualizar usuário por ID',
    description: 'Requer autenticação. Usuários podem atualizar seus próprios dados (exceto role). Admins têm mais permissões.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID do usuário a ser atualizado',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      updateName: {
        summary: 'Atualizar nome',
        value: {
          name: 'João Vitor Silva',
        },
      },
      updateEmail: {
        summary: 'Atualizar email',
        value: {
          email: 'joaovitor@example.com',
        },
      },
      updatePassword: {
        summary: 'Atualizar senha',
        value: {
          password: 'NovaSenha123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso.',
    schema: {
      example: {
        id: '507f1f77bcf86cd799439011',
        name: 'João Vitor Silva',
        email: 'joaovitor@example.com',
        role: 'user',
        createdAt: '2025-11-27T10:30:00.000Z',
        updatedAt: '2025-11-27T15:45:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Sem permissão para atualizar este usuário.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: UpdateUserDto,
    @Req() req
  ) {
    const currentUser = req.user;
    const targetUser = await this.usersService.findById(id);
    const isAdminMaster = currentUser.role === 'admin-master';
    const isAdmin = currentUser.role === 'admin';
    const isSelf = currentUser.userId === id;

    if (isAdminMaster) {
      const updatedUser = await this.usersService.update(id, updateData);
      return {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      };
    }

    if (isAdmin) {
      if (targetUser.role === 'admin-master') {
        throw new ForbiddenException('Apenas o Admin Master pode editar outro Admin Master.');
      }
      if (targetUser.role === 'admin' && !isSelf) {
        throw new ForbiddenException('Você não pode editar outro administrador.');
      }
      if (updateData.role && updateData.role !== 'user') {
        throw new ForbiddenException('Você não pode alterar o tipo de usuário para admin ou admin-master.');
      }
    }

    if (!isAdmin && !isAdminMaster && !isSelf) {
      throw new ForbiddenException('Você não tem permissão para atualizar este usuário.');
    }

    if (!isAdmin && !isAdminMaster && updateData.role) {
      throw new ForbiddenException('Você não pode alterar o tipo de usuário.');
    }

    const updatedUser = await this.usersService.update(id, updateData);
    return {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('role/admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Listar todos os administradores' })
  @ApiResponse({ status: 200, description: 'Lista de administradores.' })
  async getAdmins() {
    return this.usersService.findByRole('admin');
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('role/user')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Listar todos os clientes' })
  @ApiResponse({ status: 200, description: 'Lista de clientes.' })
  async getClients() {
    return this.usersService.findByRole('user');
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('role/enterprise')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Listar todas as empresas' })
  @ApiResponse({ status: 200, description: 'Lista de empresas.' })
  async getEnterprises() {
    return this.usersService.findByRole('enterprise');
  }
}