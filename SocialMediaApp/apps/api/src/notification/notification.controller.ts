// File: apps/api/src/notification/notification.controller.ts

import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { NotificationService } from './notification.service';

@UseGuards(JwtAuthGuard)
@Controller('notifications') // Đường dẫn API chuẩn
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Route để lấy tất cả thông báo của user đã đăng nhập.
   * Sửa lỗi: Gọi đúng hàm `findForUser`.
   */
  @Get()
  getMyNotifications(@Req() req) {
    return this.notificationService.findForUser(req.user.userId);
  }

  /**
   * Route để đánh dấu TẤT CẢ thông báo là đã đọc.
   * Sửa lỗi: Gọi đúng hàm `markAllAsRead`.
   */
  @Patch('read/all')
  markAllAsRead(@Req() req) {
    return this.notificationService.markAllAsRead(req.user.userId);
  }

  /**
   * Route để đánh dấu MỘT thông báo cụ thể là đã đọc.
   * Sửa lỗi: Gọi đúng hàm `markAsRead`.
   */
  @Patch('read/:id')
  markOneAsRead(@Param('id') id: string, @Req() req) {
    return this.notificationService.markAsRead(id, req.user.userId);
  }
}