import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

export const config = {
  rootDir,
  port: Number(process.env.PORT || 3000),
  databasePath: path.resolve(rootDir, process.env.DATABASE_PATH || './data/googlyme.sqlite'),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:5173',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
  cloudinaryFolder: process.env.CLOUDINARY_FOLDER || 'googlyme',
  requestBodyLimit: process.env.REQUEST_BODY_LIMIT || '15mb',
  distPath: path.resolve(rootDir, 'dist'),
}
