import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.API_KEY_CLOUDINARY,
    api_secret: process.env.API_SECRET_CLOUDINARY,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        
        // Uploading the file on Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto' // Automatically determine the resource type (image, video, etc.)
        });

        console.log('File uploaded successfully:', response.url);
        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        console.error('Error while uploading to Cloudinary:', error); // Log the error
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // Safely remove the local file if it exists
        }
        throw new Error('File upload failed'); // Re-throw the error so it can be caught by the caller
    }
};

export { uploadOnCloudinary };
