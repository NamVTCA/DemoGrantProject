import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/schema/user.schema';

export enum PostStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: String })
  shortVideo?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ type: String, enum: ['text', 'video', 'mixed'], required: true })
  type: 'text' | 'video' | 'mixed';

  @Prop({ type: String, enum: PostStatus, default: PostStatus.PENDING })
  status: string;
}
export type PostDocument = Post & Document;

export const PostSchema = SchemaFactory.createForClass(Post);
