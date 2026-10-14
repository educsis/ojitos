import { describe, expect, it } from 'vitest'
import { detectEyesFromLandmarks } from '@/utils/faceDetection'

function makeLandmarks() {
  return Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0 }))
}

describe('face landmark eye detection', () => {
  it('derives two normalized eye ellipses from mediapipe landmarks', () => {
    const landmarks = makeLandmarks()

    landmarks[33] = { x: 0.3, y: 0.42 }
    landmarks[133] = { x: 0.4, y: 0.42 }
    landmarks[159] = { x: 0.35, y: 0.39 }
    landmarks[145] = { x: 0.35, y: 0.45 }
    ;[468, 469, 470, 471, 472].forEach((index) => {
      landmarks[index] = { x: 0.35, y: 0.42 }
    })

    landmarks[362] = { x: 0.6, y: 0.42 }
    landmarks[263] = { x: 0.7, y: 0.42 }
    landmarks[386] = { x: 0.65, y: 0.39 }
    landmarks[374] = { x: 0.65, y: 0.45 }
    ;[473, 474, 475, 476, 477].forEach((index) => {
      landmarks[index] = { x: 0.65, y: 0.42 }
    })

    const eyes = detectEyesFromLandmarks(landmarks)

    expect(eyes).toHaveLength(2)
    expect(eyes[0].x).toBeLessThan(eyes[1].x)
    expect(eyes[0].radiusX).toBeGreaterThan(0.03)
    expect(eyes[1].radiusY).toBeGreaterThan(0.02)
    expect(Math.abs(eyes[0].rotation)).toBeLessThan(0.1)
  })
})
