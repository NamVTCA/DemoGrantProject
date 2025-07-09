// apps/api/src/chatbot/chatbot.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatbotService {
  // Mảng chứa các câu trả lời ngẫu nhiên khi bot không hiểu
  private readonly unknownResponses: string[] = [
    'Tôi không chắc mình hiểu ý bạn. Bạn có thể diễn đạt khác được không?',
    'Xin lỗi, tôi vẫn đang học hỏi. Câu này hơi khó với tôi.',
    'Hmm, tôi cần phải hỏi kỹ sư của mình về điều này.',
    'Bạn có thể thử hỏi tôi về thời tiết hoặc hỏi tôi một câu chuyện cười không?',
  ];

  getResponse(message: string): string {
    const lowerCaseMessage = message.toLowerCase();

    // Các quy tắc trả lời dựa trên từ khóa
    if (lowerCaseMessage.includes('chào') || lowerCaseMessage.includes('hello')) {
      return 'Chào bạn, tôi là Bot thân thiện của mạng xã hội này. Tôi có thể giúp gì cho bạn?';
    }
    if (lowerCaseMessage.includes('bạn tên gì') || lowerCaseMessage.includes('tên của bạn')) {
      return 'Tôi là một AI Bot, bạn có thể gọi tôi là "Trợ lý ảo".';
    }
    if (lowerCaseMessage.includes('khỏe không')) {
      return 'Cảm ơn bạn đã quan tâm! Là một chương trình máy tính, tôi luôn "khỏe" và sẵn sàng 24/7.';
    }
    if (lowerCaseMessage.includes('thời tiết')) {
        return 'Tôi xin lỗi, tôi chưa được kết nối với dịch vụ thời tiết. Nhưng ngoài trời trông có vẻ đẹp đấy!';
    }
    if (lowerCaseMessage.includes('kể chuyện cười')) {
        return 'Tại sao con ma không bao giờ nói dối? ... Vì bạn có thể nhìn xuyên qua chúng!';
    }
    if (lowerCaseMessage.includes('tạm biệt') || lowerCaseMessage.includes('bye')) {
      return 'Tạm biệt bạn! Chúc bạn một ngày tốt lành nhé.';
    }

    // Nếu không có từ khóa nào khớp, trả về một câu ngẫu nhiên
    const randomIndex = Math.floor(Math.random() * this.unknownResponses.length);
    return this.unknownResponses[randomIndex];
  }
}