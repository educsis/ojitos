import { ref } from 'vue'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { detectEyesFromLandmarks } from '@/utils/faceDetection'

const TASKS_VERSION = '1.1.0'
const FACE_MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task'
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VERSION}/wasm`

let faceLandmarkerPromise

async function getFaceLandmarker() {
  if (!faceLandmarkerPromise) {
    faceLandmarkerPromise = FilesetResolver.forVisionTasks(WASM_URL).then((vision) =>
      FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: FACE_MODEL_URL,
        },
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
        runningMode: 'IMAGE',
        numFaces: 1,
      }),
    )
  }

  return faceLandmarkerPromise
}

export function useFaceDetection() {
  const status = ref('idle')
  const error = ref('')

  async function detectEyesOnImage(imageLike) {
    status.value = 'loading'
    error.value = ''

    try {
      const faceLandmarker = await getFaceLandmarker()
      const result = faceLandmarker.detect(imageLike)
      const firstFace = result.faceLandmarks?.[0]

      if (!firstFace) {
        throw new Error('No se detectó ningún rostro. Intenta con una foto más clara y con ambos ojos visibles.')
      }

      const eyes = detectEyesFromLandmarks(firstFace)
      status.value = 'ready'
      return eyes
    } catch (caughtError) {
      error.value = caughtError.message || 'No se pudo detectar el rostro en esta imagen.'
      status.value = 'error'
      throw caughtError
    }
  }

  return {
    status,
    error,
    detectEyesOnImage,
  }
}
