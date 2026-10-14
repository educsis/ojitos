import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
import { config } from './config.js'

let database

function initializeDatabase(db) {
  const schemaPath = path.resolve(config.rootDir, 'server/database/init.sql')
  const schema = fs.readFileSync(schemaPath, 'utf8')
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.exec(schema)
}

export function getDatabase() {
  if (!database) {
    fs.mkdirSync(path.dirname(config.databasePath), { recursive: true })
    database = new Database(config.databasePath)
    initializeDatabase(database)
  }

  return database
}
