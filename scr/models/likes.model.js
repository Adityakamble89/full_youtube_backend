import { Schema } from "mongoose";
import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const likeSchema = new Schema({
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        index: true
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        index: true
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweeter",
        index: true
    }
}, { timestamps: true })

likeSchema.plugin(mongooseAggregatePaginate);

export const Like = mongoose.model("Like", likeSchema)