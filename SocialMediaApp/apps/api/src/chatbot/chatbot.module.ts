// File: apps/api/src/chatbot/chatbot.module.ts

import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Module({
  providers: [ChatbotService],
  // ## THÊM DÒNG NÀY VÀO ##
  exports: [ChatbotService] // Cho phép các module khác sử dụng ChatbotService
})
export class ChatbotModule {}