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


//routes 

import userRouter from "./routes/user.routes.js"
app.use("/api/v1/user", userRouter)

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


