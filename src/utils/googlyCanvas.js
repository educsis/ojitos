import { computePupilOffset, denormalizeEyes } from './eyeMath'

function drawSingleEye(ctx, eye, targetPoint, settings, timeSeconds, blinkAmount = 0) {
  const wobbleScale = 1 + Math.sin(timeSeconds * 3.1 + eye.x * 0.02) * settings.wobble * 0.02
  const whiteRadiusX = eye.radiusX * wobbleScale
  const whiteRadiusY = eye.radiusY * (1 - blinkAmount * 0.9)
  const pupilRadius = Math.min(whiteRadiusX, whiteRadiusY) * settings.pupilScale
  const pupilOffset = computePupilOffset({ ...eye, radiusX: whiteRadiusX, radiusY: whiteRadiusY }, targetPoint, settings.pupilScale)

  ctx.save()
  ctx.translate(eye.x, eye.y)
  ctx.rotate(eye.rotation)

  ctx.shadowColor = 'rgba(19, 24, 48, 0.1)'
  ctx.shadowBlur = Math.max(4, whiteRadiusX * 0.08)
  ctx.shadowOffsetY = Math.max(2, whiteRadiusY * 0.08)
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.ellipse(0, 0, whiteRadiusX, whiteRadiusY, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.shadowColor = 'transparent'
  ctx.lineWidth = Math.max(1.5, Math.min(whiteRadiusX, whiteRadiusY) * 0.06)
  ctx.strokeStyle = 'rgba(33, 38, 67, 0.18)'
  ctx.stroke()

  const gloss = ctx.createRadialGradient(-whiteRadiusX * 0.24, -whiteRadiusY * 0.3, 1, -whiteRadiusX * 0.24, -whiteRadiusY * 0.3, whiteRadiusX * 0.88)
  gloss.addColorStop(0, 'rgba(255,255,255,0.84)')
  gloss.addColorStop(0.5, 'rgba(255,255,255,0.18)')
  gloss.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gloss
  ctx.beginPath()
  ctx.ellipse(-whiteRadiusX * 0.12, -whiteRadiusY * 0.12, whiteRadiusX * 0.72, whiteRadiusY * 0.66, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#171a26'
  ctx.beginPath()
  ctx.arc(pupilOffset.x, pupilOffset.y, pupilRadius, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.beginPath()
  ctx.arc(pupilOffset.x - pupilRadius * 0.26, pupilOffset.y - pupilRadius * 0.28, Math.max(1.5, pupilRadius * 0.2), 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

export function drawGooglyEyes(ctx, { width, height, eyeData, eyeSettings, gazeTarget, timeSeconds = 0, blinkAmount = 0, clear = true }) {
  if (clear) {
    ctx.clearRect(0, 0, width, height)
  }

  const eyes = denormalizeEyes(eyeData, width, height, eyeSettings.eyeScale)
  eyes.forEach((eye) => drawSingleEye(ctx, eye, gazeTarget, eyeSettings, timeSeconds, blinkAmount))
}

export async function createStaticPreviewDataUrl({ baseImageUrl, eyeData, eyeSettings, width, height, mimeType = 'image/jpeg', quality = 0.94 }) {
  const image = await new Promise((resolve, reject) => {
    const element = new Image()
    element.onload = () => resolve(element)
    element.onerror = () => reject(new Error('No se pudo crear una imagen de vista previa a partir de la foto editada.'))
    element.src = baseImageUrl
  })

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d', { alpha: false })
  context.drawImage(image, 0, 0, width, height)
  drawGooglyEyes(context, {
    width,
    height,
    eyeData,
    eyeSettings,
    gazeTarget: {
      x: width * 0.58,
      y: height * 0.48,
    },
    timeSeconds: 0,
    clear: false,
  })

  return canvas.toDataURL(mimeType, quality)
}
