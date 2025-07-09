import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from '../message/message.service';
import { SocketService } from '../socket/socket.service'; // <-- Import SocketService
import { ChatbotService } from '../chatbot/chatbot.service'; // <-- Import ChatbotService

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Inject các service cần thiết
  constructor(
    private readonly messageService: MessageService,
    private readonly socketService: SocketService, // <-- Inject SocketService
    private readonly chatbotService: ChatbotService, // <-- Inject ChatbotService
  ) {}

  // --- Quản lý Kết nối ---
  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.socketService.handleConnection(userId, client.id);
      client.join(userId); // Cho user vào phòng của chính họ để nhận tin nhắn cá nhân
      console.log(`[ChatGateway] Client connected: ${client.id}, UserID: ${userId}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.socketService.handleDisconnect(client.id);
    console.log(`[ChatGateway] Client disconnected: ${client.id}`);
  }


  // --- Logic Chat chính ---
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() payload: { content: string; from: string; to: string },
    @ConnectedSocket() client: Socket,
  ) {
    // --- Xử lý tin nhắn cho Chatbot ---
    if (payload.to === 'chatbot') {
      const botResponse = this.chatbotService.getResponse(payload.content);
      
      // Gửi lại tin nhắn của người dùng cho chính họ
      this.server.to(payload.from).emit('newMessage', {
        ...payload,
        _id: `temp_${Date.now()}`, // Tạo ID tạm cho tin nhắn gửi đi
        createdAt: new Date().toISOString(),
      });

      // Gửi phản hồi của bot sau một khoảng trễ
      setTimeout(() => {
        const botMessage = {
            _id: `bot_${Date.now()}`,
            content: botResponse,
            from: 'chatbot',
            to: payload.from,
            createdAt: new Date().toISOString(),
        };
        this.server.to(payload.from).emit('newMessage', botMessage);
      }, 700);

      return; // Dừng xử lý
    }

    // --- Xử lý tin nhắn cho người dùng thật ---
    const message = await this.messageService.createMessage(
      payload.content,
      payload.from,
      payload.to,
    );
    
    // Gửi tin nhắn đến người nhận và người gửi
    this.server.to(payload.to).emit('newMessage', message);
    this.server.to(payload.from).emit('newMessage', message);
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() payload: { senderId: string; recipientId: string },
  ) {
    await this.messageService.markMessagesAsRead(
      payload.recipientId,
      payload.senderId,
    );
    // Thông báo cho người gửi rằng tin nhắn đã được đọc
    this.server.to(payload.senderId).emit('messages_read', { readerId: payload.recipientId });
  }


  // --- Logic Video Call ---
  @SubscribeMessage("callUser")
  handleCallUser(@MessageBody() data: { userToCall: string, signalData: any, from: string, callerName: string }) {
    // Gửi tín hiệu cuộc gọi đến người nhận
    this.server.to(data.userToCall).emit("callUser", { 
        signal: data.signalData, 
        from: data.from,
        callerName: data.callerName 
    });
  }

  @SubscribeMessage("answerCall")
  handleAnswerCall(@MessageBody() data: { to: string, signal: any }) {
    this.server.to(data.to).emit("callAccepted", data.signal);
  }

  @SubscribeMessage("endCall")
  handleEndCall(@MessageBody() data: { to: string }) {
    this.server.to(data.to).emit("callEnded");
  }
}