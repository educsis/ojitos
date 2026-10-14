// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { validatePhotoPayload } from '../../server/utils/validation.js'

const VALID_DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/'

describe('photo payload validation', () => {
  it('accepts a valid photo payload', () => {
    const payload = validatePhotoPayload({
      imageDataUrl: VALID_DATA_URL,
      previewDataUrl: VALID_DATA_URL,
      eyeData: [
        { id: 'left', x: 0.4, y: 0.4, radiusX: 0.08, radiusY: 0.07, rotation: 0 },
        { id: 'right', x: 0.6, y: 0.4, radiusX: 0.08, radiusY: 0.07, rotation: 0 },
      ],
      eyeSettings: {
        eyeScale: 1,
        pupilScale: 0.4,
        animationSpeed: 0.12,
        wobble: 0.2,
        blink: true,
      },
      backgroundPreset: 'candy-pink',
      imageWidth: 1200,
      imageHeight: 900,
      isPublic: true,
    })

    expect(payload.imageWidth).toBe(1200)
    expect(payload.eyeData).toHaveLength(2)
    expect(payload.backgroundPreset).toBe('candy-pink')
  })

  it('rejects unsupported image mime types', () => {
    expect(() =>
      validatePhotoPayload({
        imageDataUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEA',
        eyeData: [
          { id: 'left', x: 0.4, y: 0.4, radiusX: 0.08, radiusY: 0.07, rotation: 0 },
          { id: 'right', x: 0.6, y: 0.4, radiusX: 0.08, radiusY: 0.07, rotation: 0 },
        ],
        eyeSettings: {
          eyeScale: 1,
          pupilScale: 0.4,
          animationSpeed: 0.12,
          wobble: 0.2,
          blink: true,
        },
        backgroundPreset: 'candy-pink',
        imageWidth: 1200,
        imageHeight: 900,
        isPublic: true,
      }),
    ).toThrow(/JPG, PNG, or WebP/)
  })
})
