import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({
    limit: "16kb"
}))
app.use(express.urlencoded({
    extended: true
}))
app.use(express.static("public"))
app.use(cookieParser())


import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import likeRouter from "./routes/likes.routers.js"
import commentsRouter from "./routes/comments.routers.js"
import subscriberRouter from "./routes/subscribers.routers.js"
import tweetRouter from "./routes/tweets.router.js"
import playlistRouter from "./routes/playlist.router.js"


app.use("/api/v1/user", userRouter)
app.use("/api/v1/video", videoRouter)
app.use("/api/v1/like", likeRouter)
app.use("/api/v1/comment", commentsRouter)
app.use("/api/v1/subscribe", subscriberRouter)
app.use("/api/v1/tweet", tweetRouter)
app.use("/api/v1/playlist", playlistRouter)



// Error-handling middleware — catches ApiError and other errors
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500
    const message = err.message || "Internal Server Error"
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.error || []
    })
})

export { app }


