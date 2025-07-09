// apps/api/src/follow/follow.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Follow } from './schema/follow.schema';
import { NotificationService } from '../notification/notification.service'; // Giả sử bạn có service này

@Injectable()
export class FollowService {
  constructor(
    @InjectModel(Follow.name) private followModel: Model<Follow>,
    private readonly notificationService: NotificationService,
  ) {}

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('Bạn không thể tự theo dõi chính mình.');
    }
    const existingFollow = await this.followModel.findOne({ follower_id: followerId, following_id: followingId });
    if (existingFollow) {
      throw new BadRequestException('Bạn đã theo dõi người này.');
    }

    await this.followModel.create({ follower_id: followerId, following_id: followingId });

    // Tạo thông báo real-time
    await this.notificationService.create(followingId, {
        type: 'NEW_FOLLOWER',
        title: 'Có người mới theo dõi bạn',
        sender_id: followerId
    });

    return { message: 'Theo dõi thành công.' };
  }

  async unfollow(followerId: string, followingId: string) {
    const result = await this.followModel.deleteOne({ follower_id: followerId, following_id: followingId });
    if (result.deletedCount === 0) {
        throw new BadRequestException('Bạn chưa theo dõi người này.');
    }
    return { message: 'Bỏ theo dõi thành công.' };
  }
}