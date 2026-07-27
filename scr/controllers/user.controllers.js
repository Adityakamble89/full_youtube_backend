import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apierror.js"
import { User } from "../models/user.model.js"
import { uploadcloudniry } from "../utils/cloudinary.js"
import { Apiresponce } from "../utils/Apiresponce.js"
import jwt from "jsonwebtoken"
import { AsyncLocalStorage } from "async_hooks"
import { json } from "stream/consumers"
import { type } from "os"
import mongoose from "mongoose"



const generateAccessandrefreshtokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        // console.log("inside the function", refreshToken, "", accessToken)
        return { accessToken, refreshToken }
    } catch (e) {
        throw new ApiError(400, "Somthing went wrong .")
    }
}







const registerUser = asyncHandler(async (req, res) => {
    const { email, password, username, fullname } = req.body

    if (
        [fullname, email, username, password].some((field) => !field || field.trim() === "")
    ) {
        throw new ApiError(400, "All fields (fullname, email, username, password) are required")
    }

    console.time("DB: findExistingUser")
    const existingUser = await User.findOne(
        { $or: [{ email }, { username }] }
    )
    console.timeEnd("DB: findExistingUser")

    if (existingUser) {
        throw new ApiError(409, "User already exists")
    }

    const avtarLocalPath = req.files?.avtar?.[0]?.path;
    let coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avtarLocalPath) {
        throw new ApiError(400, "avtar file is required")
    }

    // Upload both images in parallel instead of one-by-one
    console.time("Cloudinary: uploads")
    const [avtar, coverImage] = await Promise.all([
        uploadcloudniry(avtarLocalPath),
        coverImageLocalPath ? uploadcloudniry(coverImageLocalPath) : Promise.resolve(null)
    ])
    console.timeEnd("Cloudinary: uploads")

    if (!avtar) {
        throw new ApiError(400, "Failed to upload avtar to Cloudinary")
    }

    console.time("DB: createUser")
    const user = await User.create(
        {
            fullname,
            email,
            password,
            username: username.trim().toLowerCase(),
            avtar: avtar.url,
            coverImage: coverImage?.url || ""
        }
    )
    console.timeEnd("DB: createUser")

    const createduser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createduser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new Apiresponce(201, createduser, "User registered successfully")
    )
})








const loginUser = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body
    if (!email && !username) {
        throw new ApiError(400, "Please Enter all the fields")
    }
    const isexist = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (!isexist) {
        throw new ApiError(400, "User not found !")
    }

    const passwaordchek = await isexist.isPasswordCorrect(password)
    if (!passwaordchek) {
        throw new ApiError(400, "Invalid password!")
    }

    const { accessToken, refreshToken } = await generateAccessandrefreshtokens(isexist._id)
    // console.log(accessToken, accessToken, "the access and refresh token")
    // await User.updateOne(
    //     {
    //         _id: isexist._id
    //     },
    //     {
    //         refreshToken
    //     }
    // )
    const logedinuser = await User.findById(isexist._id).select(
        "-password -refreshToken"
    )

    const option = {
        httpOnly: true,
        secure: true,
    }

    // console.log("access and refesh", accessToken, refreshToken)
    return res.status(200).cookie(
        "accesstoken", accessToken, option
    )
        .cookie("refreshtoken", refreshToken, option)
        .json(
            new Apiresponce(200,
                { user: logedinuser, accessToken, refreshToken },
                "the User is logedin successfull "
            )
        )


})










const logoutUser = asyncHandler(async (req, res) => {
    console.log("here is logout user rout")
    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: undefined
            }

        },
        {
            new: true
        }
    )

    const option = {
        httpOnly: true,
        secure: true

    }

    return res.status(200)
        .clearCookie("accesstoken", option)
        .clearCookie("refreshtoken", option)
        .json(
            new Apiresponce(200, "User is logged out successfull")
        )


})











