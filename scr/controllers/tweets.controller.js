import mongoose, { connect, isValidObjectId } from "mongoose";
import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apierror.js"
import { Like } from "../models/likes.model.js"
import { Apiresponce } from "../utils/Apiresponce.js"
import { Tweeter } from "../models/tweeters.model.js";

//create the tweet
const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    if (!content) throw new ApiError(400, "conent is mandetory !");
    const result = await Tweeter.create(
        {
            owner: req.user._id,
            content
        }
    );
    if (!result) throw new ApiError(500, "error while creating tweet");
    return res.status(201).json(new Apiresponce(201, result, "created tweet successfully"))

})



//update the tweet
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetID } = req.params;
    const { content } = req.body;

    if (!content) throw new ApiError(400, "content is required")
    if (!tweetID || !isValidObjectId(tweetID)) throw new ApiError(400, "Invalid tweet ID")

    const tweet = await Tweeter.findById(tweetID);
    if (!tweet) throw new ApiError(404, "Tweet not found");

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }

    const updatedtweet = await Tweeter.findByIdAndUpdate(
        tweetID,
        {
            $set: { content }
        },
        {
            returnDocument: 'after'
        }
    )

    if (!updatedtweet) throw new ApiError(500, "Failed to update tweet");
    return res.status(200).json(new Apiresponce(200, updatedtweet, "tweet updated successfully"))
})



//delete the tweet
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetID } = req.params;
    if (!tweetID || !isValidObjectId(tweetID)) throw new ApiError(400, "tweet now found");
    const tweet = await Tweeter.findById(tweetID);
    if (!tweet) throw new ApiError(404, "Tweet not found");

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }
    const deletedtweet = await Tweeter.findByIdAndDelete(tweetID)
    if (!deletedtweet) throw new ApiError(500, "error while the deleting the tweet")
    return res.status(201).json(new Apiresponce(201, deletedtweet, "yes tweet is deleted"))
})



//get my tweet
const getmyTweet = asyncHandler(async (req, res) => {
    const userID = req.user._id;
    console.log(userID)
    const pipeline = []
    pipeline.push({
        $match: {
            owner: new mongoose.Types.ObjectId(userID)
        }
    })
    pipeline.push({
        $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "tweet",
            as: "likes"
        }
    })
    pipeline.push({
        $addFields: {
            likesCount: {
                $size: "$likes"
            }
        }
    })
    pipeline.push({
        $project: {
            content: 1,
            createdAt: 1,
            likesCount: 1,

        }
    })



    const result = await Tweeter.aggregate(pipeline)
    console.log(result)


    return res.status(200).json(new Apiresponce(200, result, "Tweets fetched"));

})


export { createTweet, updateTweet, deleteTweet, getmyTweet }