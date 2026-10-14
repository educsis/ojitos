# GooglyMe 👀

GooglyMe is a playful Vue 3 + Express web app that lets people take or upload a selfie, detect their eyes, replace the background with a colorful blur, and share a permanent link where the googly eyes still follow the viewer's cursor or touch position.

## Stack

- Frontend: Vue 3, Vite, Vue Router, Pinia, Pico CSS, MediaPipe Tasks Vision
- Backend: Node.js, Express, SQLite (`better-sqlite3`), Cloudinary, Nano ID
- Testing: Vitest, Playwright, Supertest

## Features implemented

- Responsive landing page, create flow, editor, gallery, shared-photo route, and 404 page
- Camera capture with front/rear switching
- Upload support for JPG, PNG, and WebP
- Automatic image preparation with orientation-aware resizing
- Face landmark detection using MediaPipe Face Landmarker
- Browser-side background removal using MediaPipe Image Segmenter
- Draggable/manual eye adjustment plus editor sliders
- Interactive googly-eye rendering with smoothing, wandering, and optional blinking
- Cloudinary-backed image/preview upload through the backend only
- SQLite persistence for image metadata, eye coordinates, and animation settings
- Permanent public IDs and shareable `/g/:publicId` routes
- Server-rendered Open Graph metadata for shared photo URLs
- Opt-in gallery, rate limiting, payload validation, and deletion tokens

## Project structure

```text
src/
├── assets/
├── components/
├── composables/
├── router/
├── services/
├── stores/
├── utils/
└── views/

server/
├── database/
│   ├── init.sql
│   └── repositories/
├── routes/
├── services/
├── utils/
├── app.js
├── config.js
├── db.js
└── index.js
```

## Environment variables

Copy `.env.example` to `.env` and fill in your Cloudinary credentials.

```env
PORT=3000
DATABASE_PATH=./data/googlyme.sqlite

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=googlyme

PUBLIC_BASE_URL=http://localhost:5173
VITE_API_BASE_URL=/api
```

### Notes

- `PUBLIC_BASE_URL` should point to the public frontend origin that shared links will use.
- Cloudinary credentials are only read by the backend.
- SQLite data is stored at `DATABASE_PATH` and persists across restarts.

## Install

```bash
npm install
```

If your machine has npm cache permission issues, point npm at a project-local cache:

```bash
npm_config_cache=./.npm-cache npm install
```

## Development

Run both the API server and the Vite dev client:

```bash
npm run dev
```

This starts:

- Vue dev server: `http://localhost:5173`
- Express API server: `http://localhost:3000`

Vite proxies `/api/*` requests to the backend during development.

## Production build

Build the frontend bundle:

```bash
npm run build
```

Start the Express server:

```bash
npm run start
```

In production, the Express server serves the built frontend from `dist/` and injects Open Graph metadata for `/g/:publicId` routes.

## Cloudinary setup

1. Create a Cloudinary account.
2. Copy your cloud name, API key, and API secret into `.env`.
3. Optionally set `CLOUDINARY_FOLDER` if you want uploads organized under a custom folder.

GooglyMe uploads two assets per saved photo:

- `base`: the processed photo with the gradient/person composition but **without** flattened interactive eyes
- `preview`: a static share/download preview with the googly eyes baked in for social cards

## Database initialization

The SQLite schema lives in `server/database/init.sql` and is applied automatically on server startup.

Main table:

- `public_id` unique share ID
- `cloudinary_public_id` Cloudinary asset ID
- `image_url` processed base image URL
- `preview_url` static preview image URL
- `eye_data` normalized eye coordinates JSON
- `eye_settings` googly-eye animation settings JSON
- `background_preset`, dimensions, views, public-gallery flag
- `deletion_token_hash` for authenticated deletion

## API

### Required endpoints

- `POST /api/photos`
- `GET /api/photos/:publicId`
- `GET /api/photos/recent`
- `POST /api/photos/:publicId/view`
- `GET /api/health`

### Additional deletion endpoint

- `DELETE /api/photos/:publicId`

Body:

```json
{
  "deletionToken": "private-token-from-create-response"
}
```

## MediaPipe models

The editor lazy-loads MediaPipe WASM/model assets at runtime from official CDN/Google-hosted URLs.

Used models:

- Face Landmarker for eye detection
- Selfie Image Segmenter for background removal

## Testing

Run unit and integration tests:

```bash
npm run test
```

Run Playwright end-to-end tests:

```bash
npm run test:e2e
```

Current automated coverage includes:

- Eye math / pupil bounds
- Face landmark to eye-coordinate transforms
- Payload validation
- Public ID + deletion-token generation
- SQLite repository create/retrieve behavior
- Share-route Open Graph metadata
- Responsive landing/shared route smoke tests via Playwright

## Privacy and safety

- Photos are only uploaded when the user clicks **Save & Share**.
- Public gallery inclusion is opt-in.
- Uploaded payloads are validated server-side.
- Cloudinary credentials never touch the frontend.
- Deletion requires the private token returned at creation time.

## Deployment tips

- Persist the `data/` directory or point `DATABASE_PATH` to persistent storage.
- Set `PUBLIC_BASE_URL` to the final public site origin.
- Ensure outbound access from the backend to Cloudinary.
- Build the frontend before starting the production server.

## Known constraints / next improvements

- MediaPipe models load from remote URLs on first use.
- The current editor supports one face per image.
- Deletion token persistence in the UI is session-based; if you want long-term self-service deletion, add a dedicated "manage photo" flow that lets users store or re-enter the token.
# ojitos
