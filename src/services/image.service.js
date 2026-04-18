const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

exports.uploadImage = async (fileBuffer, folder = 'prompts') => {
  try {
    const base64Image = `data:image/png;base64,${fileBuffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(base64Image, {
      folder,
      resource_type: 'auto',
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    logger.error(`Cloudinary Upload Error: ${error.message}`);
    throw new Error('Image upload failed');
  }
};

exports.deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error(`Cloudinary Delete Error: ${error.message}`);
  }
};
