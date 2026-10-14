<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import PhotoEditor from '@/components/PhotoEditor.vue'
import { useEditorStore } from '@/stores/editor'

const editorStore = useEditorStore()
const hasDraft = computed(() => editorStore.hasSource)
</script>

<template>
  <PhotoEditor v-if="hasDraft" />

  <section v-else class="container empty-state glass-card">
    <h1>Aún no hay una foto lista</h1>
    <p>Empieza tomando una selfie o subiendo una foto primero.</p>
    <RouterLink class="button-link" role="button" to="/create">Ir a crear</RouterLink>
  </section>
</template>
