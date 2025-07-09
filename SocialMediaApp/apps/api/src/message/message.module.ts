// back-end/src/message/message.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schema/message.schema';
import { NotificationModule } from 'src/notification/notification.module';
import { ChatroomModule } from 'src/chatroom/chatroom.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    // SỬA: Dùng forwardRef để tránh lỗi phụ thuộc vòng tròn
    forwardRef(() => ChatroomModule),
    forwardRef(() => NotificationModule),
  ],
  controllers: [MessageController],
  providers: [MessageService],
  // SỬA: Export MessageService
  exports: [MessageService],
})
export class MessageModule {}