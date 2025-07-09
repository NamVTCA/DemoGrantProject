// back-end/src/chat/chat.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MessageModule } from 'src/message/message.module';
import { UserModule } from 'src/user/user.module';
import { ChatbotModule } from 'src/chatbot/chatbot.module';

@Module({
  imports: [
    // SỬA: Import các module cần thiết
    ChatbotModule,
    forwardRef(() => MessageModule),
    forwardRef(() => UserModule), // Dùng forwardRef để phá vỡ vòng lặp
  ],
  // SỬA: Chỉ cần provide ChatGateway
  providers: [ChatGateway],
  // SỬA: Export ChatGateway
  exports: [ChatGateway],
})
export class ChatModule {}