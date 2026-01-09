import cloudinary from "./cloudinary.js";
export const uploadToCloud = async (imageUrl) => {
    if (typeof imageUrl !== "string" || imageUrl.trim() === "") {
        console.error(" Invalid imageUrl type:", typeof imageUrl);
        return null;
    }
    try {
        const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
            folder: "D-CHAT/avatars",
            resource_type: "auto",
        });
        console.log(uploadResponse);
        console.log(uploadResponse.secure_url);
        return uploadResponse.secure_url;
    }
    catch (error) {
        console.log('cloud upload error', error);
        return null;
    }
};
