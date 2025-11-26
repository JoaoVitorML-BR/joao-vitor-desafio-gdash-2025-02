import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString({ message: 'Role deve ser uma string' })
  @IsIn(['user', 'admin', 'admin-master'], { message: 'Role deve ser "user", "admin" ou "admin-master"' })
  role?: string;
}