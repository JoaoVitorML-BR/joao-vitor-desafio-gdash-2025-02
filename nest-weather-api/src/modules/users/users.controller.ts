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
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários.' })
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
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Usuário encontrado.' })
  @ApiResponse({ status: 403, description: 'Sem permissão para acessar este usuário.' })
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
  @ApiOperation({ summary: 'Deletar usuário por ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Usuário excluído com sucesso.' })
  @ApiResponse({ status: 403, description: 'Sem permissão para deletar este usuário.' })
  async deleteUser(@Param('id') id: string, @Req() req) {
    const currentUser = req.user;
    const targetUser = await this.usersService.findById(id);
    const isAdminMaster = currentUser.role === 'admin-master';
    const isAdmin = currentUser.role === 'admin';
    const isSelf = currentUser.userId === id;

    // Não pode deletar a si mesmo
    if (isSelf) {
      throw new ForbiddenException('Você não pode deletar sua própria conta.');
    }

    // Admin-master pode deletar qualquer um (exceto ele mesmo)
    if (isAdminMaster) {
      await this.usersService.remove(id);
      return { message: 'Usuário excluído com sucesso' };
    }

    // Admin pode deletar apenas usuários comuns
    if (isAdmin) {
      if (targetUser.role === 'admin' || targetUser.role === 'admin-master') {
        throw new ForbiddenException('Apenas o Admin Master pode deletar administradores.');
      }
      await this.usersService.remove(id);
      return { message: 'Usuário excluído com sucesso' };
    }

    // Usuário comum não pode deletar ninguém
    throw new ForbiddenException('Você não tem permissão para deletar usuários.');
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Atualizar usuário por ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.' })
  @ApiResponse({ status: 403, description: 'Sem permissão para atualizar este usuário.' })
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