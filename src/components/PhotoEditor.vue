<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BackgroundSelector from '@/components/BackgroundSelector.vue'
import FaceDetector from '@/components/FaceDetector.vue'
import InteractivePhoto from '@/components/InteractivePhoto.vue'
import LoadingAnimation from '@/components/LoadingAnimation.vue'
import { useBackgroundRemoval, composeForeground } from '@/composables/useBackgroundRemoval'
import { useFaceDetection } from '@/composables/useFaceDetection'
import { useEditorStore } from '@/stores/editor'
import { createPhoto } from '@/services/api'
import { createStaticPreviewDataUrl } from '@/utils/googlyCanvas'
import { loadImage } from '@/utils/image'

const router = useRouter()
const editorStore = useEditorStore()
const faceDetection = useFaceDetection()
const backgroundRemoval = useBackgroundRemoval()

const sourceImage = ref(null)
const personMaskCanvas = ref(null)
const pageError = ref('')
const saveError = ref('')
const isSaving = ref(false)
const isPreparing = ref(true)

const loadingMessage = computed(() => {
  if (faceDetection.status.value === 'loading') {
    return 'Buscando tus ojos... 👀'
  }

  if (backgroundRemoval.status.value === 'loading') {
    return 'Haciendo tu fondo fabuloso...'
  }

  if (isSaving.value) {
    return '¡Tu obra maestra con ojos saltones ya casi está lista!'
  }

  return 'Añadiendo la máxima dosis de diversión...'
})

const canPreview = computed(() => editorStore.hasProcessed && editorStore.eyeData.length >= 2)

async function detectEyes() {
  const eyes = await faceDetection.detectEyesOnImage(sourceImage.value)
  editorStore.setDetectedEyes(eyes)
  editorStore.setEyeData(eyes)
}

async function ensureMask() {
  if (editorStore.keepOriginalBackground) {
    return
  }

  if (!personMaskCanvas.value) {
    const { maskCanvas } = await backgroundRemoval.extractPersonMask(sourceImage.value)
    personMaskCanvas.value = maskCanvas
  }
}

async function regenerateComposite() {
  if (!sourceImage.value) {
    return
  }

  await ensureMask()
  const result = composeForeground({
    sourceImage: sourceImage.value,
    maskCanvas: personMaskCanvas.value,
    presetId: editorStore.backgroundPreset,
    keepOriginalBackground: editorStore.keepOriginalBackground,
    mimeType: editorStore.mimeType,
  })
  editorStore.setProcessedImage(result)
}

async function safelyRegenerateComposite() {
  try {
    await regenerateComposite()
    pageError.value = ''
  } catch (caughtError) {
    pageError.value = caughtError.message || 'No se pudo actualizar la vista previa editada.'
  }
}

async function initializeEditor() {
  if (!editorStore.hasSource) {
    router.replace('/create')
    return
  }

  isPreparing.value = true
  pageError.value = ''

  try {
    sourceImage.value = await loadImage(editorStore.preparedImageDataUrl)

    if (!editorStore.detectedEyeData.length) {
      await detectEyes()
    }

    await safelyRegenerateComposite()
  } catch (caughtError) {
    pageError.value = caughtError.message || 'No se pudo preparar esta foto para editarla.'
  } finally {
    isPreparing.value = false
  }
}

function updateSetting(key, event) {
  editorStore.updateEyeSetting(key, Number(event.target.value))
}

async function chooseBackground(presetId) {
  editorStore.setKeepOriginalBackground(false)
  editorStore.setBackgroundPreset(presetId)
  await safelyRegenerateComposite()
}

async function toggleOriginalBackground(checked) {
  editorStore.setKeepOriginalBackground(checked)
  await safelyRegenerateComposite()
}

async function randomBackground() {
  editorStore.randomizeBackground()
  await safelyRegenerateComposite()
}

async function randomize() {
  editorStore.randomizeBackground()
  editorStore.updateEyeSetting('eyeScale', Number((0.92 + Math.random() * 0.34).toFixed(2)))
  editorStore.updateEyeSetting('pupilScale', Number((0.36 + Math.random() * 0.14).toFixed(2)))
  editorStore.updateEyeSetting('animationSpeed', Number((0.08 + Math.random() * 0.12).toFixed(2)))
  await safelyRegenerateComposite()
}

async function retrySegmentation() {
  personMaskCanvas.value = null
  await safelyRegenerateComposite()
}

function resetEditor() {
  editorStore.resetEditor()
  personMaskCanvas.value = null
  initializeEditor()
}

