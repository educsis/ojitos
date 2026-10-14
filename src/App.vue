<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const isPhotoRoute = computed(() => route.name === 'photo')
</script>

<template>
  <div class="app-shell" :class="{ 'app-shell--immersive': isPhotoRoute }">


    <main class="site-main">
      <RouterView v-slot="{ Component, route: currentRoute }">
        <Transition name="page-fade" mode="out-in">
          <component :is="Component" :key="currentRoute.fullPath" />
        </Transition>
      </RouterView>
    </main>


  </div>
</template>
