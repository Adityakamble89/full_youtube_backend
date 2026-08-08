import mongoose from "mongoose"
import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apierror.js"
import { Video } from "../models/video.model.js"
import { uploadcloudniry } from "../utils/cloudinary.js"
import { Apiresponce } from "../utils/Apiresponce.js"
import { User } from "../models/user.model.js"


//upload video 
const uploadvideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    if (!title || !description) {
        throw new ApiError(400, "title and description is required")
    }
    const owner = req.user._id
    if (!owner) {
        throw new ApiError(400, "owner requied ")
    }
    const vidoelocalpath = req.files?.video?.[0]?.path;
    const thumbnailpath = req.files?.thumbnail?.[0]?.path;
    if (!vidoelocalpath) {
        throw new ApiError(401, "local file upload error")
    }
    if (!thumbnailpath) {
        throw new ApiError(401, "thumbnail is not uploaded")
    }
    console.time("Cloudinary: uploads")

    const [videoupload, thumbnailuoload] = await Promise.all([
        uploadcloudniry(vidoelocalpath),
        thumbnailpath ? uploadcloudniry(thumbnailpath) : Promise.resolve(null)
    ])
    console.timeEnd("Cloudinary: uploads")
    if (!videoupload) {
        throw new ApiError(500, "video upload error")
    }
    if (!thumbnailuoload) {
        throw new ApiError(500, "thumbnail upload error")
    }
    console.time("databse start ")
    const video = await Video.create(
        {
            title: title,
            description: description,
            video: videoupload.url,
            thumbnail: thumbnailuoload.url,
            duration: videoupload.duration,
            owner: owner,
        }
    )
    console.timeEnd("databse start ")

    if (!video) {
        throw new ApiError(500, "Failed to create video in database")
    }



    return res.status(201).json(new Apiresponce(201, video, "Video uploaded successfully"))
})



//get all video 

const getAllVideo = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    const pipeline = [];

    pipeline.push({
        $match: { ispublished: true }
    });

    pipeline.push({
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [
                {
                    $project: {
                        username: 1,
                        fullname: 1,
                        avatar: 1
                    }
                }
            ]
        }
    });
    pipeline.push({
        $addFields: {
            owner: { $first: "$owner" }
        }
    });


    pipeline.push({
        $sort: {
            [sortBy]: sortType === "asc" ? 1 : -1
        }
    });

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const result = await Video.aggregatePaginate(Video.aggregate(pipeline), options);

    const videos = await Video.aggregate(pipeline);

    return res.status(200).json({
        message: "Step 1 complete!",
        dataReceived: { result }
    });
});



export { uploadvideo, getAllVideo }