// back-end/src/user/user.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './schema/user.schema';
import { GlobalRoleModule } from 'src/global-role/global-role.module';
import { InterestModule } from 'src/interest/interest.module';
import { MailModule } from 'src/mail/mail.module';
import { ChatroomModule } from 'src/chatroom/chatroom.module';
import { NotificationModule } from 'src/notification/notification.module';
import { ChatroomMemberModule } from 'src/chatroom-member/chatroom-member.module';
import { ChatModule } from 'src/chat/chat.module'; // SỬA: Import ChatModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    // SỬA: Dùng forwardRef cho các module có phụ thuộc chéo
    forwardRef(() => ChatroomModule),
    forwardRef(() => ChatModule),
    GlobalRoleModule,
    InterestModule,
    MailModule,
    NotificationModule,
    ChatroomMemberModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  // SỬA: Luôn export UserService để các module khác có thể dùng
  exports: [UserService],
})
export class UserModule {}