import mongoose, { isValidObjectId } from "mongoose";
import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/Apierror.js"
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import { Apiresponce } from "../utils/Apiresponce.js"




//comment on video 
const addcommentonVideo = asyncHandler(async (req, res) => {
    const { videoID } = req.params
    if (!videoID) {
        throw new ApiError(400, "Invalid Video ID")
    }
    const { content } = req.body
    if (!content) {
        throw new ApiError(400, "Comment is required")
    }
    const comment = await Comment.create(
        {
            content: content,
            video: videoID,
            owner: req.user._id
        }

    )

    return res.status(201).json(new Apiresponce(201, "comment added successfully", comment))
})



//update comment
const updatecommentOnVideo = asyncHandler(async (req, res) => {
    const { commentID } = req.params
    console.log("commentId", commentID)
    if (!commentID) {
        throw new ApiError(400, "invalid comment id")
    }
    const { content } = req.body;
    console.log("body", content)
    if (!content) {
        throw new ApiError(400, "comment is required")
    }
    console.log("going to update")
    const updatecomment = await Comment.findByIdAndUpdate(
        commentID,
        {
            content: content,
        },
        {
            new: true
        }
    )

    return res.status(200).json(new Apiresponce(200, "comment updated successfully", updatecomment))


})



//delete the comment 
const deletecommentOnVideo = asyncHandler(async (req, res) => {
    const { commentID } = req.params
    if (!commentID) {
        throw new ApiError(400, "invalid comment id")
    }
    const commentdelete = await Comment.findByIdAndDelete(
        commentID
    )
    if (!commentdelete) {
        throw new ApiError(400, "Error while deleting the comment")
    }
    return res.status(200).json(new Apiresponce(200, "comment deleted successfully", commentdelete))

})



const getvideoComments = asyncHandler(async (req, res) => {
    const { videoID } = req.params;

    // 1. MUST extract the query variables before using them!
    const { page = 1, limit = 10, sortBy = "createdAt", sortType = "desc" } = req.query;

    if (!videoID) {
        throw new ApiError(400, "invalid video id");
    }

    const pipeline = [];

    // Stage 1: Match the video
    pipeline.push({
        $match: {
            video: new mongoose.Types.ObjectId(videoID)
        }
    });

    // Stage 2: Join the user data
    pipeline.push({
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner"
        }
    });

    // Stage 3: Unwind the owner array into an object
    pipeline.push({
        $unwind: "$owner"
    });

    // Stage 4: Dynamic sorting
    pipeline.push({
        $sort: {
            [sortBy]: sortType === "asc" ? 1 : -1
        }
    });

    // Stage 5: Select only what we need (Replacing the AI's broken nested pipeline)
    pipeline.push({
        $project: {
            content: 1,
            createdAt: 1,
            "owner.username": 1,
            "owner.avatar": 1
        }
    });

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    // Execute paginated pipeline
    const commentsAggregate = Comment.aggregate(pipeline);
    const paginatedComments = await Comment.aggregatePaginate(commentsAggregate, options);

    // Fixed typo and argument order here
    return res
        .status(200)
        .json(new Apiresponce(200, paginatedComments, "Comments fetched successfully"));
});

export { addcommentonVideo, updatecommentOnVideo, deletecommentOnVideo, getvideoComments }