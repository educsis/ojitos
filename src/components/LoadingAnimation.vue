<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: {
    type: String,
    default: 'Añadiendo la máxima dosis de diversión...',
  },
})

const bouncingDots = computed(() => ['•', '•', '•'])
</script>

<template>
  <div class="loading-card glass-card">
    <div class="loading-eyes" aria-hidden="true">
      <span>👀</span>
      <span>✨</span>
    </div>
    <strong>{{ message }}</strong>
    <div class="loading-dots" aria-hidden="true">
      <span v-for="(dot, index) in bouncingDots" :key="index">{{ dot }}</span>
    </div>
  </div>
</template>

<style scoped>
.loading-eyes {
  font-size: 2.5rem;
  animation: bobble 1.2s ease-in-out infinite;
}

.loading-dots {
  display: inline-flex;
  gap: 0.4rem;
  color: #7b4dff;
}

.loading-dots span {
  animation: bounce 1s ease-in-out infinite;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.15s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes bobble {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px) scale(1.04);
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.35;
  }
  50% {
    transform: translateY(-5px);
    opacity: 1;
  }
}
</style>
