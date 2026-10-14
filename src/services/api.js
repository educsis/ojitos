const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    const message = typeof payload === 'object' ? payload.error || 'La solicitud falló.' : 'La solicitud falló.'
    throw new Error(message)
  }

  return payload
}

export function createPhoto(payload) {
  return request('/photos', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getPhoto(publicId) {
  return request(`/photos/${publicId}`)
}

export function getRecentPhotos(limit = 12) {
  return request(`/photos/recent?limit=${limit}`)
}

export function recordPhotoView(publicId) {
  return request(`/photos/${publicId}/view`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export function deletePhoto(publicId, deletionToken) {
  return request(`/photos/${publicId}`, {
    method: 'DELETE',
    body: JSON.stringify({ deletionToken }),
  })
}
