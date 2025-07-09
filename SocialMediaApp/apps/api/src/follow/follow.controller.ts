// apps/api/src/follow/follow.controller.ts
import { Controller, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FollowService } from './follow.service';

@UseGuards(JwtAuthGuard)
@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post(':id')
  follow(@Request() req, @Param('id') followingId: string) {
    const followerId = req.user.userId;
    return this.followService.follow(followerId, followingId);
  }

  @Delete(':id')
  unfollow(@Request() req, @Param('id') followingId: string) {
    const followerId = req.user.userId;
    return this.followService.unfollow(followerId, followingId);
  }
}