import { ref } from 'vue'
import { FilesetResolver, ImageSegmenter } from '@mediapipe/tasks-vision'
import { drawGradientBackground } from '@/utils/backgrounds'

const TASKS_VERSION = '1.1.0'
const SEGMENTER_MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter_landscape/float16/latest/selfie_segmenter_landscape.tflite'
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VERSION}/wasm`

let segmenterPromise

async function getSegmenter() {
  if (!segmenterPromise) {
    segmenterPromise = FilesetResolver.forVisionTasks(WASM_URL).then((vision) =>
      ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: SEGMENTER_MODEL_URL,
        },
        runningMode: 'IMAGE',
        outputConfidenceMasks: true,
        outputCategoryMask: true,
      }),
    )
  }

  return segmenterPromise
}

function createSourceCanvas(sourceImage) {
  const canvas = document.createElement('canvas')
  canvas.width = sourceImage.naturalWidth || sourceImage.width
  canvas.height = sourceImage.naturalHeight || sourceImage.height
  const context = canvas.getContext('2d', { alpha: true })
  context.drawImage(sourceImage, 0, 0, canvas.width, canvas.height)
  return canvas
}

function smoothstep(edge0, edge1, value) {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function buildMaskCanvas(maskValues, width, height, mode = 'confidence') {
  const rawCanvas = document.createElement('canvas')
  rawCanvas.width = width
  rawCanvas.height = height
  const rawContext = rawCanvas.getContext('2d', { alpha: true })
  const imageData = rawContext.createImageData(width, height)

  for (let index = 0; index < maskValues.length; index += 1) {
    const value = maskValues[index]
    const alpha = mode === 'confidence'
      ? Math.round(smoothstep(0.35, 0.75, value) * 255)
      : (value === 1 ? 255 : 0)
    const offset = index * 4
    imageData.data[offset] = 255
    imageData.data[offset + 1] = 255
    imageData.data[offset + 2] = 255
    imageData.data[offset + 3] = alpha
  }

  rawContext.putImageData(imageData, 0, 0)

  const featherCanvas = document.createElement('canvas')
  featherCanvas.width = width
  featherCanvas.height = height
  const featherContext = featherCanvas.getContext('2d', { alpha: true })
  featherContext.filter = 'blur(4px)'
  featherContext.drawImage(rawCanvas, 0, 0)
  featherContext.filter = 'none'
  return featherCanvas
}

export function composeForeground({ sourceImage, maskCanvas, presetId, keepOriginalBackground = false, mimeType = 'image/jpeg', quality = 0.94 }) {
  const width = sourceImage.naturalWidth || sourceImage.width
  const height = sourceImage.naturalHeight || sourceImage.height
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d', { alpha: false })

  if (keepOriginalBackground) {
    context.drawImage(sourceImage, 0, 0, width, height)
  } else {
    drawGradientBackground(context, width, height, presetId)

    const foregroundCanvas = createSourceCanvas(sourceImage)
    const foregroundContext = foregroundCanvas.getContext('2d', { alpha: true })
    foregroundContext.globalCompositeOperation = 'destination-in'
    foregroundContext.drawImage(maskCanvas, 0, 0, width, height)
    foregroundContext.globalCompositeOperation = 'source-over'

    context.drawImage(foregroundCanvas, 0, 0, width, height)
  }

  return {
    width,
    height,
    dataUrl: canvas.toDataURL(mimeType, quality),
  }
}

export function useBackgroundRemoval() {
  const status = ref('idle')
  const error = ref('')

  async function extractPersonMask(sourceImage) {
    status.value = 'loading'
    error.value = ''

    try {
      const segmenter = await getSegmenter()
      const result = segmenter.segment(sourceImage)
      const width = sourceImage.naturalWidth || sourceImage.width
      const height = sourceImage.naturalHeight || sourceImage.height

      let maskCanvas = null

      if (result.confidenceMasks?.length) {
        const personMask = result.confidenceMasks[result.confidenceMasks.length - 1]
        maskCanvas = buildMaskCanvas(personMask.getAsFloat32Array(), width, height, 'confidence')
      } else if (result.categoryMask) {
        maskCanvas = buildMaskCanvas(result.categoryMask.getAsUint8Array(), width, height, 'category')
      }

      if (!maskCanvas) {
        throw new Error('La eliminación de fondo no pudo crear una máscara de persona para esta imagen.')
      }
      status.value = 'ready'
      return { maskCanvas, width, height }
    } catch (caughtError) {
      error.value = caughtError.message || 'La eliminación de fondo falló para esta imagen.'
      status.value = 'error'
      throw caughtError
    }
  }

  return {
    status,
    error,
    extractPersonMask,
  }
}
