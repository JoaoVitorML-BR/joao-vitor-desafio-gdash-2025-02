import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginatedUsers } from 'src/common/interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) { }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    let userData: any = { ...createUserDto };
    const user = new this.userModel(userData);
    return user.save();
  }

  async countUsers(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }

  async isFirstUser(): Promise<boolean> {
    const userCount = await this.userModel.countDocuments().exec();
    return userCount === 0;
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByName(name: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ name }).exec();
  }

  async validateUser(id: string): Promise<boolean> {
    const user = await this.userModel.findById(id).exec();
    return !!user;
  }

  async findAll(page?: number, limit?: number): Promise<PaginatedUsers> {
    const pageOp = arguments[0] !== undefined ? Number(arguments[0]) : 1;
    const limitOp = arguments[1] !== undefined ? Number(arguments[1]) : 10;
    const [data, total] = await Promise.all([
      this.userModel.find()
        .skip((pageOp - 1) * limitOp)
        .limit(limitOp)
        .exec(),
      this.userModel.countDocuments().exec()
    ]);
    return {
      data,
      total,
      page: pageOp,
      limit: limitOp,
      totalPages: Math.ceil(total / limitOp),
    };
  }

  async update(id: string, updateUserDto: any): Promise<UserDocument> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Usuário não encontrado');
    }
  }

  async findByRole(role: string): Promise<UserDocument[]> {
    return this.userModel.find({ role }).exec();
  }

  async isAdminMaster(userId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId).exec();
    return user?.role === 'admin-master';
  }
}
