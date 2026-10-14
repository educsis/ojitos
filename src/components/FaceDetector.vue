<script setup>
const props = defineProps({
  status: {
    type: String,
    default: 'idle',
  },
  error: {
    type: String,
    default: '',
  },
  eyes: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <article class="glass-card detector-card">
    <h3>Detección facial</h3>
    <p class="caption">Colocamos los ojos saltones automáticamente y luego puedes arrastrarlos si necesitan un ajuste.</p>

    <div v-if="status === 'loading'" class="status-banner status-banner--info">Buscando tus ojos... 👀</div>
    <div v-else-if="error" class="status-banner status-banner--error">{{ error }}</div>
    <div v-else-if="eyes.length" class="status-banner status-banner--success">
      Detectamos {{ eyes.length }} ojo{{ eyes.length > 1 ? 's' : '' }}. Arrastra los círculos sobre la vista previa para ajustarlos mejor.
    </div>
    <div v-else class="status-banner status-banner--info">Esperando una foto para detectar un rostro.</div>
  </article>
</template>

<style scoped>
.detector-card {
  padding: 1.1rem;
}
</style>
