import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose'; // <-- Sửa ở dòng này

@Schema({ timestamps: true })
export class Follow {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  follower_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  following_id: Types.ObjectId;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);
FollowSchema.index({ follower_id: 1, following_id: 1 }, { unique: true });