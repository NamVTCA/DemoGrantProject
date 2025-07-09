// apps/api/src/socket/socket.module.ts
import { Module, Global } from '@nestjs/common';
import { SocketService } from './socket.service';

@Global() // <-- Dòng này biến SocketModule thành module toàn cục
@Module({
  providers: [SocketService],
  exports: [SocketService], // Export service để các module khác có thể dùng
})
export class SocketModule {}