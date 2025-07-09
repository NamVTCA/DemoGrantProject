import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Follow } from './schema/follow.schema';
import { NotificationService } from '../notification/notification.service';
import { User } from '../user/schema/user.schema'; // 1. Import User model

@Injectable()
export class FollowService {
  constructor(
    @InjectModel(Follow.name) private followModel: Model<Follow>,
    @InjectModel(User.name) private userModel: Model<User>, // 2. Inject UserModel
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

    // --- PHẦN SỬA LỖI ---
    // 3. Lấy thông tin của người đi theo dõi từ CSDL
    const follower = await this.userModel.findById(followerId);
    if (!follower) {
        throw new NotFoundException('Không tìm thấy người dùng đi theo dõi.');
    }
    // --- KẾT THÚC PHẦN SỬA ---

    await this.followModel.create({ follower_id: followerId, following_id: followingId });

    // Tạo thông báo real-time
    await this.notificationService.create({
      recipientId: followingId,
      senderId: followerId,
      type: 'NEW_FOLLOWER',
      // 4. Sử dụng `follower.username` thay vì `followerId.username`
      title: `${follower.username} đã bắt đầu theo dõi bạn.`
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