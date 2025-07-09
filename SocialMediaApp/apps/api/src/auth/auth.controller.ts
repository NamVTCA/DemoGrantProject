// File: apps/api/src/auth/auth.controller.ts

import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  HttpCode, // 1. Import thêm HttpCode
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @HttpCode(200) // 2. Thêm dòng này để trả về mã 200 OK
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  // --- CÁC HÀM KHÁC GIỮ NGUYÊN ---
  @Post('send-otp')
  async sendOtp(@Body('email') email: string) {
    return this.authService.sendResetOtp(email);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyOtpAndGenerateToken(body.email, body.otp);
  }

  @Post('reset')
  async resetPassword(
    @Body() body: { email: string; resetToken: string; newPassword: string },
  ) {
    return this.authService.resetPasswordWithToken(
      body.email,
      body.resetToken,
      body.newPassword,
    );
  }
}