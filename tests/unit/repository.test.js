// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import Database from 'better-sqlite3'
import { createPhotoRepository } from '../../server/database/repositories/photos.js'

const schema = fs.readFileSync(path.resolve('server/database/init.sql'), 'utf8')

describe('photo repository', () => {
  it('creates and retrieves sqlite photo records', () => {
    const db = new Database(':memory:')
    db.exec(schema)
    const repository = createPhotoRepository(db, { publicBaseUrl: 'http://localhost:5173' })

    repository.create({
      public_id: 'Ab7Kx92P',
      cloudinary_public_id: 'googly/base',
      image_url: 'https://example.com/image.jpg',
      preview_url: 'https://example.com/preview.jpg',
      eye_data: JSON.stringify([{ x: 0.4 }, { x: 0.6 }]),
      eye_settings: JSON.stringify({ eyeScale: 1 }),
      background_preset: 'candy-pink',
      image_width: 1200,
      image_height: 900,
      is_public: true,
      deletion_token_hash: 'hashed-token',
    })

    const photo = repository.findByPublicId('Ab7Kx92P')

    expect(photo.publicId).toBe('Ab7Kx92P')
    expect(photo.imageUrl).toContain('image.jpg')
    expect(photo.eyeData).toHaveLength(2)
    expect(photo.publicUrl).toBe('http://localhost:5173/g/Ab7Kx92P')
  })
})
