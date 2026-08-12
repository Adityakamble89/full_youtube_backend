import { Router } from "express"
import { verifyjwt } from "../middlewares/auth.middleware.js"
import { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels } from "../controllers/subcribers.controller.js"
import { Apiresponce } from "../utils/Apiresponce.js"

const router = Router()
// router.route("/subscribe").get(verifyjwt, (req, res) => {
//     res.status(200).json(new Apiresponce(200, "subscriber helth is good"))
// })

//subcribe and unsubcribe to a channel secure route
router.route("/:channelID").post(verifyjwt, toggleSubscription)

//getmysubcriber
router.route("/getsub").get(verifyjwt, getUserChannelSubscribers)

router.route("/getsubscribed").get(verifyjwt, getSubscribedChannels)






export default router
