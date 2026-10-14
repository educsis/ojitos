import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useEyeTracking(containerRef) {
  const pointer = ref({ x: 0.5, y: 0.5 })
  const isPointerActive = ref(false)

  function updatePointer(clientX, clientY) {
    const bounds = containerRef.value?.getBoundingClientRect?.()

    if (!bounds || !bounds.width || !bounds.height) {
      return
    }

    pointer.value = {
      x: (clientX - bounds.left) / bounds.width,
      y: (clientY - bounds.top) / bounds.height,
    }
    isPointerActive.value = true
  }

  function handlePointerMove(event) {
    updatePointer(event.clientX, event.clientY)
  }

  function handleTouchMove(event) {
    const touch = event.touches?.[0]
    if (touch) {
      updatePointer(touch.clientX, touch.clientY)
    }
  }

  function clearPointer() {
    isPointerActive.value = false
  }

  onMounted(() => {
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('pointerleave', clearPointer)
    window.addEventListener('touchend', clearPointer)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('touchmove', handleTouchMove)
    window.removeEventListener('pointerleave', clearPointer)
    window.removeEventListener('touchend', clearPointer)
  })

  return {
    pointer,
    isPointerActive,
    clearPointer,
    updatePointer,
  }
}
