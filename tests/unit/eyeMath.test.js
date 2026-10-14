import { describe, expect, it } from 'vitest'
import { computePupilOffset, getEyePixelData } from '@/utils/eyeMath'

describe('eye math', () => {
  it('keeps the pupil inside the eyeball boundary', () => {
    const eye = {
      x: 160,
      y: 120,
      radiusX: 48,
      radiusY: 42,
      rotation: 0,
    }

    const offset = computePupilOffset(eye, { x: 1000, y: 1000 }, 0.44)
    expect(Math.hypot(offset.x, offset.y)).toBeLessThanOrEqual(48 * 0.48)
  })

  it('converts normalized eye data into pixels with scaling', () => {
    const eye = getEyePixelData({ x: 0.5, y: 0.25, radiusX: 0.1, radiusY: 0.2, rotation: 0 }, 1000, 500, 1.2)
    expect(eye.x).toBe(500)
    expect(eye.y).toBe(125)
    expect(eye.radiusX).toBe(120)
    expect(eye.radiusY).toBe(120)
  })
})
