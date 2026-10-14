<script setup>
import { ref } from 'vue'
import { downloadDataUrl } from '@/utils/image'

const props = defineProps({
  shareUrl: {
    type: String,
    required: true,
  },
  previewUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: '¡Mira mis Ojitos! 👀',
  },
})

const status = ref('')
const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.shareUrl)}`

async function copyLink() {
  await navigator.clipboard.writeText(props.shareUrl)
  status.value = '¡Enlace copiado!'
}

async function nativeShare() {
  if (!navigator.share) {
    status.value = 'El uso compartido nativo no está disponible en este dispositivo.'
    return
  }

  await navigator.share({
    title: props.title,
    text: '¡Mis ojos te siguen! Crea tus propios Ojitos.',
    url: props.shareUrl,
  })
}

function download() {
  if (props.previewUrl.startsWith('data:')) {
    downloadDataUrl('googlyme-preview.jpg', props.previewUrl)
    return
  }

  const link = document.createElement('a')
  link.href = props.previewUrl
  link.download = 'googlyme-preview.jpg'
  link.click()
}
</script>

<template>
  <div class="panel-stack">
    <div class="button-row">
      <button class="primary" type="button" @click="copyLink">Copiar enlace</button>
      <a :href="facebookUrl" class="button-link" role="button" target="_blank" rel="noreferrer">Compartir en Facebook</a>
      <button type="button" @click="nativeShare">Compartir</button>
      <button type="button" @click="download">Descargar imagen</button>
    </div>

    <small v-if="status" class="caption">{{ status }}</small>
  </div>
</template>
