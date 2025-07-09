// apps/api/src/follow/follow.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Follow, FollowSchema } from './schema/follow.schema';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { User, UserSchema } from '../user/schema/user.schema'; // Import User model
import { NotificationModule } from '../notification/notification.module'; // Import NotificationModule
// NotificationModule cần được import nếu nó là global, nếu không thì thêm vào imports array

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Follow.name, schema: FollowSchema },
      { name: User.name, schema: UserSchema }
    ]),
    NotificationModule,
  ],
  controllers: [FollowController],
  providers: [FollowService],
})
export class FollowModule {}