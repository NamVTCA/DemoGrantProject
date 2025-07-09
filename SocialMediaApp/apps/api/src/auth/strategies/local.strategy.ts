// File: apps/api/src/auth/strategies/local.strategy.ts

import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // Báo cho Passport biết chúng ta sẽ dùng trường 'email' để đăng nhập
    super({ usernameField: 'email' });
  }

  // Phương thức này sẽ được LocalAuthGuard tự động gọi
  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác.');
    }
    return user; // Trả về đối tượng user nếu thành công
  }
}