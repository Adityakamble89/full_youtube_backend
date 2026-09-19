import { Router } from "express"
import { verifyjwt } from "../middlewares/auth.middleware.js"
import {
    createPlaylist, updatePlaylist, addvideosinPlaylist,
    deletePlaylist, removeVideos, getUserPlaylists, getPlaylistById
} from "../controllers/playlist.controller.js"


const router = Router()

router.route("/create").post(verifyjwt, createPlaylist)
router.route("/:playlistID").patch(verifyjwt, updatePlaylist)
router.route("/addvideo/:playlistID").patch(verifyjwt, addvideosinPlaylist)
router.route("/delete/:playlistID").delete(verifyjwt, deletePlaylist)
router.route("/remove-videos/:playlistID").patch(verifyjwt, removeVideos)
router.route("/:playlistID").get(verifyjwt, getPlaylistById)
router.route("/:userId").get(verifyjwt, getUserPlaylists)






export default router
