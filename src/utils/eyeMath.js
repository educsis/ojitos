export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function lerp(start, end, amount) {
  return start + (end - start) * amount
}

export function normalizeEyes(eyes, width, height) {
  return eyes.map((eye) => ({
    ...eye,
    x: eye.x / width,
    y: eye.y / height,
    radiusX: eye.radiusX / width,
    radiusY: eye.radiusY / height,
  }))
}

export function denormalizeEyes(eyes, width, height, scale = 1) {
  return eyes.map((eye) => ({
    ...eye,
    x: eye.x * width,
    y: eye.y * height,
    radiusX: eye.radiusX * width * scale,
    radiusY: eye.radiusY * height * scale,
  }))
}

export function getEyePixelData(eye, width, height, eyeScale = 1) {
  return {
    ...eye,
    x: eye.x * width,
    y: eye.y * height,
    radiusX: eye.radiusX * width * eyeScale,
    radiusY: eye.radiusY * height * eyeScale,
  }
}

export function computePupilOffset(eye, targetPoint, pupilScale = 0.4) {
  if (!targetPoint) {
    return { x: 0, y: 0 }
  }

  const dx = targetPoint.x - eye.x
  const dy = targetPoint.y - eye.y
  const sin = Math.sin(-eye.rotation)
  const cos = Math.cos(-eye.rotation)
  const localX = dx * cos - dy * sin
  const localY = dx * sin + dy * cos
  const maxDistance = Math.min(eye.radiusX, eye.radiusY) * clamp(0.34 + pupilScale * 0.18, 0.22, 0.48)
  const distance = Math.hypot(localX, localY) || 1
  const limited = Math.min(distance, maxDistance)
  const limitedX = (localX / distance) * limited
  const limitedY = (localY / distance) * limited

  const forwardSin = Math.sin(eye.rotation)
  const forwardCos = Math.cos(eye.rotation)

  return {
    x: limitedX * forwardCos - limitedY * forwardSin,
    y: limitedX * forwardSin + limitedY * forwardCos,
  }
}

export function getEyeBounds(eye) {
  return {
    left: eye.x - eye.radiusX,
    right: eye.x + eye.radiusX,
    top: eye.y - eye.radiusY,
    bottom: eye.y + eye.radiusY,
  }
}

export function createWanderTarget(width, height) {
  return {
    x: width * (0.3 + Math.random() * 0.4),
    y: height * (0.3 + Math.random() * 0.28),
  }
}

export function getDefaultEyeSettings() {
  return {
    eyeScale: 0.98,
    pupilScale: 0.34,
    animationSpeed: 0.12,
    wobble: 0.04,
    blink: false,
  }
}
