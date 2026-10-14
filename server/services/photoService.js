import { generateDeletionToken, generatePublicId, hashDeletionToken } from '../utils/id.js'
import { validateDeletionToken, validatePhotoPayload, validatePublicId } from '../utils/validation.js'

export function createPhotoService({ cloudinaryService, photoRepository }) {
  return {
    async createPhoto(payload) {
      const validated = validatePhotoPayload(payload)
      const publicId = generatePublicId()
      const deletionToken = generateDeletionToken()
      const deletionTokenHash = hashDeletionToken(deletionToken)

      const [imageUpload, previewUpload] = await Promise.all([
        cloudinaryService.uploadImage({
          dataUrl: validated.imageDataUrl,
          publicId,
          kind: 'base',
        }),
        validated.previewDataUrl
          ? cloudinaryService.uploadImage({
              dataUrl: validated.previewDataUrl,
              publicId,
              kind: 'preview',
            })
          : Promise.resolve(null),
      ])

      const createdPhoto = photoRepository.create({
        public_id: publicId,
        cloudinary_public_id: imageUpload.publicId,
        image_url: imageUpload.secureUrl,
        preview_url: previewUpload?.secureUrl || null,
        eye_data: JSON.stringify(validated.eyeData),
        eye_settings: JSON.stringify(validated.eyeSettings),
        background_preset: validated.backgroundPreset,
        image_width: validated.imageWidth,
        image_height: validated.imageHeight,
        is_public: validated.isPublic,
        deletion_token_hash: deletionTokenHash,
      })

      return {
        ...createdPhoto,
        deletionToken,
      }
    },

    getPhoto(publicId) {
      const validatedPublicId = validatePublicId(publicId)
      const photo = photoRepository.findByPublicId(validatedPublicId)
      if (!photo) {
        return null
      }

      const { deletionTokenHash, ...publicPhoto } = photo
      return publicPhoto
    },

    getPhotoForDeletion(publicId) {
      const validatedPublicId = validatePublicId(publicId)
      return photoRepository.findByPublicId(validatedPublicId)
    },

    listRecentPublic(limit = 12) {
      const safeLimit = Math.min(Math.max(Number(limit) || 12, 1), 36)
      return photoRepository.listRecentPublic(safeLimit).map(({ deletionTokenHash, ...photo }) => photo)
    },

    incrementViews(publicId) {
      const validatedPublicId = validatePublicId(publicId)
      photoRepository.incrementViews(validatedPublicId)
    },

    async deletePhoto(publicId, deletionToken) {
      const validatedPublicId = validatePublicId(publicId)
      const validatedDeletionToken = validateDeletionToken(deletionToken)
      const photo = photoRepository.findByPublicId(validatedPublicId)

      if (!photo) {
        return false
      }

      if (hashDeletionToken(validatedDeletionToken) !== photo.deletionTokenHash) {
        throw new Error('The deletion token is invalid for this photo.')
      }

      await cloudinaryService.deleteImage(photo.cloudinaryPublicId)
      if (photo.previewUrl) {
        const previewPublicId = photo.cloudinaryPublicId.replace(/\/base$/, '/preview')
        await cloudinaryService.deleteImage(previewPublicId)
      }
      photoRepository.deleteByPublicId(validatedPublicId)
      return true
    },
  }
}
