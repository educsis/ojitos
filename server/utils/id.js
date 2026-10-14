import crypto from 'node:crypto'
import { customAlphabet } from 'nanoid'

const generateId = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', 8)

export function generatePublicId() {
  return generateId()
}

export function generateDeletionToken() {
  return crypto.randomBytes(24).toString('base64url')
}

export function hashDeletionToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}
