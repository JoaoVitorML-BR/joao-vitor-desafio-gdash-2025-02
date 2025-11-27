import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WeatherModule } from './modules/weather/weather.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    MongooseModule.forRoot(
      process.env.MONGO_URI ||
      'mongodb://localhost:27017/local?authSource=admin',
    ),
    AuthModule,
    UsersModule,
    WeatherModule,
  ],
})
export class AppModule { }
