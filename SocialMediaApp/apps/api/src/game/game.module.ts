import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { GameController } from './game.controller';
import { GameService } from './game.service';

@Module({
  imports: [
    HttpModule, // Import để GameService có thể dùng HttpService
    ConfigModule, // Import để GameService có thể dùng ConfigService
  ],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}