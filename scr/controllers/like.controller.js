import mongoose, { isValidObjectId } from "mongoose";
import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/Apierror.js"
import { Like } from "../models/likes.model.js"
import { Apiresponce } from "../utils/Apiresponce.js"



//toggle Video Like tested
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoID } = req.params
    if (!isValidObjectId(videoID)) {
        throw new ApiError(400, "Invalid video ID");
    }
    console.log("dhfgbfdjgb", req.user._id)
    const isexist = await Like.findOne({
        video: videoID,
        likedBy: req.user?._id
    })
    if (isexist) {
        const deletelike = await Like.findByIdAndDelete(isexist._id);
        return res.status(200).json(new Apiresponce(200, "video like removed", deletelike))
    }
    if (!isexist) {
        const like = await Like.create(
            {
                video: videoID,
                likedBy: req.user?._id
            }
        )
        return res.status(200).json(new Apiresponce(200, "video like added", like))
    }

});



//toglecommentLike

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }
    const isexist = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
    })
    if (isexist) {
        const deletelike = await Like.findByIdAndDelete(isexist._id);
        return res.status(200).json(new Apiresponce(200, "comment like removed", deletelike))
    }
    if (!isexist) {
        const like = await Like.create(
            {
                comment: commentId,
                likedBy: req.user?._id
            }
        )
        return res.status(200).json(new Apiresponce(200, "comment like added", like))
    }

});






//toggle tweet like 
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
    const isexist = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id
    })
    if (isexist) {
        const deletelike = await Like.findByIdAndDelete(isexist._id);
        return res.status(200).json(new Apiresponce(200, "tweet like removed", deletelike))
    }
    if (!isexist) {
        const like = await Like.create(
            {
                tweet: tweetId,
                likedBy: req.user?._id
            }
        )
        return res.status(200).json(new Apiresponce(200, "tweet like added", like))
    }

});




//getLikedVideos

const getLikedVideos = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!userId) {
        throw new ApiError(400, "User not found")
    }
    const pipeline = [
        {
            // Stage 1 is its own object
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: { $exists: true }
            }
        },
        {
            // Stage 2 is its own object
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            videoFile: 1,
                            thumbnail: 1
                        }
                    }
                ]
            }
        }
    ];

    const likedVideos = await Like.aggregate(pipeline);
    const result = await Like.aggregate(pipeline);

    return res.status(200).json(new Apiresponce(200, "video likes are fetch", result))
});



export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos }