// back-end/src/message/message.service.ts

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from './schema/message.schema';
import { Types, Model } from 'mongoose';
import { NotificationService } from 'src/notification/notification.service';
import { ChatroomService } from 'src/chatroom/chatroom.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
    private readonly notificationService: NotificationService,
    // ChatroomService đã được inject sẵn, rất thuận tiện
    private readonly chatroomService: ChatroomService,
  ) {}

  /**
   * Gửi tin nhắn vào một phòng chat (sử dụng cho cả chat nhóm và chat 1-1).
   */
  async sendMessage(senderId: string, roomId: string, content: string): Promise<MessageDocument> {
    if (!Types.ObjectId.isValid(senderId) || !Types.ObjectId.isValid(roomId)) {
      throw new BadRequestException('ID người dùng hoặc ID phòng chat không hợp lệ');
    }

    const room = await this.chatroomService.findById(roomId);
    if (!room) {
      throw new NotFoundException('Không tìm thấy phòng chat.');
    }

    const senderObjectId = new Types.ObjectId(senderId);

    // Kiểm tra xem người gửi có phải là thành viên của phòng chat không
    const isMember = room.members.some(memberId => memberId.equals(senderObjectId));
    if (!isMember) {
      throw new ForbiddenException('Bạn không phải là thành viên của phòng chat này.');
    }

    // Tạo và lưu tin nhắn
    const message = await this.messageModel.create({
      content,
      room_id: new Types.ObjectId(roomId),
      sender_id: senderObjectId,
    });
    
    // Populate thông tin người gửi để gửi qua socket
    const populatedMessage = await message.populate({
      path: 'sender_id',
      select: 'username avatar'
    });

    // Gửi thông báo đến các thành viên khác trong phòng
    const recipients = room.members.filter(memberId => !memberId.equals(senderObjectId));
    
    await Promise.all(
      recipients.map((toUserId) =>
        this.notificationService.createNoTi(
          `bạn có tin nhắn mới từ ${(populatedMessage.sender_id as any).username}`,
          toUserId.toString(),
          senderId,
        ),
      ),
    );

    return populatedMessage;
  }

  /**
   * Lấy tất cả tin nhắn từ một phòng chat.
   */
  async getMessages(roomId: string): Promise<MessageDocument[]> {
    return this.messageModel
      .find({ room_id: new Types.ObjectId(roomId) })
      .populate('sender_id', 'username avatar')
      .sort({ createdAt: 'asc' }) // Sắp xếp từ cũ đến mới
      .exec();
  }

  /**
   * === HÀM ĐÃ ĐƯỢC VIẾT LẠI ===
   * Tạo tin nhắn cho cuộc trò chuyện 1-1.
   * Hàm này sẽ tìm hoặc tạo một phòng chat riêng tư rồi gọi lại hàm sendMessage.
   */
  async createMessage(content: string, from: string, to: string): Promise<MessageDocument> {
    // 1. Tìm hoặc tạo một phòng chat riêng tư cho hai người dùng `from` và `to`.
    //    (Bạn cần đảm bảo hàm `findOrCreatePrivateRoom` tồn tại trong ChatroomService)
    const room = await this.chatroomService.findOrCreatePrivateChat(from, to);

    if (!room) {
      throw new NotFoundException('Không thể tìm hoặc tạo phòng chat cho cuộc trò chuyện này.');
    }

    // 2. Tái sử dụng logic của hàm sendMessage với ID phòng vừa tìm được.
    //    Cách này giúp tránh lặp code và đảm bảo mọi logic (kiểm tra thành viên, gửi thông báo) đều được áp dụng.
    return this.sendMessage(from, room._id.toString(), content);
  }

  /**
   * === HÀM ĐÃ ĐƯỢC VIẾT LẠI ===
   * Đánh dấu các tin nhắn là đã đọc trong một cuộc trò chuyện 1-1.
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<{ acknowledged: boolean, modifiedCount: number }> {
    // `conversationId` ở đây là ID của người bạn đang chat.
    // `userId` là ID của chính bạn (người đã đọc tin nhắn).

    // 1. Tìm phòng chat riêng tư giữa hai người.
    //    (Bạn cần đảm bảo hàm `findPrivateRoom` tồn tại trong ChatroomService)
    const room = await this.chatroomService.findPrivateRoom(conversationId, userId);

    if (!room) {
      // Nếu không có phòng chat, không có tin nhắn nào để cập nhật.
      // Đây không phải là lỗi, chỉ là không có gì để làm.
      return { acknowledged: true, modifiedCount: 0 };
    }

    // 2. Cập nhật tất cả tin nhắn trong phòng này,
    //    mà được gửi bởi người kia (`conversationId`) và chưa được đọc (`read: false`).
    return this.messageModel.updateMany(
      {
        room_id: room._id,
        sender_id: new Types.ObjectId(conversationId),
        read: false,
      },
      { $set: { read: true } },
    );
  }
}