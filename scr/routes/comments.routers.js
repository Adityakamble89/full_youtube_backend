import {
    addcommentonVideo, updatecommentOnVideo, deletecommentOnVideo,
    getvideoComments

} from "../controllers/comments.controller.js"
import { Router } from "express"
import { verifyjwt } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/:videoID").post(verifyjwt, addcommentonVideo)
router.route("/update/:commentID").patch(verifyjwt, updatecommentOnVideo)
router.route("/delete/:commentID").delete(verifyjwt, deletecommentOnVideo)
router.route("/all-comments/:videoID").get(verifyjwt, getvideoComments)

export default router