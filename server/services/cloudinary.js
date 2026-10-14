import { v2 as cloudinary } from 'cloudinary'

export function createCloudinaryService(config) {
  let configured = false

  function ensureConfigured() {
    if (configured) {
      return
    }

    if (!config.cloudinaryCloudName || !config.cloudinaryApiKey || !config.cloudinaryApiSecret) {
      throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.')
    }

    cloudinary.config({
      cloud_name: config.cloudinaryCloudName,
      api_key: config.cloudinaryApiKey,
      api_secret: config.cloudinaryApiSecret,
      secure: true,
    })

    configured = true
  }

  return {
    async uploadImage({ dataUrl, publicId, kind }) {
      ensureConfigured()
      const folder = `${config.cloudinaryFolder}/${publicId}`
      const uploadResult = await cloudinary.uploader.upload(dataUrl, {
        folder,
        public_id: kind,
        resource_type: 'image',
        overwrite: true,
        invalidate: true,
      })

      return {
        publicId: uploadResult.public_id,
        secureUrl: uploadResult.secure_url,
      }
    },

    async deleteImage(publicId) {
      ensureConfigured()
      await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
        invalidate: true,
      })
    },
  }
}
