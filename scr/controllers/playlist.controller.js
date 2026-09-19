import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/Apierror.js"
import { Apiresponce } from "../utils/Apiresponce.js"
import { Playlist } from "../models/playlist.model.js"
import { response } from "express"
import mongoose from "mongoose"






//create playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, videos } = req.body

    if (!name || !description) {
        throw new ApiError("Name and discreption is required", 400);
    }
    if (videos) {
        const playlist = await Playlist.create({
            name,
            description,
            owner: req.user._id,
            videos
        })
        return res.status(201).json(new Apiresponce(201, "playlist is created successfully", playlist))
    }
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })
    if (!playlist) throw new ApiError(400, "error while the creating ");
    return res.status(201).json(new Apiresponce(201, "playlist is created successfully", playlist))
})

//get user playlist
const updatePlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    const { playlistID } = req.params
    if (!name || !description) {
        throw new ApiError(400, "required name and description !")
    }
    const updateplaylist = await Playlist.findOneAndUpdate({ _id: playlistID, owner: req.user._id },
        {
            name,
            description
        }, { new: true })
    if (!updateplaylist) throw new ApiError(400, "error while the creating ")
    return res.status(201).json(new Apiresponce(201, "playlist is created successfully", updateplaylist))
})


//const add the videos 
const addvideosinPlaylist = asyncHandler(async (req, res) => {
    const { videosID } = req.body
    const { playlistID } = req.params

    if (!videosID || !playlistID) {
        throw new ApiError(400, "Video ID and Playlist ID are required")
    }

    // ONE TRIP to the database: Checks ID, checks Owner, AND adds the video!
    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistID,
            owner: req.user._id // Check ownership here!
        },
        {
            $addToSet: { videos: videosID } // Add the video safely
        },
        { new: true }
    )

    if (!updatedPlaylist) {
        // If null, they either don't own it, or it doesn't exist
        throw new ApiError(404, "Playlist not found or you are not authorized to add videos")
    }

    return res.status(200).json(
        new Apiresponce(200, updatedPlaylist, "Video added to playlist successfully")
    )
})

//delete the playlist 
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistID } = req.params;
    if (!playlistID) throw new ApiError(400, "playlist id is required")

    const deleteplaulist = await Playlist.findOneAndDelete({
        _id: playlistID, owner: req.user?._id
    })
    if (!deleteplaulist) throw new ApiError(400, "error while the deleting")
    return res.status(200).json(new Apiresponce(200, "playlist is deleted successfully", deleteplaulist))
})


//remove the video from playlist

const removeVideos = asyncHandler(async (req, res) => {
    const { playlistID } = req.params;
    const { videosID } = req.body
    if (!playlistID || !videosID) {
        throw new ApiError(400, "playlist and videos are required !")
    }
    const removevideos = await Playlist.findOneAndUpdate({ _id: playlistID, owner: req.user._id }, { $pull: { videos: videosID } }, { new: true })
    if (!removevideos) throw new ApiError(400, "error while the removing videos")
    return res.status(200).json(new Apiresponce(200, removevideos, "video is deleted from the playlist"))

})


//getPlaylistById
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistID } = req.params
    if (!isValidObjectId(playlistID)) throw new ApiError(400, "invalid playlist id")
    const pipeline = []
    pipeline.push({
        $match: {
            _id: new mongoose.Types.ObjectId(playlistID)
        }
    });
    pipeline.push({
        $lookup: {
            from: "videos",
            localField: "videos",
            foreignField: "_id",
            as: "videosdoc"
        }
    });
    pipeline.push({
        $project: {
            name: 1,
            description: 1,
            owner: 1,
            createdAt: 1,
            videosdoc: 1
        }
    })


    return res.status(200).json(new Apiresponce(200, getplaylist, "playlist fetched successfully"))


})

//getUserPlaylists

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!userId) throw new ApiError(400, "user id is required");
    const pipeline = [];

    pipeline.push({
        $match: {
            owner: new mongoose.Types.ObjectId(userId)
        }
    });
    pipeline.push({
        $lookup: {
            from: "videos",
            localField: "videos",
            foreignField: "_id",
            as: "videosdoc"
        }
    });
    pipeline.push({
        $project: {
            name: 1,
            description: 1,
            owner: 1,
            createdAt: 1,
            videosdoc: 1
        }
    })

    const userPlaylists = await Playlist.aggregate(pipeline);
    if (!userPlaylists) throw new ApiError(400, "error while the fetching user playlists")
    return res.status(200).json(new Apiresponce(200, userPlaylists, "user playlists fetched successfully"))
})

export { createPlaylist, updatePlaylist, addvideosinPlaylist, deletePlaylist, removeVideos, getPlaylistById, getUserPlaylists }










