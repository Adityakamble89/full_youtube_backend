import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshtoken,
    updateAvatar,
    updatecoverImage,
    updateUserdetails, changecurrentPassword,
    getcurrectUser, getuserchannelProfile, getuserwatchHistory

} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js"

import { verifyjwt } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(
    upload.fields([
        { name: "avtar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser)


router.route("/login").post(loginUser)
//secure routes 
router.route("/logout").post(verifyjwt, logoutUser)
router.route("/refresh-token").post(refreshtoken)
router.route("/update-avtar").patch(verifyjwt, upload.single("avtar"), updateAvatar)
router.route("/update-coverImage").patch(verifyjwt, upload.single("coverImage"), updatecoverImage)
router.route("/current-user").get(verifyjwt, getcurrectUser)
router.route("/change-password").post(verifyjwt, changecurrentPassword)
router.route("/update-user-details").patch(verifyjwt, updateUserdetails)

router.route("/c/:username").get(verifyjwt, getuserchannelProfile)
router.route("/watchhistory").get(verifyjwt, getuserwatchHistory)


export default router