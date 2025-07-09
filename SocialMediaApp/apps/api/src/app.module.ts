import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// --- Modules ---
import { SocketModule } from './socket/socket.module'; // <-- Thêm import này
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { ReportModule } from './report/report.module';
import { BlockModule } from './block/block.module';
import { StoryModule } from './story/story.module';
import { MessageModule } from './message/message.module';
import { ChatroomModule } from './chatroom/chatroom.module';
import { GlobalRoleModule } from './global-role/global-role.module';
import { TypeModule } from './type/type.module';
import { InterestModule } from './interest/interest.module';
import { GroupModule } from './group/group.module';
import { SearchModule } from './search/search.module';
import { GroupRoleModule } from './group-role/group-role.module';
import { GroupMemberModule } from './group-member/group-member.module';
import { NotificationModule } from './notification/notification.module';
import { ChatroomMemberModule } from './chatroom-member/chatroom-member.module';
import { ChatModule } from './chat/chat.module';
import { FollowModule } from './follow/follow.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGOOSE as string),

    // --- Core Modules ---
    SocketModule, // <-- Thêm vào đây để có thể sử dụng toàn cục
    AuthModule,
    NotificationModule,
    FollowModule,

    // --- Feature Modules ---
    forwardRef(() => UserModule),
    PostsModule,
    CommentModule,
    TypeModule,
    InterestModule,
    ReportModule,
    BlockModule,
    StoryModule,
    MessageModule,
    forwardRef(() => ChatroomModule),
    GlobalRoleModule,
    GroupModule,
    GroupRoleModule,
    GroupMemberModule,
    forwardRef(() => ChatroomMemberModule),
    SearchModule,
    ChatModule,
    ChatbotModule,
    GameModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}