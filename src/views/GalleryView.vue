<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import LoadingAnimation from '@/components/LoadingAnimation.vue'
import { getRecentPhotos } from '@/services/api'

const isLoading = ref(true)
const photos = ref([])

onMounted(async () => {
  try {
    const payload = await getRecentPhotos(24)
    photos.value = payload.photos || []
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section class="container panel-stack">
    <div class="badge">Galería</div>
    <h1>Galería pública de Ojitos</h1>
    <p class="lead">Una colección colorida de caras con ojos saltones compartidas por personas que decidieron aparecer aquí.</p>

    <LoadingAnimation v-if="isLoading" message="Reuniendo las últimas creaciones divertidas..." />

    <div v-else-if="photos.length" class="gallery-grid">
      <RouterLink v-for="photo in photos" :key="photo.publicId" :to="`/g/${photo.publicId}`" class="photo-card">
        <img :src="photo.imageUrl" :alt="`Ojitos ${photo.publicId}`" />
        <div class="photo-card__body">
          <strong>{{ photo.publicId }}</strong>
          <p class="caption">{{ photo.views }} vistas · {{ new Date(photo.createdAt).toLocaleDateString() }}</p>
        </div>
      </RouterLink>
    </div>

    <div v-else class="glass-card empty-state">
      <p>Aún no hay creaciones públicas. Crea la primera.</p>
      <RouterLink class="button-link" role="button" to="/create">Crear Ojitos</RouterLink>
    </div>
  </section>
</template>
