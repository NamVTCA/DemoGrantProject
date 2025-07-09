// apps/api/src/notification/notification.gateway.ts
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from '../socket/socket.service'; // Import service quản lý socket

@WebSocketGateway({
  cors: {
    origin: '*', // Cho phép kết nối từ mọi nguồn, bạn nên giới hạn lại trong môi trường production
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly socketService: SocketService) {}

  // Hàm này sẽ được gọi khi một client (người dùng) kết nối đến server
  handleConnection(client: Socket) {
    // Lấy userId từ query string lúc client kết nối
    const userId = client.handshake.query.userId as string;
    if (userId) {
      console.log(`[Gateway] Client connected: ${client.id}, UserID: ${userId}`);
      // Dùng SocketService để lưu lại mối quan hệ giữa userId và socket.id
      this.socketService.handleConnection(userId, client.id);
    }
  }

  // Hàm này sẽ được gọi khi một client ngắt kết nối
  handleDisconnect(client: Socket) {
    console.log(`[Gateway] Client disconnected: ${client.id}`);
    // Xóa user khỏi danh sách online
    this.socketService.handleDisconnect(client.id);
  }

  /**
   * Hàm tiện ích để gửi thông báo đến một người dùng cụ thể.
   * NotificationService sẽ gọi hàm này.
   * @param recipientId ID của người nhận
   * @param payload Nội dung thông báo (thường là một object notification)
   */
  sendNotificationToUser(recipientId: string, payload: any) {
    const socketId = this.socketService.getSocketId(recipientId);
    if (socketId) {
      this.server.to(socketId).emit('notification', payload);
      console.log(
        `[Gateway] Sent notification to UserID: ${recipientId} via socket: ${socketId}`,
      );
    } else {
      console.log(
        `[Gateway] Could not send notification. User ${recipientId} is not online.`,
      );
    }
  }
}