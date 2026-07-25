import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apierror.js"
import { User } from "../models/user.model.js"
import { uploadcloudniry } from "../utils/cloudinary.js"
import { Apiresponce } from "../utils/Apiresponce.js"
import jwt from "jsonwebtoken"



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

export { registerUser, loginUser, logoutUser, refreshtoken }