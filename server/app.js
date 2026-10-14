import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { config as defaultConfig } from './config.js'
import { getDatabase } from './db.js'
import { createPhotoRepository } from './database/repositories/photos.js'
import { createHealthRouter } from './routes/health.js'
import { createPhotoRouter } from './routes/photos.js'
import { createCloudinaryService } from './services/cloudinary.js'
import { createPhotoService } from './services/photoService.js'
import { buildDevPhotoShell, injectOgMeta } from './utils/html.js'

function createCorsOptions(config) {
  const allowedOrigins = new Set([
    config.publicBaseUrl,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ])

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true)
        return
      }
      callback(null, true)
    },
  }
}

function createSpaIndexHtml(config, photo = null) {
  const indexPath = path.resolve(config.distPath, 'index.html')

  if (!fs.existsSync(indexPath)) {
    return null
  }

  const html = fs.readFileSync(indexPath, 'utf8')
  return photo ? injectOgMeta(html, photo) : html
}

export function createApp(options = {}) {
  const config = options.config || defaultConfig
  const app = express()

  const photoService = options.photoService
    || createPhotoService({
      cloudinaryService: options.cloudinaryService || createCloudinaryService(config),
      photoRepository: options.photoRepository || createPhotoRepository(options.db || getDatabase(), config),
    })

  app.disable('x-powered-by')
  app.use(cors(createCorsOptions(config)))
  app.use(express.json({ limit: config.requestBodyLimit }))
  app.use((request, response, next) => {
    response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    next()
  })

  const createLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many save attempts. Please wait a bit and try again.' },
  })

  const deleteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many delete attempts. Please wait a bit and try again.' },
  })

  app.use('/api', createHealthRouter())
  app.use('/api/photos', (request, response, next) => {
    if (request.method === 'POST') {
      createLimiter(request, response, next)
      return
    }
    if (request.method === 'DELETE') {
      deleteLimiter(request, response, next)
      return
    }
    next()
  })
  app.use('/api', createPhotoRouter({ photoService }))

  app.get('/g/:publicId', (request, response, next) => {
    try {
      const photo = photoService.getPhoto(request.params.publicId)
      if (!photo) {
        next()
        return
      }

      const builtHtml = createSpaIndexHtml(config, photo)
      response.type('html')
      if (builtHtml) {
        response.send(builtHtml)
        return
      }

      response.send(buildDevPhotoShell(photo))
    } catch {
      next()
    }
  })

  if (fs.existsSync(config.distPath)) {
    app.use(express.static(config.distPath, { index: false, maxAge: '1h' }))
  }

  app.get(/^(?!\/api).*/, (request, response) => {
    const builtHtml = createSpaIndexHtml(config)
    if (builtHtml) {
      response.type('html').send(builtHtml)
      return
    }

    const target = new URL(request.originalUrl, config.publicBaseUrl).toString()
    response.redirect(target)
  })

  app.use((error, _request, response, _next) => {
    response.status(500).json({
      error: error.message || 'Unexpected server error.',
    })
  })

  return { app, photoService }
}
