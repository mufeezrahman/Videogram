import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

(async function() {

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.API_KEY_CLOUDINARY, 
        api_secret: process.env.API_SECRET_CLOUDINARY, // Click 'View Credentials' below to copy your API secret
    });
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        //Uploading the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        console.log("File uploaded successfully:",response.url);
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath)//Removes the locally saved  temporary file as the file upload failed
    }
}

export {uploadOnCloudinary}