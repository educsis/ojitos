<script setup>
import { BACKGROUND_PRESETS, buildBackgroundStyle } from '@/utils/backgrounds'

const props = defineProps({
  selectedId: {
    type: String,
    required: true,
  },
  keepOriginalBackground: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select', 'random', 'toggle-original'])
</script>

<template>
  <section class="panel-stack">
    <div class="button-row selector-header">
      <h3>Fondos</h3>
      <button type="button" @click="emit('random')">Fondo aleatorio</button>
    </div>

    <label>
      <input
        :checked="keepOriginalBackground"
        type="checkbox"
        @change="emit('toggle-original', $event.target.checked)"
      />
      Mantener el fondo original de la foto (recomendado)
    </label>

    <div class="background-grid">
      <button
        v-for="preset in BACKGROUND_PRESETS"
        :key="preset.id"
        type="button"
        class="background-chip"
        :class="{ 'background-chip--active': preset.id === selectedId && !keepOriginalBackground }"
        :style="buildBackgroundStyle(preset.id)"
        @click="emit('select', preset.id)"
      >
        <span>{{ preset.name }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.selector-header {
  justify-content: space-between;
  align-items: center;
}

.background-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.background-chip {
  min-height: 92px;
  color: #fff;
  font-weight: 700;
  border: 2px solid transparent;
  text-shadow: 0 1px 10px rgba(15, 14, 29, 0.24);
}

.background-chip--active {
  border-color: rgba(255, 255, 255, 0.92);
  box-shadow: 0 0 0 3px rgba(123, 77, 255, 0.28);
}
</style>