const refreshtoken = asyncHandler(async (req, res) => {
    const incomingrefreshtoken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingrefreshtoken) {
        throw new ApiError(401, "Unauthorized request")
    }
    try {
        const decodedtoken = jwt.verify(incomingrefreshtoken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedtoken?._id)
        if (!user) {
            throw new ApiError(400, "Invalid Token")
        }
        if (incomingrefreshtoken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is expired")
        }
        const option = {
            httpOnly: true,
            secure: true,
        }

        const { newaccessToken, newrefreshToken } = await generateAccessandrefreshtokens(user._id)
        return res.status(200)
            .cookie("accesstoken", newaccessToken, option)
            .cookie("refreshtoken", newrefreshToken, option)
            .json(
                new Apiresponce(200,
                    { newaccessToken, newrefreshToken },
                    "the User is logedin successfull "
                )
            )

    } catch (error) {
        console.log(error, "invaild token here")
        throw new ApiError(401, error.message)
    }

})





const changecurrentPassword = asyncHandler(async (req, res) => {
    const { oldpassword, newpassword } = req.body
    console.log(oldpassword, newpassword, "the old and new password")
    console.log(req.user._id, "hhhdhdhdhyrdyuxmxx")
    const user = await User.findById(req.user?._id)
    console.log(user, "the user")
    const ispasswordcorrect = user.isPasswordCorrect(oldpassword)
    if (!ispasswordcorrect) {
        throw new ApiError(400, "Invaild password!")

    }
    user.password = newpassword
    await user.save({ validateBeforeSave: false })
    return res.status(200)
        .json(new Apiresponce(200, "password is changed successfull"))


})





const getcurrectUser = asyncHandler(async (req, res) => {
    const currentUser = req.user
    return res.status(200)
        .json(new Apiresponce(200, "the current user is foundsuccessfull", currentUser))

})





const updateAvatar = asyncHandler(async (req, res) => {

    const avatrlocalpath = req.file?.path

    if (!avatrlocalpath) {
        throw new ApiError(400, "Avatar file is required")
    }
    console.log("get the file image", avatrlocalpath)
    const avtar = await uploadcloudniry(avatrlocalpath)

    if (!avtar?.url) {
        throw new ApiError(400, "Error while uploading image to Cloudinary")
    }
    console.log("after this updating all ")
    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                avtar: avtar.url
            }
        }, {
        new: true
    }
    ).select("-password")

    return res.status(200).json(
        new Apiresponce(200, { avtar: avtar.url }, "Avatar updated successfully")
    )
})


const updatecoverImage = asyncHandler(async (req, res) => {
    const coverimagelocalpath = req.file?.path
    if (!coverimagelocalpath) {
        throw new ApiError(400, "Cover image file is required")
    }
    const coverImage = await uploadcloudniry(coverimagelocalpath)
    if (!coverImage?.url) {
        throw new ApiError(400, "Error while uploading cover image to Cloudinary")
    }
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            coverImage: coverImage.url
        }
    }, { new: true }).select("-password")

    return res.status(200).json(
        new Apiresponce(200, { coverImage: coverImage.url }, "Cover image updated successfully")
    )

})



const updateUserdetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body
    if (!fullname || !email) throw new ApiError(400, "Please enter all the fields")
    const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {
            fullname,
            email
        }
    }, { new: true }).select("-password")

    return res.status(201).json(
        new Apiresponce(201, "User details is updated successfully")
    )


})





const getuserchannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params
    if (!username?.trim()) throw new ApiError(400, "Please enter all the fields")
    //const user = await User.findOne(username).select("-password -refreshToken")
    // if (!user) throw new ApiError(401, "user not found")
    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },

        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            },




        },

        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedto"
            },




        },


        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelssubscribedcount: {
                    $size: "$subscribedto"
                },
                issubscribed: {
                    $cond: {
                        if: { $in: [req.user._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    }
                }
            }
        },
        {
            $project: {
                email: 1,
                fullname: 1,
                username: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                channelssubscribedcount: 1,
                issubscribed: 1
            }
        }



    ])


    if (!channel?.length) {
        throw new ApiError(401, "NO channel found")
    }

    return res.status(200).json(new Apiresponce(200, channel[0], "here is the profile data"))

})






const getuserwatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        }, {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [{
                                $project: {
                                    fullname: 1,
                                    username: 1,
                                    avtar: 1
                                }
                            }]
                        },

                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "owner"
                            }
                        }
                    }
                ]

            },


        },
        {

        }
    ])

    return res.status(200).json(new Apiresponce(200, user[0].watchHistory, "here is the profile data"))

})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshtoken,
    updateAvatar,
    getcurrectUser,
    changecurrentPassword,
    updatecoverImage,
    updateUserdetails,
    getuserchannelProfile,
    getuserwatchHistory

}