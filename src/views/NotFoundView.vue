<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="container empty-state glass-card">
    <div class="badge">404</div>
    <h1>Esos ojos saltones se fueron rodando</h1>
    <p>No pudimos encontrar la página que buscas, pero siempre puedes crear una nueva.</p>
    <RouterLink class="button-link" role="button" to="/create">Crear Ojitos</RouterLink>
  </section>
</template>
