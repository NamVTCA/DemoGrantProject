// File: apps/api/src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from 'src/user/schema/user.schema';
import { UserModule } from 'src/user/user.module';
import { MailModule } from 'src/mail/mail.module';

import { LocalStrategy } from './strategies/local.strategy'; // 1. Import LocalStrategy
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UserModule, // Import UserModule để có thể dùng UserService
    MailModule, // Import MailModule để có thể dùng MailService
    PassportModule,
    ConfigModule, // Đảm bảo ConfigModule được import
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1d',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  // 2. Thêm LocalStrategy vào danh sách providers
  // Xóa MailService khỏi đây vì nó đã được cung cấp bởi MailModule
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}