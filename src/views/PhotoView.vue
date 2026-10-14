<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import InteractivePhoto from '@/components/InteractivePhoto.vue'
import LoadingAnimation from '@/components/LoadingAnimation.vue'
import ShareButtons from '@/components/ShareButtons.vue'
import { deletePhoto, getPhoto, recordPhotoView } from '@/services/api'
import { useEditorStore } from '@/stores/editor'

const route = useRoute()
const router = useRouter()
const editorStore = useEditorStore()

const isLoading = ref(true)
const errorMessage = ref('')
const deleteError = ref('')
const deleting = ref(false)
const photo = ref(null)

const freshSave = computed(
  () => route.query.created === '1' && editorStore.lastSavedPhoto?.publicId === route.params.publicId,
)
const deletionToken = computed(() => editorStore.lastSavedPhoto?.deletionToken || '')

async function copyDeletionToken() {
  if (!deletionToken.value) {
    return
  }

  await navigator.clipboard.writeText(deletionToken.value)
}

async function loadPhoto() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    photo.value = await getPhoto(route.params.publicId)
    recordPhotoView(route.params.publicId).catch(() => {})
  } catch (caughtError) {
    errorMessage.value = caughtError.message || 'No se pudieron cargar estos Ojitos.'
  } finally {
    isLoading.value = false
  }
}

async function removePhoto() {
  if (!deletionToken.value) {
    deleteError.value = 'La eliminación solo está disponible en esta misma sesión, a menos que hayas guardado tu token de eliminación.'
    return
  }

  deleting.value = true
  deleteError.value = ''

  try {
    await deletePhoto(route.params.publicId, deletionToken.value)
    editorStore.clearDraft()
    await router.push('/')
  } catch (caughtError) {
    deleteError.value = caughtError.message || 'No se pudo eliminar esta foto.'
  } finally {
    deleting.value = false
  }
}

onMounted(loadPhoto)
</script>

<template>
  <section class="container panel-stack photo-view">
    <LoadingAnimation v-if="isLoading" message="Cargando tu obra maestra con ojos saltones..." />

    <template v-else-if="photo">
      <div v-if="freshSave" class="status-banner status-banner--success photo-view__banner">
        <strong>¡Tus Ojitos están listos! 👀🎉</strong>
        <p>Aquí tienes tu token privado de eliminación. Guárdalo en un lugar seguro si quieres borrar la foto más adelante.</p>
        <div class="button-row photo-view__actions-center">
          <code>{{ deletionToken }}</code>
          <button type="button" @click="copyDeletionToken">Copiar token de eliminación</button>
        </div>
      </div>

      <section class="photo-view__content photo-view__content--split">
        <InteractivePhoto
          :background-preset="photo.backgroundPreset === 'original' ? 'candy-pink' : photo.backgroundPreset"
          :eye-data="photo.eyeData"
          :eye-settings="photo.eyeSettings"
          :image-height="photo.imageHeight"
          :image-url="photo.imageUrl"
          :image-width="photo.imageWidth"
        />

        <div class="glass-card section-card panel-stack photo-view__card">
          <h1>¡Mira mis Ojitos! 👀</h1>
          <p class="lead">¡Mis ojos te siguen! Crea los tuyos con una selfie o subiendo una foto.</p>
          <ShareButtons :preview-url="photo.previewUrl || photo.imageUrl" :share-url="photo.publicUrl" title="¡Mira mis Ojitos! 👀" />
          <div class="button-row photo-view__actions-center">
            <RouterLink class="button-link" role="button" to="/create">Crear otros</RouterLink>
            <button v-if="freshSave" :aria-busy="deleting" type="button" @click="removePhoto">Eliminar foto</button>
          </div>
          <small v-if="deleteError" class="caption">{{ deleteError }}</small>
        </div>
      </section>
    </template>

    <div v-else class="glass-card empty-state">
      <h1>No encontramos estos Ojitos</h1>
      <p>{{ errorMessage || 'Es posible que este enlace haya expirado o que la foto haya sido eliminada.' }}</p>
      <RouterLink class="button-link" role="button" to="/create">Crear uno nuevo</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.photo-view {
  align-items: center;
}

.photo-view__content {
  width: min(100%, 1100px);
}

.photo-view__content--split {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  align-items: center;
}

.photo-view__card,
.photo-view__banner {
  text-align: center;
}

.photo-view__actions-center {
  justify-content: center;
}

:deep(code) {
  display: block;
  max-width: 100%;
  overflow-wrap: anywhere;
}

@media (min-width: 900px) {
  .photo-view__content--split {
    grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
    gap: 1.5rem;
  }
}
</style>
