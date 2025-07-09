import {
  Controller,
  Post as HttpPost,
  Body,
  Req,
  UseGuards,
  Param,
  Put,
  Get,
  ForbiddenException,
  Delete,
} from '@nestjs/common';
import { PostsService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * Lấy tất cả bài viết (công khai, không cần đăng nhập)
   */
  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  /**
   * Lấy tất cả bài viết của một người dùng cụ thể
   */
  @Get('user/:userId')
  findPostsByUser(@Param('userId') userId: string) {
    return this.postsService.findForUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @HttpPost()
  create(@Body() createPostDto: CreatePostDto, @Req() req) {
    const userId = req.user.userId;
    return this.postsService.create(createPostDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: CreatePostDto,
    @Req() req,
  ) {
    const updated = await this.postsService.update(id, body, req.user.userId);
    if (!updated)
      throw new ForbiddenException('Bạn không có quyền sửa bài này');
    return updated;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req) {
    const deleted = await this.postsService.delete(id, req.user.userId);
    if (!deleted)
      throw new ForbiddenException('Bạn không có quyền xóa bài này');
    return { message: 'Xóa bài viết thành công' };
  }
}
