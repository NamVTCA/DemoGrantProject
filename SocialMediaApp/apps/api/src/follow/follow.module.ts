// apps/api/src/follow/follow.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Follow, FollowSchema } from './schema/follow.schema';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
// NotificationModule cần được import nếu nó là global, nếu không thì thêm vào imports array

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Follow.name, schema: FollowSchema }]),
  ],
  controllers: [FollowController],
  providers: [FollowService],
})
export class FollowModule {}