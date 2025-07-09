// File: apps/api/src/chatroom/chatroom.service.ts

import { Injectable, NotFoundException, forwardRef, Inject, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chatroom, ChatroomDocument } from './schema/chatroom.schema';
import { Model, Types } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { UserDocument } from 'src/user/schema/user.schema';
import { ChatroomMemberService } from '../chatroom-member/chatroom-member.service';

@Injectable()
export class ChatroomService {
  constructor(
    @InjectModel(Chatroom.name) private chatroomModel: Model<ChatroomDocument>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly chatroomMemberService: ChatroomMemberService,
  ) {}

  async findById(id: string): Promise<ChatroomDocument> {
    const chatroom = await this.chatroomModel.findById(id).exec();
    if (!chatroom) {
      throw new NotFoundException(`Không tìm thấy phòng chat với ID: ${id}`);
    }
    return chatroom;
  }

  async createChatroom(
    name: string,
    ownerId: string,
    type: 'private' | 'group' | 'public',
    initialMembers: string[] = [],
  ): Promise<ChatroomDocument> {
    const chatroom = new this.chatroomModel({
      name,
      owner: new Types.ObjectId(ownerId),
      type,
      members: initialMembers.map((id) => new Types.ObjectId(id)),
    });
    return await chatroom.save();
  }

  async findOrCreatePrivateChat(
    userId1: string,
    userId2: string,
  ): Promise<ChatroomDocument> {
    // ## SỬA LỖI Ở ĐÂY ##
    // Thêm lớp kiểm tra để đảm bảo cả hai ID đều hợp lệ trước khi sử dụng
    if (!Types.ObjectId.isValid(userId1) || !Types.ObjectId.isValid(userId2)) {
      throw new BadRequestException('Một hoặc cả hai ID người dùng không hợp lệ.');
    }

    const members = [new Types.ObjectId(userId1), new Types.ObjectId(userId2)];

    // Sắp xếp mảng members để đảm bảo thứ tự luôn giống nhau
    // Ví dụ: [A, B] và [B, A] sẽ được coi là một phòng duy nhất
    const sortedMembers = members.sort();

    const existingChatroom = await this.chatroomModel
      .findOne({
        type: 'private',
        members: { $all: sortedMembers, $size: 2 },
      })
      .exec();

    if (existingChatroom) {
      return existingChatroom;
    }

    const user1 = await this.userService.findById(userId1);
    const user2 = await this.userService.findById(userId2);
    if (!user1 || !user2)
      throw new NotFoundException('Không tìm thấy người dùng.');

    return this.createChatroom(`Private chat`, userId1, 'private', [
      userId1,
      userId2,
    ]);
  }

  async findForUser(userId: string): Promise<any[]> {
    const userObjectId = new Types.ObjectId(userId);

    const chatrooms = await this.chatroomModel.find({ members: userObjectId })
      .populate<{ members: UserDocument[] }>({
        path: 'members',
        select: 'username avatar'
      })
      .sort({ updatedAt: -1 })
      .exec();
      
    return chatrooms.map(room => {
      const roomObject = room.toObject();
      
      let finalName = room.name;
      let finalAvatar = '/group-avatar.png';

      if (room.type === 'private') {
        const otherUser = room.members.find(
          (mem) => mem._id.toString() !== userId
        );
        
        if (otherUser) {
          finalName = otherUser.username;
          finalAvatar = otherUser.avatar;
        }
      }
      
      return {
        _id: room._id,
        name: finalName,
        avatar: finalAvatar,
        type: room.type,
      };
    });
  }

  async findPrivateRoom(userId1: string, userId2: string) {
    if (!Types.ObjectId.isValid(userId1) || !Types.ObjectId.isValid(userId2)) {
        return null; // Trả về null nếu ID không hợp lệ
    }
    const sortedMembers = [userId1, userId2].sort();
    return this.chatroomModel.findOne({
      type: 'private',
      members: { $all: sortedMembers, $size: 2 },
    });
  }
}