import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from './schema/notification.schema';
import { Message } from '../message/schema/message.schema';
import { NotificationGateway } from './notification.gateway';

// DTO (Data Transfer Object) để định nghĩa dữ liệu cho việc tạo thông báo
// Giúp code rõ ràng và dễ kiểm tra hơn
export class CreateNotificationDto {
  recipientId: string; // ID người nhận
  senderId: string; // ID người gửi
  type: 'NEW_FOLLOWER' | 'FRIEND_REQUEST' | 'GROUP_INVITE' | 'POST_LIKE'; // Các loại thông báo
  title: string; // Nội dung thông báo
  postId?: string; // Tùy chọn: ID bài viết liên quan
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
    @InjectModel(Message.name) 
    private readonly messageModel: Model<Message>,
    // Inject Gateway để có thể gửi thông báo real-time
    private readonly notificationGateway: NotificationGateway,
  ) {}

  /**
   * Phương thức chính để tạo và gửi tất cả các loại thông báo.
   * Đây là hàm mà FollowService và các service khác sẽ gọi.
   */
  async create(dto: CreateNotificationDto): Promise<any> {
    const { recipientId, senderId, type, title, postId } = dto;

    if (!Types.ObjectId.isValid(recipientId) || !Types.ObjectId.isValid(senderId)) {
      throw new BadRequestException('ID người nhận hoặc người gửi không hợp lệ.');
    }

    const notification = new this.notificationModel({
      user_id: recipientId,
      sender_id: senderId,
      type,
      title,
      isRead: false,
      post_id: postId, // Thêm post_id nếu có
    });

    const savedNotification = await notification.save();

    // Populate thông tin người gửi để hiển thị trên frontend
    const populatedNotification = await savedNotification.populate<{ sender_id: { username: string; avatar: string } }>('sender_id', 'username avatar');

    // Gửi thông báo real-time đến client của người nhận
    this.notificationGateway.sendNotificationToUser(recipientId, populatedNotification);

    return populatedNotification;
  }

  /**
   * Tìm tất cả thông báo cho một người dùng.
   */
  async findForUser(userId: string): Promise<Notification[]> {
    return this.notificationModel
      .find({ user_id: userId })
      .populate('sender_id', 'username avatar') // Lấy thông tin người gửi
      .sort({ createdAt: -1 }) // Sắp xếp mới nhất lên trên
      .limit(30) // Giới hạn 30 thông báo
      .exec();
  }

  /**
   * Đánh dấu một thông báo là đã đọc.
   */
  async markAsRead(notificationId: string, userId: string): Promise<{ acknowledged: boolean; modifiedCount: number }> {
    const result = await this.notificationModel.updateOne(
      { _id: notificationId, user_id: userId }, // Đảm bảo người dùng chỉ có thể đánh dấu thông báo của chính mình
      { isRead: true },
    );
    if (result.matchedCount === 0) {
        throw new BadRequestException("Thông báo không tồn tại hoặc bạn không có quyền truy cập.")
    }
    return { acknowledged: result.acknowledged, modifiedCount: result.modifiedCount };
  }

  /**
   * Đánh dấu tất cả thông báo chưa đọc của người dùng là đã đọc.
   */
  async markAllAsRead(userId: string): Promise<{ acknowledged: boolean; modifiedCount: number }> {
    const result = await this.notificationModel.updateMany(
        { user_id: userId, isRead: false },
        { isRead: true }
    );
    return { acknowledged: result.acknowledged, modifiedCount: result.modifiedCount };
  }
}