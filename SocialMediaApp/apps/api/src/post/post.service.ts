import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schema/post.schema';
import { Model } from 'mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { PostStatus } from './schema/post.schema';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  /**
   * Lấy tất cả bài viết đã được duyệt để hiển thị công khai
   */
  async findAll(): Promise<Post[]> {
    return this.postModel
      .find({ status: PostStatus.APPROVED }) // Chỉ lấy bài viết đã được duyệt
      .populate('author', 'username avatar') // Lấy thông tin username và avatar của tác giả
      .sort({ createdAt: -1 }) // Sắp xếp bài mới nhất lên đầu
      .exec();
  }

  /**
   * Lấy tất cả bài viết của một người dùng cụ thể
   * @param userId ID của người dùng
   */
  async findForUser(userId: string): Promise<Post[]> {
    return this.postModel
      .find({ author: userId, status: PostStatus.APPROVED })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  async create(dto: CreatePostDto, userId: string): Promise<Post> {
    if (dto.type === 'video' && !dto.shortVideo) {
      throw new BadRequestException('shortVideo is required for type "video"');
    }

    return this.postModel.create({ ...dto, author: userId });
  }

  async update(
    id: string,
    dto: CreatePostDto,
    userId: string,
  ): Promise<Post | null> {
    const post = await this.postModel.findById(id);
    if (!post) return null;
    if (post.author.toString() !== userId.toString()) return null;

    post.title = dto.title;
    post.content = dto.content;
    post.shortVideo = dto.shortVideo;
    post.type = dto.type;

    await post.save();
    return post;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const post = await this.postModel.findById(id);
    if (!post) return false;
    if (post.author.toString() !== userId.toString()) return false;

    await this.postModel.deleteOne({ _id: id });
    return true;
  }
}
