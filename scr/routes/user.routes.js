import { Router } from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/user.controllers.js";
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



export default router