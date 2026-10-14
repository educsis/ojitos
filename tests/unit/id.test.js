// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { generateDeletionToken, generatePublicId } from '../../server/utils/id.js'

describe('id generation', () => {
  it('generates unique public ids across a small batch', () => {
    const ids = new Set(Array.from({ length: 200 }, () => generatePublicId()))
    expect(ids.size).toBe(200)
  })

  it('generates opaque deletion tokens', () => {
    const token = generateDeletionToken()
    expect(token.length).toBeGreaterThan(20)
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
  })
})
