import { computed, onBeforeUnmount, ref } from 'vue'

export function useCamera() {
  const stream = ref(null)
  const facingMode = ref('user')
  const status = ref('idle')
  const error = ref('')

  const isActive = computed(() => Boolean(stream.value))

  async function startCamera(videoElement) {
    if (!videoElement) {
      throw new Error('No se proporcionó un elemento de video para la vista previa de la cámara.')
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      const secureHint = window.isSecureContext
        ? 'Este navegador no expone acceso a la cámara para esta página.'
        : 'El acceso a la cámara requiere HTTPS o localhost en la mayoría de los navegadores.'
      throw new Error(secureHint)
    }

    status.value = 'loading'
    error.value = ''
    stopCamera()

    const attempts = [
      {
        audio: false,
        video: {
          facingMode: { ideal: facingMode.value },
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
      },
      {
        audio: false,
        video: true,
      },
    ]

    try {
      let mediaStream = null
      let lastError = null

      for (const constraints of attempts) {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
          break
        } catch (caughtError) {
          lastError = caughtError
        }
      }

      if (!mediaStream) {
        throw lastError || new Error('No se pudo abrir la cámara en este dispositivo.')
      }

      stream.value = mediaStream
      videoElement.autoplay = true
      videoElement.muted = true
      videoElement.playsInline = true
      videoElement.srcObject = mediaStream

      await new Promise((resolve) => {
        if (videoElement.readyState >= 1) {
          resolve()
          return
        }

        videoElement.onloadedmetadata = () => resolve()
      })

      await videoElement.play()
      status.value = 'ready'
    } catch (caughtError) {
      status.value = 'error'
      error.value = caughtError.message || 'No se pudo abrir la cámara en este dispositivo.'
      throw caughtError
    }
  }

  function stopCamera() {
    if (stream.value) {
      stream.value.getTracks().forEach((track) => track.stop())
      stream.value = null
    }
    status.value = 'idle'
  }

  async function toggleFacingMode(videoElement) {
    facingMode.value = facingMode.value === 'user' ? 'environment' : 'user'
    if (videoElement) {
      await startCamera(videoElement)
    }
  }

  async function captureFrame(videoElement) {
    if (!videoElement?.videoWidth || !videoElement?.videoHeight) {
      throw new Error('La vista previa de la cámara aún no está lista para capturar una imagen.')
    }

    const canvas = document.createElement('canvas')
    canvas.width = videoElement.videoWidth
    canvas.height = videoElement.videoHeight
    const context = canvas.getContext('2d', { alpha: false })

    if (facingMode.value === 'user') {
      context.translate(canvas.width, 0)
      context.scale(-1, 1)
    }

    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.94)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.94))

    return {
      dataUrl,
      blob,
      width: canvas.width,
      height: canvas.height,
    }
  }

  onBeforeUnmount(stopCamera)

  return {
    error,
    facingMode,
    isActive,
    status,
    startCamera,
    stopCamera,
    toggleFacingMode,
    captureFrame,
  }
}
