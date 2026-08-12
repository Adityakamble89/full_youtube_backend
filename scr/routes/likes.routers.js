import { Router } from "express"
import { verifyjwt } from "../middlewares/auth.middleware.js"
import { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos } from "../controllers/like.controller.js"


const router = Router()


router.route("/:videoID").post(verifyjwt, toggleVideoLike);
router.route("/:commentId").post(verifyjwt, toggleCommentLike);
router.route("/:tweetId").post(verifyjwt, toggleTweetLike);
router.route("/getLikedVideos/:userId").get(verifyjwt, getLikedVideos);


export default router
