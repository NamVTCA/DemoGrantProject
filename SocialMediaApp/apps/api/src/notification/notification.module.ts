import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Notification, NotificationSchema } from './schema/notification.schema';
import { Message, MessageSchema } from '../message/schema/message.schema';

import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway'; // <-- Thêm import này

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationGateway, // <-- Thêm Gateway vào đây
  ],
  exports: [NotificationService], // Export Service để các module khác có thể dùng
})
export class NotificationModule {}