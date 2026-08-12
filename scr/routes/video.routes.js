import {
    uploadvideo, getAllVideo, getvideobyId,
    deletevideobyId, updateVideo, updatethumbnail, togglePublishStatus
} from "../controllers/video.controllers.js"
import { Router } from "express"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyjwt } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/uploadvideo").post(verifyjwt, upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
]), uploadvideo)


router.route("/all-video").get(verifyjwt, getAllVideo)


// getvideobyid
router.route("/:videoID").get(verifyjwt, getvideobyId)



// delete video
router.route("/:videoID").delete(verifyjwt, deletevideobyId)

router.route("/update-details/:videoID").patch(verifyjwt, updateVideo)


router.route("/update-thumbnail/:videoID").patch(verifyjwt, upload.fields([
    { name: "thumbnail", maxCount: 1 }
]), updatethumbnail);

router.route("/publish/:videoID").patch(verifyjwt, togglePublishStatus);



export default router