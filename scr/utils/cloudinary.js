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


const deletecloudinary = async (url) => {
    try {
        // 1. Split the URL by forward slashes
        const parts = url.split('/');

        // 2. Find the index of 'upload' to locate resource type and public ID
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1) {
            throw new Error('Invalid Cloudinary URL format');
        }

        // 3. Resource type is always the element immediately before 'upload'
        const resourceType = parts[uploadIndex - 1]; // 'video' or 'image'

        // 4. Get all elements after the version tag (e.g., 'v1786155814')
        // This safely handles folders if your public ID has them
        const publicIdWithExtension = parts.slice(uploadIndex + 2).join('/');

        // 5. Strip the file extension (.mp4, .jpg, etc.)
        const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));

        console.log(`Extracted Resource Type: ${resourceType}`);
        console.log(`Extracted Public ID: ${publicId}`);

        // 6. Execute the deletion
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });

        console.log('Deletion result:', result);
        return result;

    } catch (e) {
        console.error("Cloudinary delete error:", e.message || e)
        return null
    }
}
export { uploadcloudniry, deletecloudinary }