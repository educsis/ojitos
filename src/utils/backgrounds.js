export const BACKGROUND_PRESETS = [
  {
    id: 'candy-pink',
    name: 'Candy Pink',
    colors: ['#ff7eb6', '#ffb8a2', '#c9a7ff'],
    accent: '#fff1f7',
  },
  {
    id: 'electric-blue',
    name: 'Electric Blue',
    colors: ['#3ee7ff', '#3d7eff', '#8a6dff'],
    accent: '#eaf8ff',
  },
  {
    id: 'tropical-sunset',
    name: 'Tropical Sunset',
    colors: ['#ff8f3f', '#ffe36e', '#ff5fa2'],
    accent: '#fff7df',
  },
  {
    id: 'neon-party',
    name: 'Neon Party',
    colors: ['#7b2cff', '#ff4fd8', '#23e5d8'],
    accent: '#f6ebff',
  },
  {
    id: 'mint-dream',
    name: 'Mint Dream',
    colors: ['#8ff6d1', '#4ac7c7', '#76b8ff'],
    accent: '#effffd',
  },
  {
    id: 'rainbow-blur',
    name: 'Rainbow Blur',
    colors: ['#ff5f7a', '#ffca61', '#59f0ff', '#8d72ff'],
    accent: '#ffffff',
  },
]

export const DEFAULT_BACKGROUND_PRESET = BACKGROUND_PRESETS[0].id

export function getBackgroundPreset(id) {
  return BACKGROUND_PRESETS.find((preset) => preset.id === id) || BACKGROUND_PRESETS[0]
}

export function getRandomBackgroundPreset(excludeId = null) {
  const pool = BACKGROUND_PRESETS.filter((preset) => preset.id !== excludeId)
  return pool[Math.floor(Math.random() * pool.length)] || BACKGROUND_PRESETS[0]
}

export function buildBackgroundStyle(id) {
  const preset = getBackgroundPreset(id)
  const colors = preset.colors.join(', ')

  return {
    background: `linear-gradient(135deg, ${colors})`,
    boxShadow: '0 32px 80px rgba(23, 26, 55, 0.18)',
  }
}

export function drawGradientBackground(ctx, width, height, presetId, options = {}) {
  const preset = getBackgroundPreset(presetId)
  const { softened = true } = options

  ctx.save()
  ctx.clearRect(0, 0, width, height)

  const baseGradient = ctx.createLinearGradient(0, 0, width, height)
  const stopStep = 1 / Math.max(1, preset.colors.length - 1)

  preset.colors.forEach((color, index) => {
    baseGradient.addColorStop(index * stopStep, color)
  })

  ctx.fillStyle = baseGradient
  ctx.fillRect(0, 0, width, height)

  const blobPositions = [
    { x: width * 0.18, y: height * 0.22, radius: Math.max(width, height) * 0.34, color: preset.colors[0] },
    { x: width * 0.78, y: height * 0.18, radius: Math.max(width, height) * 0.28, color: preset.colors[1] || preset.colors[0] },
    { x: width * 0.68, y: height * 0.78, radius: Math.max(width, height) * 0.3, color: preset.colors[2] || preset.colors[0] },
    { x: width * 0.22, y: height * 0.84, radius: Math.max(width, height) * 0.26, color: preset.colors[3] || preset.colors[1] || preset.colors[0] },
  ]

  if (softened) {
    ctx.filter = 'blur(48px) saturate(115%)'
  }

  blobPositions.forEach((blob, index) => {
    const radial = ctx.createRadialGradient(blob.x, blob.y, blob.radius * 0.05, blob.x, blob.y, blob.radius)
    radial.addColorStop(0, `${blob.color}dd`)
    radial.addColorStop(0.6, `${blob.color}88`)
    radial.addColorStop(1, `${blob.color}00`)
    ctx.fillStyle = radial
    ctx.beginPath()
    ctx.arc(blob.x + index * 2, blob.y - index * 3, blob.radius, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.filter = 'none'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.14)'
  ctx.fillRect(0, 0, width, height)
  ctx.restore()
}
