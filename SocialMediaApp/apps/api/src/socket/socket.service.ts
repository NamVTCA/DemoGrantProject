// apps/api/src/socket/socket.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class SocketService {
  // Map này sẽ lưu trữ: <userId, socket.id>
  // Ví dụ: <"60c72b2f9b1d8c001f8e4a9a", "aBcDeFg12345">
  private readonly connectedUsers = new Map<string, string>();

  /**
   * Lưu lại thông tin khi một người dùng kết nối.
   * @param userId ID của người dùng
   * @param socketId ID của kết nối socket
   */
  handleConnection(userId: string, socketId: string) {
    this.connectedUsers.set(userId, socketId);
  }

  /**
   * Xóa thông tin khi người dùng ngắt kết nối.
   * @param socketId ID của kết nối socket đã ngắt
   */
  handleDisconnect(socketId: string) {
    // Tìm trong Map xem socketId này thuộc về userId nào và xóa nó đi
    for (const [userId, id] of this.connectedUsers.entries()) {
      if (id === socketId) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  /**
   * Lấy socket.id của một người dùng nếu họ đang online.
   * @param userId ID của người dùng cần tìm
   * @returns Trả về socket.id nếu người dùng online, ngược lại trả về undefined.
   */
  getSocketId(userId: string): string | undefined {
    return this.connectedUsers.get(userId);
  }
}