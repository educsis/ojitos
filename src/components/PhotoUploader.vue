<script setup>
const emit = defineEmits(['selected'])

function handleChange(event) {
  const file = event.target.files?.[0]
  if (file) {
    emit('selected', file)
  }
}

function handleDrop(event) {
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    emit('selected', file)
  }
}
</script>

<template>
  <label class="uploader glass-card" @dragover.prevent @drop.prevent="handleDrop">
    <input accept="image/jpeg,image/png,image/webp" type="file" hidden @change="handleChange" />
    <span class="uploader__emoji">🖼️</span>
    <strong>Sube una foto</strong>
    <span class="caption">JPG, PNG o WebP · compatible con arrastrar y soltar</span>
  </label>
</template>

<style scoped>
.uploader {
  display: grid;
  place-items: center;
  gap: 0.55rem;
  min-height: 220px;
  padding: 1.5rem;
  border: 2px dashed rgba(122, 98, 227, 0.24);
  cursor: pointer;
  text-align: center;
}

.uploader__emoji {
  font-size: 2.2rem;
}
</style>
