import { clamp } from './eyeMath'

const LEFT_EYE_INDICES = {
  corners: [362, 263],
  vertical: [386, 374],
  iris: [473, 474, 475, 476, 477],
  contour: [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],
}

const RIGHT_EYE_INDICES = {
  corners: [33, 133],
  vertical: [159, 145],
  iris: [468, 469, 470, 471, 472],
  contour: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
}

function averagePoints(points) {
  const total = points.reduce(
    (accumulator, point) => ({
      x: accumulator.x + point.x,
      y: accumulator.y + point.y,
    }),
    { x: 0, y: 0 },
  )

  return {
    x: total.x / points.length,
    y: total.y / points.length,
  }
}

function pointDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function buildEye(landmarks, definition, id) {
  const contour = definition.contour.map((index) => landmarks[index]).filter(Boolean)
  const cornerA = landmarks[definition.corners[0]]
  const cornerB = landmarks[definition.corners[1]]
  const top = landmarks[definition.vertical[0]]
  const bottom = landmarks[definition.vertical[1]]

  if (!cornerA || !cornerB || !top || !bottom || contour.length < 4) {
    throw new Error('No se pudo calcular la posición de uno o ambos ojos a partir de los puntos faciales.')
  }

  const contourCenter = averagePoints(contour)
  const lidCenter = {
    x: (cornerA.x + cornerB.x) / 2,
    y: (top.y + bottom.y) / 2,
  }
  const width = pointDistance(cornerA, cornerB)
  const height = pointDistance(top, bottom)
  const rotation = Math.atan2(cornerB.y - cornerA.y, cornerB.x - cornerA.x)

  return {
    id,
    x: clamp((lidCenter.x * 0.72) + (contourCenter.x * 0.28), 0.05, 0.95),
    y: clamp((lidCenter.y * 0.8) + (contourCenter.y * 0.2), 0.05, 0.95),
    radiusX: clamp(width * 0.42, 0.034, 0.18),
    radiusY: clamp(Math.max(height * 0.95, width * 0.26), 0.03, 0.16),
    rotation,
  }
}

export function detectEyesFromLandmarks(landmarks) {
  if (!Array.isArray(landmarks) || landmarks.length < 478) {
    throw new Error('La detección facial no devolvió suficientes puntos para ubicar los ojos.')
  }

  const eyes = [
    buildEye(landmarks, RIGHT_EYE_INDICES, 'right'),
    buildEye(landmarks, LEFT_EYE_INDICES, 'left'),
  ]

  return eyes.sort((a, b) => a.x - b.x)
}
