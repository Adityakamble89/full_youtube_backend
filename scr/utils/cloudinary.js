import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadcloudniry = async (localpath) => {
    try {
        if (!localpath) return null

        const response = await cloudinary.uploader.upload(localpath, {
            resource_type: "auto",
            quality: "auto",
            fetch_format: "auto",
            transformation: [
                { width: 1024, height: 1024, crop: "limit" }
            ],
            timeout: 30000
        })

        if (fs.existsSync(localpath)) fs.unlinkSync(localpath)
        console.log("file is uploaded on cloudinary:", response.url)
        return response
    } catch (e) {
        console.error("Cloudinary upload error:", e.message || e)
        if (fs.existsSync(localpath)) fs.unlinkSync(localpath)
        return null
    }
}

export { uploadcloudniry }