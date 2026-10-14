<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import CameraCapture from '@/components/CameraCapture.vue'
import PhotoUploader from '@/components/PhotoUploader.vue'
import { useEditorStore } from '@/stores/editor'
import { prepareImageFile } from '@/utils/image'

const router = useRouter()
const editorStore = useEditorStore()
const isPreparing = ref(false)
const errorMessage = ref('')
const previewUrl = ref(editorStore.preparedImageDataUrl)

const hasPreview = computed(() => Boolean(previewUrl.value))

async function ingestFile(file) {
  errorMessage.value = ''

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    errorMessage.value = 'Por favor sube una imagen JPG, PNG o WebP.'
    return
  }

  isPreparing.value = true

  try {
    const prepared = await prepareImageFile(file)
    editorStore.setPreparedImage(prepared)
    previewUrl.value = prepared.dataUrl
  } catch (caughtError) {
    errorMessage.value = caughtError.message || 'No se pudo preparar esta imagen.'
  } finally {
    isPreparing.value = false
  }
}

async function handleCapture(frame) {
  const file = new File([frame.blob], 'googlyme-camera.jpg', { type: 'image/jpeg' })
  await ingestFile(file)
}

function startEditing() {
  router.push('/edit')
}

function clearPreview() {
  previewUrl.value = ''
  editorStore.clearDraft()
}
</script>

<template>
  <section class="container panel-stack">
    <div class="badge">Crear</div>
    <h1>Captura la cara perfecta para los ojos más saltones</h1>
    <p class="lead">Usa tu cámara o sube una imagen. Solo pedimos acceso a la cámara cuando presionas el botón correspondiente.</p>

    <div v-if="errorMessage" class="status-banner status-banner--error">{{ errorMessage }}</div>

    <div class="hero-grid">
      <div class="panel-stack">
        <CameraCapture @captured="handleCapture" />
        <PhotoUploader @selected="ingestFile" />
      </div>

      <article class="glass-card upload-preview">
        <h3>Vista previa</h3>
        <p class="caption">Corregimos la orientación automáticamente y reducimos imágenes demasiado grandes antes de editar.</p>

        <div v-if="isPreparing" class="loading-card">
          <strong>Preparando tu foto...</strong>
        </div>

        <template v-else-if="hasPreview">
          <img :src="previewUrl" alt="Vista previa de la imagen seleccionada" class="upload-preview__image" />
          <div class="button-row">
            <button class="primary" type="button" @click="startEditing">Confirmar y editar</button>
            <button type="button" @click="clearPreview">Reemplazar foto</button>
          </div>
        </template>

        <div v-else class="empty-state">
          <p>Sube una foto o captura una selfie para continuar.</p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.upload-preview {
  padding: 1rem;
}

.upload-preview__image {
  border-radius: 24px;
  margin-bottom: 1rem;
}

@media (min-width: 900px) {
  .upload-preview {
    padding: 1.2rem;
  }
}
</style>
