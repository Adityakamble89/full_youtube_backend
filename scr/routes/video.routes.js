import { uploadvideo } from "../controllers/video.controllers.js"
import { Router } from "express"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyjwt } from "../middlewares/auth.middleware.js"

const router = Router()
router.route("/uploadvideo").post(verifyjwt, upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
]), uploadvideo)

export default router