export function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/data:(.*?);base64/)?.[1] || 'image/png'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return new Blob([bytes], { type: mime })
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('No se pudo cargar la imagen para editarla.'))
    image.src = src
  })
}

export async function prepareImageFile(file, options = {}) {
  const { maxDimension = 1600, mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality = 0.92 } = options

  let drawable = null
  let sourceWidth = 0
  let sourceHeight = 0
  let objectUrl = ''

  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    drawable = bitmap
    sourceWidth = bitmap.width
    sourceHeight = bitmap.height
  } else {
    objectUrl = URL.createObjectURL(file)
    const image = await loadImage(objectUrl)
    drawable = image
    sourceWidth = image.naturalWidth
    sourceHeight = image.naturalHeight
  }

  const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(sourceWidth * scale))
  canvas.height = Math.max(1, Math.round(sourceHeight * scale))
  const context = canvas.getContext('2d', { alpha: true })

  context.drawImage(drawable, 0, 0, canvas.width, canvas.height)

  const dataUrl = canvas.toDataURL(mimeType, quality)
  drawable?.close?.()
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
  }

  return {
    dataUrl,
    width: canvas.width,
    height: canvas.height,
    mimeType,
  }
}

export async function prepareImageDataUrl(dataUrl, options = {}) {
  const blob = dataUrlToBlob(dataUrl)
  const extension = blob.type.split('/')[1] || 'jpg'
  const file = new File([blob], `googly-upload.${extension}`, { type: blob.type })
  return prepareImageFile(file, options)
}

export function downloadDataUrl(filename, dataUrl) {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  link.click()
}
