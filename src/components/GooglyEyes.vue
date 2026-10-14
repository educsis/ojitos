<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useEyeTracking } from '@/composables/useEyeTracking'
import { clamp, createWanderTarget, getEyePixelData, lerp } from '@/utils/eyeMath'
import { drawGooglyEyes } from '@/utils/googlyCanvas'

const props = defineProps({
  eyeData: {
    type: Array,
    default: () => [],
  },
  eyeSettings: {
    type: Object,
    required: true,
  },
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  interactive: {
    type: Boolean,
    default: true,
  },
  editable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update-eye'])

const containerRef = ref(null)
const canvasRef = ref(null)
const { pointer, isPointerActive } = useEyeTracking(containerRef)
const currentTarget = ref({ x: props.width / 2, y: props.height / 2 })
const wanderTarget = ref({ x: props.width / 2, y: props.height / 2 })
const activeDragIndex = ref(-1)

let animationFrameId = 0
let nextWanderAt = 0
let nextBlinkAt = 0
let blinkStartedAt = 0

const eyeHandles = computed(() =>
  props.eyeData.map((eye, index) => ({
    index,
    style: handleStyle(eye),
  })),
)

function handleStyle(eye) {
  const pixelEye = getEyePixelData(eye, props.width, props.height, props.eyeSettings.eyeScale)
  return {
    left: `${(pixelEye.x / props.width) * 100}%`,
    top: `${(pixelEye.y / props.height) * 100}%`,
    width: `${(pixelEye.radiusX * 2.1 / props.width) * 100}%`,
    height: `${(pixelEye.radiusY * 2.1 / props.height) * 100}%`,
    transform: `translate(-50%, -50%) rotate(${pixelEye.rotation}rad)`,
  }
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) {
    return
  }

  const ratio = window.devicePixelRatio || 1
  canvas.width = Math.round(props.width * ratio)
  canvas.height = Math.round(props.height * ratio)
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  const context = canvas.getContext('2d')
  context.setTransform(ratio, 0, 0, ratio, 0, 0)
}

function getDesiredTarget(timestamp) {
  if (props.interactive && isPointerActive.value) {
    return {
      x: clamp(pointer.value.x, 0, 1) * props.width,
      y: clamp(pointer.value.y, 0, 1) * props.height,
    }
  }

  if (!nextWanderAt || timestamp >= nextWanderAt) {
    wanderTarget.value = createWanderTarget(props.width, props.height)
    nextWanderAt = timestamp + 1600 + Math.random() * 2400
  }

  return wanderTarget.value
}

function getBlinkAmount(timestamp) {
  if (!props.eyeSettings.blink) {
    return 0
  }

  if (!nextBlinkAt || timestamp >= nextBlinkAt) {
    blinkStartedAt = timestamp
    nextBlinkAt = timestamp + 4200 + Math.random() * 3200
  }

  const elapsed = timestamp - blinkStartedAt
  if (elapsed < 0 || elapsed > 240) {
    return 0
  }

  const half = elapsed <= 120 ? elapsed / 120 : 1 - (elapsed - 120) / 120
  return Math.max(0, half)
}

function render(timestamp = 0) {
  const canvas = canvasRef.value
  if (!canvas) {
    return
  }

  const context = canvas.getContext('2d')
  const desiredTarget = getDesiredTarget(timestamp)
  currentTarget.value = {
    x: lerp(currentTarget.value.x, desiredTarget.x, props.eyeSettings.animationSpeed),
    y: lerp(currentTarget.value.y, desiredTarget.y, props.eyeSettings.animationSpeed),
  }

  drawGooglyEyes(context, {
    width: props.width,
    height: props.height,
    eyeData: props.eyeData,
    eyeSettings: props.eyeSettings,
    gazeTarget: currentTarget.value,
    timeSeconds: timestamp / 1000,
    blinkAmount: getBlinkAmount(timestamp),
  })

  animationFrameId = requestAnimationFrame(render)
}

function updateEyeFromPointer(index, event) {
  const bounds = containerRef.value?.getBoundingClientRect?.()
  if (!bounds) {
    return
  }

  const x = clamp((event.clientX - bounds.left) / bounds.width, 0.04, 0.96)
  const y = clamp((event.clientY - bounds.top) / bounds.height, 0.04, 0.96)
  emit('update-eye', { index, patch: { x, y } })
}

function handleDragMove(event) {
  if (activeDragIndex.value < 0) {
    return
  }
  updateEyeFromPointer(activeDragIndex.value, event)
}

function stopDragging() {
  activeDragIndex.value = -1
  window.removeEventListener('pointermove', handleDragMove)
  window.removeEventListener('pointerup', stopDragging)
}

function beginDragging(index, event) {
  activeDragIndex.value = index
  updateEyeFromPointer(index, event)
  window.addEventListener('pointermove', handleDragMove)
  window.addEventListener('pointerup', stopDragging)
}

watch(
  () => [props.width, props.height],
  () => {
    resizeCanvas()
  },
)

watch(
  () => props.eyeData,
  () => {
    resizeCanvas()
  },
  { deep: true },
)

onMounted(() => {
  resizeCanvas()
  animationFrameId = requestAnimationFrame(render)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId)
  stopDragging()
})
</script>

<template>
  <div ref="containerRef" class="googly-layer">
    <canvas ref="canvasRef" class="googly-layer__canvas"></canvas>

    <div v-if="editable" class="googly-layer__handles">
      <button
        v-for="handle in eyeHandles"
        :key="handle.index"
        class="eye-handle"
        :style="handle.style"
        type="button"
        @pointerdown.prevent="beginDragging(handle.index, $event)"
      >
        <span>Drag</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.googly-layer {
  position: absolute;
  inset: 0;
}

.googly-layer__canvas,
.googly-layer__handles {
  position: absolute;
  inset: 0;
}

.googly-layer__canvas {
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.googly-layer__handles {
  pointer-events: none;
}

.eye-handle {
  position: absolute;
  pointer-events: auto;
  border: 2px dashed rgba(255, 255, 255, 0.92);
  background: rgba(123, 77, 255, 0.16);
  backdrop-filter: blur(8px);
  color: transparent;
  min-width: 0;
  padding: 0;
}

.eye-handle span {
  position: absolute;
  inset: auto auto -1.6rem 50%;
  transform: translateX(-50%);
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 700;
  text-shadow: 0 2px 6px rgba(30, 23, 69, 0.55);
}
</style>
