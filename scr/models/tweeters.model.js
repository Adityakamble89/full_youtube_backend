import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const tweeterSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true,
        required: true,

    },
    content: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

tweeterSchema.plugin(mongooseAggregatePaginate);

export const Tweeter = mongoose.model("Tweeter", tweeterSchema)