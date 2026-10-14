import { fileURLToPath } from 'node:url'
import { createApp } from './app.js'
import { config } from './config.js'

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url)

if (isDirectRun) {
  const { app } = createApp()
  app.listen(config.port, () => {
    console.log(`Ojitos server listening on http://localhost:${config.port}`)
  })
}
