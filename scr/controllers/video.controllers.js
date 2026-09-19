import mongoose from "mongoose"
import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { Video } from "../models/video.model.js"
import { uploadcloudniry, deletecloudinary } from "../utils/cloudinary.js"
import { Apiresponce } from "../utils/Apiresponce.js"



//upload video tested 
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



//get all video tested 

const getAllVideo = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    const pipeline = [];
    if (query) {
        pipeline.push(
            {
                $match: {
                    $or: [
                        {
                            title: {
                                $regex: query,
                                $options: "i"
                            }
                        },
                        {
                            description: {
                                $regex: query,
                                $options: "i"
                            }
                        }
                    ]
                }
            }
        )
    }

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

    // const videos = await Video.aggregate(pipeline);

    return res.status(200).json({
        message: "Step 1 complete!",
        dataReceived: { result }
    });
});




//getvideobyId tested 
const getvideobyId = asyncHandler(async (req, res) => {
    const { videoID } = req.params
    if (!videoID) {
        throw new ApiError(401, "video is not found")
    }
    const video = await Video.findById(videoID)
    if (!video) {
        throw new ApiError(401, "not found")
    }
    const pipeline = [];
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
                        avatar: 1,
                        fullname: 1
                    }
                }
            ]
        }
    });
    pipeline.push({
        $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "video",
            as: "likes",
        }
    })
    pipeline.push({
        $addFields: {
            likesCount: {
                $size: "$likes"
            }
        }
    })
    pipeline.push(
        {
            $addFields: {
                owner: { $first: "$owner" }
            }
        }
    )



    const videos = await Video.aggregate(pipeline);

    return res.status(200).json(new Apiresponce(200, "data", videos[0]))
})




//delete the video tested 

const deletevideobyId = asyncHandler(async (req, res) => {
    const { videoID } = req.params
    if (!videoID) {
        throw new ApiError(400, "video is not fount ")
    }
    const video = await Video.findByIdAndDelete(videoID)
    if (!video) {
        throw new ApiError(400, "error while deleting the video")
    }
    // const checkvideodeleted = await Video.findById(videoId)
    // if (checkvideodeleted) {
    //     throw new ApiError(400, "video not deleted")
    // }
    const deletecloudnaryoldvideo = await deletecloudinary(video.video);
    if (deletecloudnaryoldvideo) {
        console.log("yes the file is deleted from the cloudanary")
    }
    if (!deletecloudnaryoldvideo) {
        throw new ApiError(400, "error while deleting the video from cloudinary")
    }
    const deletecloudnaryoldthumbnail = await deletecloudinary(video.thumbnail);
    if (deletecloudnaryoldthumbnail) {
        console.log("yes the file is deleted from the cloudanary")
    }
    if (!deletecloudnaryoldthumbnail) {
        throw new ApiError(400, "error while deleting the thumbnail from cloudinary")
    }
    return res.status(200).json(new Apiresponce(200, "video deleted successfully"))
})


//update the video details  tested 
const updateVideo = asyncHandler(async (req, res) => {
    const { videoID } = req.params
    const { title, description } = req.body;
    if (!title || !description || !videoID) {
        throw new ApiError(401, "video id title and description is required")
    }
    const video = await Video.findByIdAndUpdate(videoID, {
        $set: { title, description },

    }, {
        new: true
    });
    if (!video) {
        throw new ApiError(401, "Error while the updating detais")
    }
    return res.status(200).json(new Apiresponce(200, "the detais are updated successfull", video))




})



//update the thumbnail 
const updatethumbnail = asyncHandler(async (req, res) => {
    const { videoID } = req.params
    console.log("this is the id ", videoID)
    if (!videoID) throw new ApiError(400, "Not Found !");
    const video = await Video.findById(videoID);
    if (!video) throw new ApiError(400, "Error while finding video");

    const thumbnailocalpath = req.files?.thumbnail[0].path;
    if (!thumbnailocalpath) throw new ApiError(400, "No File is Uploaded ");
    const newthumbnail = await uploadcloudniry(thumbnailocalpath);
    if (!newthumbnail) throw new ApiError(400, "Error while uploading");
    const olddeleteurl = await deletecloudinary(video.thumbnail);
    if (!olddeleteurl) throw new ApiError(400, "Error while deleting old thumbnail");


    video.thumbnail = newthumbnail.url
    const responcedb = await video.save({ validateBeforeSave: false });

    if (!responcedb) {
        throw new ApiError(400, "Error while updating dbs")
    }




    return res.status(200).json(new Apiresponce(200, { data: video }, "success"));

})




//unpublish thr video 
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoID } = req.params
    console.log(`you can see id ${videoID}`)
    const video = await Video.findById(videoID);
    if (!video) throw new ApiError(404, "Video not found");
    // 2. Toggle the boolean property on the document
    video.ispublished = !video.ispublished;

    // 3. Save updated document
    await video.save({ validateBeforeSave: false });

    return res.status(200).json(new Apiresponce(200, { data: video }, "success"));
})




export {
    uploadvideo, getAllVideo,
    getvideobyId, deletevideobyId,
    updateVideo, updatethumbnail, togglePublishStatus
}