async function saveAndShare() {
  saveError.value = ''
  isSaving.value = true

  try {
    const previewDataUrl = await createStaticPreviewDataUrl({
      baseImageUrl: editorStore.processedImageDataUrl,
      eyeData: editorStore.eyeData,
      eyeSettings: editorStore.eyeSettings,
      width: editorStore.imageWidth,
      height: editorStore.imageHeight,
    })

    const response = await createPhoto(editorStore.toApiPayload(previewDataUrl))
    editorStore.setLastSavedPhoto(response)
    await router.push(`/g/${response.publicId}?created=1`)
  } catch (caughtError) {
    saveError.value = caughtError.message || 'No se pudieron guardar tus Ojitos en este momento.'
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  initializeEditor()
})
</script>

<template>
  <section class="container panel-stack">
    <div class="badge">Editor de foto</div>
    <h1>Hazlo aún más saltón</h1>
    <p class="lead">Detectamos ambos ojos, mantenemos la foto original por defecto y te permitimos reemplazar opcionalmente el fondo mientras conservamos los ojos interactivos después de compartir.</p>

    <div v-if="pageError" class="status-banner status-banner--error">{{ pageError }}</div>
    <div v-if="saveError" class="status-banner status-banner--error">{{ saveError }}</div>
    <div v-if="backgroundRemoval.error.value && !editorStore.keepOriginalBackground" class="status-banner status-banner--info">
      {{ backgroundRemoval.error.value }} Puedes reintentar o mantener el fondo original.
    </div>

    <LoadingAnimation v-if="isPreparing || isSaving" :message="loadingMessage" />

    <div v-else class="two-column-grid">
      <section class="panel-stack">
        <InteractivePhoto
          v-if="canPreview"
          :background-preset="editorStore.backgroundPreset"
          :editable="true"
          :eye-data="editorStore.eyeData"
          :eye-settings="editorStore.eyeSettings"
          :image-height="editorStore.imageHeight"
          :image-url="editorStore.processedImageDataUrl"
          :image-width="editorStore.imageWidth"
          @update-eye="editorStore.updateEye($event.index, $event.patch)"
        />

        <FaceDetector :error="faceDetection.error.value" :eyes="editorStore.eyeData" :status="faceDetection.status.value" />
      </section>

      <aside class="glass-card editor-sidebar">
        <div class="control-grid">
          <BackgroundSelector
            :keep-original-background="editorStore.keepOriginalBackground"
            :selected-id="editorStore.backgroundPreset"
            @random="randomBackground"
            @select="chooseBackground"
            @toggle-original="toggleOriginalBackground"
          />

          <label>
            <span>Tamaño de ojos</span>
            <input :value="editorStore.eyeSettings.eyeScale" max="1.4" min="0.8" step="0.01" type="range" @input="updateSetting('eyeScale', $event)" />
            <span class="range-value">{{ editorStore.eyeSettings.eyeScale.toFixed(2) }}×</span>
          </label>

          <label>
            <span>Tamaño de pupilas</span>
            <input :value="editorStore.eyeSettings.pupilScale" max="0.55" min="0.28" step="0.01" type="range" @input="updateSetting('pupilScale', $event)" />
            <span class="range-value">{{ editorStore.eyeSettings.pupilScale.toFixed(2) }}</span>
          </label>

          <label>
            <span>Velocidad de animación</span>
            <input :value="editorStore.eyeSettings.animationSpeed" max="0.26" min="0.05" step="0.01" type="range" @input="updateSetting('animationSpeed', $event)" />
            <span class="range-value">{{ editorStore.eyeSettings.animationSpeed.toFixed(2) }}</span>
          </label>

          <label>
            <span>Tambaleo</span>
            <input :value="editorStore.eyeSettings.wobble" max="0.45" min="0" step="0.01" type="range" @input="updateSetting('wobble', $event)" />
            <span class="range-value">{{ editorStore.eyeSettings.wobble.toFixed(2) }}</span>
          </label>

          <label>
            <input :checked="editorStore.eyeSettings.blink" type="checkbox" @change="editorStore.updateEyeSetting('blink', $event.target.checked)" />
            Añadir parpadeo ocasional
          </label>

          <label>
            <input :checked="editorStore.isPublic" type="checkbox" @change="editorStore.setPublicOptIn($event.target.checked)" />
            Mostrar esta foto en la galería pública
          </label>

          <p class="caption">Las fotos solo se suben cuando presionas <strong>Guardar y compartir</strong>. Cualquier persona con el enlace podrá ver el resultado.</p>

          <div class="button-row">
            <button type="button" @click="resetEditor">Restablecer</button>
            <button type="button" @click="randomize">Aleatorizar</button>
            <button v-if="backgroundRemoval.error.value" type="button" @click="retrySegmentation">Reintentar fondo</button>
            <button class="primary" type="button" @click="saveAndShare">Guardar y compartir</button>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.editor-sidebar {
  padding: 1rem;
}

@media (min-width: 900px) {
  .editor-sidebar {
    padding: 1.2rem;
  }
}
</style>
