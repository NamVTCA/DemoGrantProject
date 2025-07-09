import {
  BadRequestException,
  Injectable,
  NotFoundException,
  forwardRef,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GlobalRoleService } from 'src/global-role/global-role.service';
import { InterestService } from 'src/interest/interest.service';
import { MailService } from 'src/mail/mail.service';
import { ChatroomService } from 'src/chatroom/chatroom.service';
import { ChatroomMemberService } from 'src/chatroom-member/chatroom-member.service';
import { NotificationService } from 'src/notification/notification.service';
import { ChatGateway } from 'src/chat/chat.gateway';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly globalRoleService: GlobalRoleService,
    private readonly interestService: InterestService,
    private readonly mailService: MailService,
    @Inject(forwardRef(() => ChatroomService))
    private readonly chatroomService: ChatroomService,
    private readonly chatmemberService: ChatroomMemberService,
    private readonly notiService: NotificationService,
  ) {}

  private chatGateway: ChatGateway;

  setGatewayInstance(gateway: ChatGateway) {
    this.chatGateway = gateway;
  }
  async register(createUserDto: CreateUserDto): Promise<User> {
    try {
      const hash = await bcrypt.hash(createUserDto.password, 10);
      const createdUser = new this.userModel({
        ...createUserDto,
        password: hash,
      });
      const savedUser = await createdUser.save();
      await this.setDefaultRole(savedUser._id.toString());
      return savedUser;
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0];
        if (field === 'username') {
          throw new BadRequestException('Tên người dùng đã tồn tại');
        } else if (field === 'email') {
          throw new BadRequestException('Email đã được sử dụng');
        }
      }
      throw new BadRequestException('Thông tin đăng ký không hợp lệ');
    }
  }

  async findById(userId: string): Promise<UserDocument> {
    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .exec();
    if (!user) {
      throw new NotFoundException(
        `Không tìm thấy người dùng với ID: ${userId}`,
      );
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async searchByName(name: string): Promise<User[]> {
    if (!name) return [];
    return this.userModel
      .find({ username: { $regex: name, $options: 'i' } })
      .limit(10)
      .exec();
  }

  async updateResetPasswordOtp(
    email: string,
    otp: string | null,
    expiry: Date | null,
  ) {
    return this.userModel.updateOne(
      { email },
      { resetPasswordOtp: otp, resetPasswordOtpExpiry: expiry },
    );
  }

  async updatePassword(email: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.userModel.updateOne(
      { email },
      {
        password: hashedPassword,
        resetPasswordOtp: null,
        resetPasswordOtpExpiry: null,
      },
    );
  }

  async getFriendshipStatus(
    currentUserId: string,
    otherUserId: string,
  ): Promise<{ status: string }> {
    const currentUser = await this.userModel.findById(currentUserId);
    const otherUser = await this.userModel.findById(otherUserId);

    if (!currentUser || !otherUser) {
      throw new NotFoundException('Không tìm thấy người dùng.');
    }

    if (currentUser.friend_id.some((id) => id.toString() === otherUserId)) {
      return { status: 'friends' };
    }
    if (otherUser.acceptFriend.some((id) => id.toString() === currentUserId)) {
      return { status: 'request_sent' };
    }
    if (currentUser.acceptFriend.some((id) => id.toString() === otherUserId)) {
      return { status: 'request_received' };
    }
    return { status: 'not_friends' };
  }

  async sendFriendRequest(
    fromUserId: string,
    toUserId: string,
  ): Promise<{ message: string }> {
    if (fromUserId === toUserId) {
      throw new HttpException(
        'Bạn không thể tự kết bạn',
        HttpStatus.BAD_REQUEST,
      );
    }

    const toUser = await this.userModel.findById(toUserId);
    if (!toUser) {
      throw new HttpException('Người nhận không tồn tại', HttpStatus.NOT_FOUND);
    }

    const fromUser = await this.userModel.findById(fromUserId);
    if (!fromUser) {
      throw new HttpException('Người gửi không tồn tại', HttpStatus.NOT_FOUND);
    }

    if (
      toUser.acceptFriend.includes(new Types.ObjectId(fromUserId)) ||
      fromUser.friend_id.includes(new Types.ObjectId(toUserId))
    ) {
      throw new HttpException(
        'Đã gửi lời mời hoặc đã là bạn bè',
        HttpStatus.CONFLICT,
      );
    }

    await this.notiService.createNoTi(
      `Bạn có lời mời kết bạn từ ${fromUser.username}`,
      toUserId,
      fromUserId,
    );

    toUser.acceptFriend.push(new Types.ObjectId(fromUserId));
    await toUser.save();

    // Thêm mới: Gửi sự kiện real-time
    this.chatGateway.server.to(toUserId).emit('new_friend_request', {
      fromUser: {
        _id: fromUser._id,
        username: fromUser.username,
        avatar: fromUser.avatar,
      },
    });

    return { message: 'Đã gửi lời mời kết bạn thành công' };
  }

  async acceptFriendRequest(
    currentUserId: string,
    requesterId: string,
  ): Promise<{ message: string }> {
    const currentUser = await this.userModel.findById(currentUserId);
    const requester = await this.userModel.findById(requesterId);

    if (!currentUser || !requester) {
      throw new NotFoundException('Không tìm thấy người dùng.');
    }

    const requesterObjectId = new Types.ObjectId(requesterId);

    if (!currentUser.acceptFriend.some((id) => id.equals(requesterObjectId))) {
      throw new BadRequestException(
        'Không tìm thấy lời mời kết bạn từ người này.',
      );
    }

    currentUser.acceptFriend = currentUser.acceptFriend.filter(
      (id) => !id.equals(requesterObjectId),
    );

    if (!currentUser.friend_id.some((id) => id.equals(requesterObjectId))) {
      currentUser.friend_id.push(requesterObjectId);
    }
    if (!requester.friend_id.some((id) => id.equals(currentUser._id))) {
      requester.friend_id.push(currentUser._id as Types.ObjectId);
    }

    await currentUser.save();
    await requester.save();

    await this.chatroomService.findOrCreatePrivateChat(
      currentUserId,
      requesterId,
    );

    return { message: 'Chấp nhận lời mời kết bạn thành công' };
  }

  async rejectFriendRequest(
    currentUserId: string,
    requesterId: string,
  ): Promise<{ message: string }> {
    const currentUser = await this.userModel.findById(currentUserId);
    if (!currentUser) {
      throw new NotFoundException('Không tìm thấy người dùng hiện tại');
    }

    const initialRequestCount = currentUser.acceptFriend.length;

    currentUser.acceptFriend = currentUser.acceptFriend.filter(
      (id) => id.toString() !== requesterId,
    );

    if (currentUser.acceptFriend.length === initialRequestCount) {
      throw new NotFoundException(
        'Không tìm thấy lời mời kết bạn từ người này.',
      );
    }

    await currentUser.save();
    return { message: 'Đã từ chối lời mời kết bạn' };
  }

  async getPendingRequests(userId: string): Promise<User[]> {
    const user = await this.userModel.findById(userId).populate({
      path: 'acceptFriend',
      select: 'username avatar',
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return user.acceptFriend as unknown as User[];
  }

  async getAllFriends(userId: string): Promise<User[]> {
    const user = await this.userModel.findById(userId).populate({
      path: 'friend_id',
      select: '-password',
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return user.friend_id as unknown as User[];
  }

  async removeFriend(
    currentUserId: string,
    friendId: string,
  ): Promise<{ message: string }> {
    const currentUser = await this.userModel.findById(currentUserId);
    const friendUser = await this.userModel.findById(friendId);

    if (!currentUser || !friendUser) {
      throw new NotFoundException('Không tìm thấy người dùng.');
    }

    const friendObjectId = new Types.ObjectId(friendId);
    const currentUserObjectId = new Types.ObjectId(currentUserId);

    currentUser.friend_id = currentUser.friend_id.filter(
      (id) => !id.equals(friendObjectId),
    );
    friendUser.friend_id = friendUser.friend_id.filter(
      (id) => !id.equals(currentUserObjectId),
    );

    await currentUser.save();
    await friendUser.save();

    return { message: 'Đã hủy kết bạn thành công' };
  }

  async updateProfile(userId: string, updateDto: UpdateUserDto): Promise<User> {
    await this.userModel.updateOne({ _id: userId }, { $set: updateDto });
    return this.findById(userId);
  }

  async setDefaultRole(userId: string) {
    const role = await this.globalRoleService.findByName('user');
    if (!role) {
      console.error('Vai trò "user" mặc định không tồn tại.');
      return;
    }
    return this.userModel.updateOne(
      { _id: userId },
      { $set: { global_role_id: role._id } },
    );
  }

  async addInterestsToUser(userId: string, interestIds: string[]) {
    const validInterests = await this.interestService.findByIds(interestIds);
    if (validInterests.length !== interestIds.length) {
      throw new BadRequestException('Một hoặc nhiều sở thích không hợp lệ');
    }
    return this.userModel.updateOne(
      { _id: userId },
      {
        $set: { interest_id: interestIds.map((id) => new Types.ObjectId(id)) },
      },
    );
  }

  async requestEmailChange(
    userId: string,
    newEmail: string,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('Người dùng không tồn tại');

    const emailExists = await this.userModel.findOne({ email: newEmail });
    if (emailExists) throw new BadRequestException('Email mới đã được sử dụng');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await this.mailService.sendMail(
      user.email,
      'Xác nhận đổi email',
      `Mã OTP để xác nhận đổi email: ${otp}. Mã có hiệu lực trong 15 phút.`,
    );

    await this.userModel.findByIdAndUpdate(userId, {
      resetPasswordOtp: otp,
      resetPasswordOtpExpiry: expiry,
      pendingNewEmail: newEmail,
    });

    return { message: 'OTP xác nhận đã gửi đến email hiện tại' };
  }

  async confirmEmailChange(
    userId: string,
    otp: string,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId);
    if (
      !user ||
      !user.pendingNewEmail ||
      user.resetPasswordOtp !== otp ||
      !user.resetPasswordOtpExpiry ||
      new Date() > user.resetPasswordOtpExpiry
    ) {
      throw new BadRequestException('OTP không hợp lệ hoặc đã hết hạn');
    }

    user.email = user.pendingNewEmail;
    user.pendingNewEmail = undefined;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpiry = undefined;
    await user.save();

    return { message: 'Email đã được cập nhật thành công' };
  }

  async setPlayingGame(
    userId: string,
    game: { gameId: number; name: string; coverUrl?: string } | null,
  ) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: { currentlyPlaying: game } },
      { new: true },
    );

    // TODO: Dùng gateway để broadcast trạng thái mới này đến bạn bè của user
    // Ví dụ: this.chatGateway.broadcastStatusUpdate(userId, user.currentlyPlaying);

    return user;
  }
}
