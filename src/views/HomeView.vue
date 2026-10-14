<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import InteractivePhoto from '@/components/InteractivePhoto.vue'
import { getRecentPhotos } from '@/services/api'
import { getDefaultEyeSettings } from '@/utils/eyeMath'

const recentPhotos = ref([])
const sampleEyeSettings = getDefaultEyeSettings()
const sampleEyes = [
  { id: 'left', x: 0.41, y: 0.43, radiusX: 0.085, radiusY: 0.078, rotation: -0.05 },
  { id: 'right', x: 0.59, y: 0.43, radiusX: 0.085, radiusY: 0.078, rotation: 0.05 },
]

onMounted(async () => {
  try {
    const payload = await getRecentPhotos(6)
    recentPhotos.value = payload.photos || []
  } catch {
    recentPhotos.value = []
  }
})
</script>

<template>
  <section class="container panel-stack">
    <div class="hero-grid">
      <div class="panel-stack">
        <h1>¡Convierte tu selfie en una obra maestra con Ojitos!</h1>
        <p class="lead">
          Tómate una foto o sube una imagen, deja que Ojitos detecte tus ojos, cambie el fondo y comparta un enlace permanente donde las pupilas siguen a cada visitante.
        </p>

        <div class="button-row">
          <RouterLink class="button-link" role="button" to="/create">Tomar una selfie</RouterLink>
          <RouterLink class="button-link secondary" role="button" to="/create">Subir una foto</RouterLink>
        </div>
      </div>

      <InteractivePhoto
        background-preset="neon-party"
        :eye-data="sampleEyes"
        :eye-settings="sampleEyeSettings"
        image-url="/hero-face.svg"
        :image-height="860"
        :image-width="720"
      />
    </div>

    <section class="panel-stack">
      <div class="button-row section-header">
        <div>
          <h2>Creaciones públicas recientes</h2>
          <p class="caption">Aquí solo aparecen las fotos que aceptaron mostrarse en la galería.</p>
        </div>
        <RouterLink to="/gallery">Ver galería completa</RouterLink>
      </div>

      <div v-if="recentPhotos.length" class="gallery-grid">
        <RouterLink v-for="photo in recentPhotos" :key="photo.publicId" :to="`/g/${photo.publicId}`" class="photo-card">
          <img :src="photo.imageUrl" :alt="`Ojitos ${photo.publicId}`" />
          <div class="photo-card__body">
            <strong>{{ photo.publicId }}</strong>
            <p class="caption">{{ photo.views }} vistas · {{ new Date(photo.createdAt).toLocaleDateString() }}</p>
          </div>
        </RouterLink>
      </div>
      <div v-else class="glass-card empty-state">
        <p>Aún no hay fotos públicas de Ojitos. Sé el primero en publicar una en la galería.</p>
      </div>
    </section>
  </section>
</template>

<style scoped>
.hero-features {
  padding: 1.25rem;
}

.hero-features ul {
  margin: 0;
  padding-left: 1.1rem;
}

.section-header {
  justify-content: flex-start;
  align-items: flex-start;
}

@media (min-width: 900px) {
  .section-header {
    justify-content: space-between;
    align-items: center;
  }
}
</style>
