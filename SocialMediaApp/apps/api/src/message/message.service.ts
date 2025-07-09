// File: apps/api/src/message/message.service.ts

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
    private readonly chatroomService: ChatroomService,
  ) {}

  async sendMessage(senderId: string, roomId: string, content: string): Promise<MessageDocument> {
    if (!Types.ObjectId.isValid(senderId) || !Types.ObjectId.isValid(roomId)) {
      throw new BadRequestException('ID người dùng hoặc ID phòng chat không hợp lệ');
    }

    const room = await this.chatroomService.findById(roomId);
    if (!room) {
      throw new NotFoundException('Không tìm thấy phòng chat.');
    }

    const senderObjectId = new Types.ObjectId(senderId);

    const isMember = room.members.some(memberId => memberId.equals(senderObjectId));
    if (!isMember) {
      throw new ForbiddenException('Bạn không phải là thành viên của phòng chat này.');
    }

    const message = await this.messageModel.create({
      content,
      room_id: new Types.ObjectId(roomId),
      sender_id: senderObjectId,
    });
    
    const populatedMessage = await message.populate({
      path: 'sender_id',
      select: 'username avatar'
    });

    const recipients = room.members.filter(memberId => !memberId.equals(senderObjectId));
    
    // ## SỬA LỖI Ở ĐÂY ##
    // Thay thế 'createNoTi' bằng 'create' và truyền vào một DTO
    await Promise.all(
      recipients.map((toUserId) =>
        this.notificationService.create({
          recipientId: toUserId.toString(),
          senderId: senderId,
          type: 'NEW_MESSAGE', // Bạn có thể định nghĩa type này
          title: `Bạn có tin nhắn mới từ ${(populatedMessage.sender_id as any).username}`,
        }),
      ),
    );

    return populatedMessage;
  }

  async getMessages(roomId: string): Promise<MessageDocument[]> {
    return this.messageModel
      .find({ room_id: new Types.ObjectId(roomId) })
      .populate('sender_id', 'username avatar')
      .sort({ createdAt: 'asc' })
      .exec();
  }

  async createMessage(content: string, from: string, to: string): Promise<MessageDocument> {
    const room = await this.chatroomService.findOrCreatePrivateChat(from, to);
    if (!room) {
      throw new NotFoundException('Không thể tìm hoặc tạo phòng chat cho cuộc trò chuyện này.');
    }
    return this.sendMessage(from, room._id.toString(), content);
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<{ acknowledged: boolean, modifiedCount: number }> {
    const room = await this.chatroomService.findPrivateRoom(conversationId, userId);
    if (!room) {
      return { acknowledged: true, modifiedCount: 0 };
    }
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