const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ALLOWED_BACKGROUNDS = new Set([
  'candy-pink',
  'electric-blue',
  'tropical-sunset',
  'neon-party',
  'mint-dream',
  'rainbow-blur',
  'original',
])

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function bytesFromBase64(base64) {
  return Math.ceil((base64.length * 3) / 4)
}

function validateDataUrl(value, fieldName) {
  assert(typeof value === 'string' && value.startsWith('data:'), `${fieldName} must be a base64 data URL.`)
  const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
  assert(match, `${fieldName} must be a JPG, PNG, or WebP data URL.`)
  assert(ALLOWED_MIME_TYPES.has(match[1]), `${fieldName} must be a JPG, PNG, or WebP image.`)
  assert(bytesFromBase64(match[2]) <= 12 * 1024 * 1024, `${fieldName} is too large. Please keep uploads under 12 MB.`)
  return value
}

function validateEyeData(eyeData) {
  assert(Array.isArray(eyeData) && eyeData.length >= 2, 'eyeData must contain both eyes.')

  return eyeData.map((eye, index) => {
    assert(typeof eye === 'object' && eye !== null, `eyeData[${index}] must be an object.`)
    const numericKeys = ['x', 'y', 'radiusX', 'radiusY', 'rotation']
    numericKeys.forEach((key) => {
      assert(Number.isFinite(eye[key]), `eyeData[${index}].${key} must be numeric.`)
    })

    return {
      id: eye.id || `eye-${index}`,
      x: Math.min(1, Math.max(0, eye.x)),
      y: Math.min(1, Math.max(0, eye.y)),
      radiusX: Math.min(1, Math.max(0.005, eye.radiusX)),
      radiusY: Math.min(1, Math.max(0.005, eye.radiusY)),
      rotation: eye.rotation,
    }
  })
}

function validateEyeSettings(settings) {
  assert(typeof settings === 'object' && settings !== null, 'eyeSettings must be an object.')

  const eyeScale = Number(settings.eyeScale)
  const pupilScale = Number(settings.pupilScale)
  const animationSpeed = Number(settings.animationSpeed)
  const wobble = Number(settings.wobble)
  const blink = Boolean(settings.blink)

  assert(eyeScale >= 0.5 && eyeScale <= 1.8, 'eyeSettings.eyeScale is out of range.')
  assert(pupilScale >= 0.15 && pupilScale <= 0.8, 'eyeSettings.pupilScale is out of range.')
  assert(animationSpeed >= 0.01 && animationSpeed <= 0.5, 'eyeSettings.animationSpeed is out of range.')
  assert(wobble >= 0 && wobble <= 1, 'eyeSettings.wobble is out of range.')

  return {
    eyeScale,
    pupilScale,
    animationSpeed,
    wobble,
    blink,
  }
}

export function validatePublicId(publicId) {
  assert(typeof publicId === 'string' && /^[A-Za-z0-9_-]{6,32}$/.test(publicId), 'Invalid public photo ID.')
  return publicId
}

export function validateDeletionToken(token) {
  assert(typeof token === 'string' && token.length >= 16, 'A valid deletion token is required.')
  return token
}

export function validatePhotoPayload(payload) {
  assert(typeof payload === 'object' && payload !== null, 'Request body must be a JSON object.')

  const imageDataUrl = validateDataUrl(payload.imageDataUrl, 'imageDataUrl')
  const previewDataUrl = payload.previewDataUrl ? validateDataUrl(payload.previewDataUrl, 'previewDataUrl') : null
  const eyeData = validateEyeData(payload.eyeData)
  const eyeSettings = validateEyeSettings(payload.eyeSettings)
  const imageWidth = Number(payload.imageWidth)
  const imageHeight = Number(payload.imageHeight)
  const backgroundPreset = String(payload.backgroundPreset || 'candy-pink')
  const isPublic = Boolean(payload.isPublic)

  assert(Number.isInteger(imageWidth) && imageWidth > 0 && imageWidth <= 5000, 'imageWidth is invalid.')
  assert(Number.isInteger(imageHeight) && imageHeight > 0 && imageHeight <= 5000, 'imageHeight is invalid.')
  assert(ALLOWED_BACKGROUNDS.has(backgroundPreset), 'backgroundPreset is invalid.')

  return {
    imageDataUrl,
    previewDataUrl,
    eyeData,
    eyeSettings,
    imageWidth,
    imageHeight,
    backgroundPreset,
    isPublic,
  }
}
