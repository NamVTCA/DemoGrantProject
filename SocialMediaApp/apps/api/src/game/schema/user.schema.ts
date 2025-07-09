//... các import khác

@Schema({ timestamps: true })
export class User {
    //... các Prop khác của bạn

    // Thêm một object để lưu thông tin game
    @Prop({ type: Object, required: false })
    currentlyPlaying?: {
        gameId: number;
        name: string;
        coverUrl?: string;
    };
}