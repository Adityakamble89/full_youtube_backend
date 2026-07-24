import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apierror.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"


export const verifyjwt = asyncHandler(async (req, _, next) => {

    try {
        const token = req.cookies?.acesstoken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(401, "Unauthorized Aceess ! ")
        }
        const decodedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedtoken._id).select("-password -refreshtoken")
        if (!user) {
            throw new ApiError(401, "invalid access token ")
        }
        req.user = user
        next()
    } catch (error) {
        console.log("enterin catch in verify jwt")
        throw new ApiError(401, error?.message || "invalid access token ")
    }
})