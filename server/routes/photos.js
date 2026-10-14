import { Router } from 'express'

export function createPhotoRouter({ photoService }) {
  const router = Router()

  router.get('/photos/recent', (request, response) => {
    try {
      const photos = photoService.listRecentPublic(request.query.limit)
      response.json({ photos })
    } catch (error) {
      response.status(400).json({ error: error.message || 'No se pudieron cargar las fotos recientes.' })
    }
  })

  router.get('/photos/:publicId', (request, response) => {
    try {
      const photo = photoService.getPhoto(request.params.publicId)
      if (!photo) {
        response.status(404).json({ error: 'Foto no encontrada.' })
        return
      }

      response.json(photo)
    } catch (error) {
      response.status(400).json({ error: error.message || 'No se pudo cargar esta foto.' })
    }
  })

  router.post('/photos/:publicId/view', (request, response) => {
    try {
      photoService.incrementViews(request.params.publicId)
      response.json({ ok: true })
    } catch (error) {
      response.status(400).json({ error: error.message || 'No se pudo registrar la vista de la foto.' })
    }
  })

  router.post('/photos', async (request, response) => {
    try {
      const photo = await photoService.createPhoto(request.body)
      response.status(201).json(photo)
    } catch (error) {
      response.status(400).json({ error: error.message || 'No se pudo guardar esta foto.' })
    }
  })

  router.delete('/photos/:publicId', async (request, response) => {
    try {
      const deleted = await photoService.deletePhoto(request.params.publicId, request.body.deletionToken)
      if (!deleted) {
        response.status(404).json({ error: 'Foto no encontrada.' })
        return
      }

      response.json({ ok: true })
    } catch (error) {
      response.status(400).json({ error: error.message || 'No se pudo eliminar esta foto.' })
    }
  })

  return router
}
