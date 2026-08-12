import mongoose, { isValidObjectId } from "mongoose";
import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apierror.js"
import { Subscription } from "../models/subscriptions.model.js"
import { Video } from "../models/video.model.js"
import { Apiresponce } from "../utils/Apiresponce.js"



//const toggleSubscription
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelID } = req.params
    const { subcriber } = req.user?._id
    if (!channelID) throw new ApiError(400, "invalid channel id")
    const checkisSubcribed = await Subscription.findOne({
        subscriber: subcriber,
        channel: channelID
    });
    if (checkisSubcribed) {
        const result = await Subscription.findOneAndDelete(
            {
                subscriber: subcriber,
                channel: channelID
            }

        )
        if (!result) throw new ApiError(400, "error in unsubscribing")
        return res.status(200).json(new Apiresponce(200, "unsubcribed"))
    }

    const result = await Subscription.create({
        subscriber: req.user?._id,
        channel: channelID
    })
    return res.status(200).json(new Apiresponce(200, "subcribed", result))
})



//getUserChannelSubscribers

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    console.log("here is userif", req.user._id, userId)
    if (!isValidObjectId(userId)) throw new ApiError(400, "invalid user id")
    const pipeline = []
    pipeline.push({
        $match: {
            channel: new mongoose.Types.ObjectId(userId)
        }
    })
    pipeline.push({
        $lookup: {
            from: "users",
            localField: "subscriber",
            foreignField: "_id",
            as: "subscriberDetails"
        },

    });
    pipeline.push({
        $unwind: "$subscriberDetails"
    });

    // Stage 4: Project the nested fields cleanly
    pipeline.push({
        $project: {
            _id: 1, // This is the subscription document ID
            "subscriberDetails._id": 1,
            "subscriberDetails.username": 1,
            "subscriberDetails.avatar": 1,
            "subscriberDetails.fullName": 1
        }
    });

    const result = await Subscription.aggregate(pipeline)
    if (!result) throw new ApiError(400, "Error while finding ")

    return res.status(200).json(new Apiresponce(200, "successfully fethced", result))

})



//getSubscribedChannels
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const pipeline = []
    pipeline.push({
        $match: {
            subscriber: new mongoose.Types.ObjectId(req.user._id)
        }
    });
    pipeline.push({
        $lookup: {
            from: "users",
            localField: "channel",
            foreignField: "_id",
            as: "channels"
        }
    });
    pipeline.push({
        $unwind: "$channels"
    });
    pipeline.push({
        $project: {
            _id: 1,
            "channels._id": 1,       // <-- Plumbed to match "channels"
            "channels.username": 1,  // <-- Plumbed to match "channels"
            "channels.avatar": 1

        }

    })
    const result = await Subscription.aggregate(pipeline)
    if (!result) throw new ApiError(400, "Error while finding")
    return res.status(200).json(new Apiresponce(200, "successfully fethced", result))
})




export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels }