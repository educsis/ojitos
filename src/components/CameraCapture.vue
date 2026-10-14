<script setup>
import { ref } from 'vue'
import { useCamera } from '@/composables/useCamera'

const emit = defineEmits(['captured'])
const videoRef = ref(null)
const camera = useCamera()

async function openCamera() {
  await camera.startCamera(videoRef.value)
}

async function flipCamera() {
  await camera.toggleFacingMode(videoRef.value)
}

async function capture() {
  const frame = await camera.captureFrame(videoRef.value)
  emit('captured', frame)
}
</script>

<template>
  <article class="glass-card camera-card">
    <header>
      <h3>Tómate una selfie</h3>
      <p class="caption">Abre la cámara solo cuando estés listo para capturar tu foto. Si la vista previa no se abre, usa HTTPS o localhost y permite el acceso a la cámara.</p>
    </header>

    <div v-if="camera.error" class="status-banner status-banner--error">{{ camera.error }}</div>

    <div class="camera-preview">
      <video ref="videoRef" :class="{ 'video--mirrored': camera.facingMode === 'user' }" playsinline muted autoplay></video>
      <div v-if="!camera.isActive" class="camera-placeholder">
        <span>📸</span>
        <p>Toca abajo para abrir la vista previa de tu cámara.</p>
      </div>
    </div>

    <div class="button-row">
      <button v-if="!camera.isActive" class="primary" type="button" @click="openCamera">Abrir cámara</button>
      <template v-else>
        <button type="button" @click="flipCamera">Cambiar cámara</button>
        <button class="primary" type="button" @click="capture">Capturar</button>
        <button type="button" class="secondary" @click="camera.stopCamera">Detener</button>
      </template>
    </div>
  </article>
</template>

<style scoped>
.camera-card {
  padding: 1.25rem;
}

.camera-preview {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  min-height: 280px;
  background: linear-gradient(135deg, rgba(255, 95, 175, 0.22), rgba(73, 212, 255, 0.2));
}

video,
.camera-placeholder {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  display: block;
}

.video--mirrored {
  transform: scaleX(-1);
}

.camera-placeholder {
  display: grid;
  place-items: center;
  gap: 0.5rem;
  padding: 1rem;
  color: #5e5f82;
}

.camera-placeholder span {
  font-size: 2rem;
}
</style>
