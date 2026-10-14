import { defineStore } from 'pinia'
import { DEFAULT_BACKGROUND_PRESET, getRandomBackgroundPreset } from '@/utils/backgrounds'
import { getDefaultEyeSettings } from '@/utils/eyeMath'

const STORAGE_KEY = 'googlyme-editor-draft'

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function createInitialState() {
  return {
    preparedImageDataUrl: '',
    processedImageDataUrl: '',
    imageWidth: 0,
    imageHeight: 0,
    mimeType: 'image/jpeg',
    detectedEyeData: [],
    eyeData: [],
    eyeSettings: getDefaultEyeSettings(),
    backgroundPreset: DEFAULT_BACKGROUND_PRESET,
    keepOriginalBackground: true,
    isPublic: true,
    lastSavedPhoto: null,
  }
}

export const useEditorStore = defineStore('editor', {
  state: createInitialState,

  getters: {
    hasSource: (state) => Boolean(state.preparedImageDataUrl),
    hasProcessed: (state) => Boolean(state.processedImageDataUrl),
  },

  actions: {
    hydrate() {
      if (typeof window === 'undefined') {
        return
      }

      const raw = window.sessionStorage.getItem(STORAGE_KEY)
      if (!raw) {
        return
      }

      try {
        Object.assign(this, createInitialState(), JSON.parse(raw))
      } catch {
        window.sessionStorage.removeItem(STORAGE_KEY)
      }
    },

    persist() {
      if (typeof window === 'undefined') {
        return
      }

      const snapshot = {
        preparedImageDataUrl: this.preparedImageDataUrl,
        processedImageDataUrl: this.processedImageDataUrl,
        imageWidth: this.imageWidth,
        imageHeight: this.imageHeight,
        mimeType: this.mimeType,
        detectedEyeData: this.detectedEyeData,
        eyeData: this.eyeData,
        eyeSettings: this.eyeSettings,
        backgroundPreset: this.backgroundPreset,
        keepOriginalBackground: this.keepOriginalBackground,
        isPublic: this.isPublic,
        lastSavedPhoto: this.lastSavedPhoto,
      }

      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
    },

    setPreparedImage({ dataUrl, width, height, mimeType = 'image/jpeg' }) {
      this.preparedImageDataUrl = dataUrl
      this.processedImageDataUrl = ''
      this.imageWidth = width
      this.imageHeight = height
      this.mimeType = mimeType
      this.detectedEyeData = []
      this.eyeData = []
      this.eyeSettings = getDefaultEyeSettings()
      this.backgroundPreset = DEFAULT_BACKGROUND_PRESET
      this.keepOriginalBackground = true
      this.lastSavedPhoto = null
      this.persist()
    },

    setDetectedEyes(eyes) {
      this.detectedEyeData = clone(eyes)
      if (!this.eyeData.length) {
        this.eyeData = clone(eyes)
      }
      this.persist()
    },

    setEyeData(eyes) {
      this.eyeData = clone(eyes)
      this.persist()
    },

    updateEye(index, patch) {
      this.eyeData[index] = {
        ...this.eyeData[index],
        ...patch,
      }
      this.persist()
    },

    updateEyeSetting(key, value) {
      this.eyeSettings = {
        ...this.eyeSettings,
        [key]: value,
      }
      this.persist()
    },

    setBackgroundPreset(presetId) {
      this.backgroundPreset = presetId
      this.persist()
    },

    setKeepOriginalBackground(value) {
      this.keepOriginalBackground = Boolean(value)
      this.persist()
    },

    setPublicOptIn(value) {
      this.isPublic = Boolean(value)
      this.persist()
    },

    setProcessedImage({ dataUrl, width = this.imageWidth, height = this.imageHeight }) {
      this.processedImageDataUrl = dataUrl
      this.imageWidth = width
      this.imageHeight = height
      this.persist()
    },

    randomizeBackground() {
      this.backgroundPreset = getRandomBackgroundPreset(this.backgroundPreset).id
      this.persist()
    },

    resetEditor() {
      this.eyeSettings = getDefaultEyeSettings()
      this.eyeData = clone(this.detectedEyeData)
      this.backgroundPreset = DEFAULT_BACKGROUND_PRESET
      this.keepOriginalBackground = true
      this.persist()
    },

    setLastSavedPhoto(photo) {
      this.lastSavedPhoto = photo
      this.persist()
    },

    toApiPayload(previewDataUrl) {
      return {
        imageDataUrl: this.processedImageDataUrl || this.preparedImageDataUrl,
        previewDataUrl,
        eyeData: this.eyeData,
        eyeSettings: this.eyeSettings,
        backgroundPreset: this.keepOriginalBackground ? 'original' : this.backgroundPreset,
        imageWidth: this.imageWidth,
        imageHeight: this.imageHeight,
        isPublic: this.isPublic,
      }
    },

    clearDraft() {
      Object.assign(this, createInitialState())
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(STORAGE_KEY)
      }
    },
  },
})
