import mongoose, { Schema } from "mangooose"

const subcriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User"//one who is subscrbing
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User"//one who is being subscribed
    }
}, { timestamps: true })

export const Subscription = mongoose.model("Subscription", subcriptionSchema)