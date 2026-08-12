import { Router } from "express"
import { verifyjwt } from "../middlewares/auth.middleware.js"
import { createTweet, updateTweet, deleteTweet, getmyTweet } from "../controllers/tweets.controller.js"


const router = Router()
//creating tweet
router.route("/create-tweet").post(verifyjwt, createTweet);
router.route("/update-tweet/:tweetID").patch(verifyjwt, updateTweet);
router.route("/delete-tweet/:tweetID").delete(verifyjwt, deleteTweet);
router.route("/get-my-tweet").get(verifyjwt, getmyTweet);






export default router