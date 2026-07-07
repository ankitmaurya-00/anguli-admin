const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

if (!cloudName || !apiKey || !apiSecret) {
  console.warn('Cloudinary is not fully configured for admin backend. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.');
}

// Storage for post media (images/videos)
const postMediaStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'anguli/posts',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'webm'],
    transformation: file.mimetype.startsWith('image/')
      ? [{ width: 1600, crop: 'limit', quality: 'auto' }]
      : undefined,
  }),
});

// Storage for profile pictures
const profilePicStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'anguli/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }],
  },
});

const uploadPostMedia = multer({
  storage: postMediaStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for video
});

const uploadProfilePic = multer({
  storage: profilePicStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = { cloudinary, uploadPostMedia, uploadProfilePic };
