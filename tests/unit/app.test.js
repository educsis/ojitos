// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { createPhotoService } from '../../server/services/photoService.js'
import { buildDevPhotoShell, injectOgMeta } from '../../server/utils/html.js'

const storedPhoto = {
  publicId: 'Ab7Kx92P',
  cloudinaryPublicId: 'googly/base',
  imageUrl: 'https://example.com/image.jpg',
  previewUrl: 'https://example.com/preview.jpg',
  eyeData: [
    { id: 'left', x: 0.4, y: 0.4, radiusX: 0.08, radiusY: 0.07, rotation: 0 },
    { id: 'right', x: 0.6, y: 0.4, radiusX: 0.08, radiusY: 0.07, rotation: 0 },
  ],
  eyeSettings: { eyeScale: 1, pupilScale: 0.4, animationSpeed: 0.12, wobble: 0.2, blink: true },
  backgroundPreset: 'candy-pink',
  imageWidth: 1200,
  imageHeight: 900,
  views: 3,
  createdAt: '2026-10-13T12:00:00.000Z',
  publicUrl: 'http://localhost:5173/g/Ab7Kx92P',
  deletionTokenHash: 'hashed-token',
}

function createMockPhotoRepository() {
  return {
    findByPublicId(publicId) {
      return publicId === storedPhoto.publicId ? storedPhoto : null
    },
    listRecentPublic() {
      return [storedPhoto]
    },
    incrementViews() {},
    create() {
      return storedPhoto
    },
    deleteByPublicId() {},
  }
}

describe('shared photo loading helpers', () => {
  it('returns public photo data without deletion secrets', () => {
    const service = createPhotoService({
      cloudinaryService: {
        async uploadImage() {
          throw new Error('not used')
        },
        async deleteImage() {
          throw new Error('not used')
        },
      },
      photoRepository: createMockPhotoRepository(),
    })

    const photo = service.getPhoto('Ab7Kx92P')

    expect(photo.publicId).toBe('Ab7Kx92P')
    expect(photo.publicUrl).toBe('http://localhost:5173/g/Ab7Kx92P')
    expect(photo).not.toHaveProperty('deletionTokenHash')
  })

  it('injects og metadata into share html', () => {
    const html = injectOgMeta('<html><head></head><body></body></html>', storedPhoto)

    expect(html).toContain('og:image')
    expect(html).toContain(storedPhoto.previewUrl)
    expect(html).toContain(storedPhoto.publicUrl)
  })

  it('builds a dev redirect shell for shared photo routes', () => {
    const html = buildDevPhotoShell(storedPhoto)

    expect(html).toContain('window.location.replace')
    expect(html).toContain(storedPhoto.publicUrl)
  })
})
