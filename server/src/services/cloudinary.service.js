import cloudinary from "../config/cloudinary.js";

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: "wesap",
    });

    return response;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default uploadOnCloudinary;
