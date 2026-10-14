<script setup>
import { computed } from 'vue'
import GooglyEyes from '@/components/GooglyEyes.vue'
import { buildBackgroundStyle } from '@/utils/backgrounds'

const props = defineProps({
  imageUrl: {
    type: String,
    required: true,
  },
  eyeData: {
    type: Array,
    default: () => [],
  },
  eyeSettings: {
    type: Object,
    required: true,
  },
  backgroundPreset: {
    type: String,
    default: 'candy-pink',
  },
  imageWidth: {
    type: Number,
    required: true,
  },
  imageHeight: {
    type: Number,
    required: true,
  },
  editable: {
    type: Boolean,
    default: false,
  },
  interactive: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update-eye'])
const stageStyle = computed(() => ({
  ...buildBackgroundStyle(props.backgroundPreset),
  aspectRatio: `${props.imageWidth} / ${props.imageHeight}`,
}))
</script>

<template>
  <figure class="photo-stage preview-card glass-card" :style="stageStyle">
    <img :src="imageUrl" alt="Vista previa de Ojitos" class="photo-stage__image" />
    <GooglyEyes
      :editable="editable"
      :eye-data="eyeData"
      :eye-settings="eyeSettings"
      :height="imageHeight"
      :interactive="interactive"
      :width="imageWidth"
      @update-eye="emit('update-eye', $event)"
    />
  </figure>
</template>

<style scoped>
.photo-stage {
  position: relative;
  margin: 0;
  width: 100%;
  overflow: hidden;
}

.photo-stage__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
</style>
