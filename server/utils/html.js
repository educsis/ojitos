export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function injectOgMeta(html, photo) {
  const tags = [
    `<meta property="og:title" content="¡Mira mis Ojitos! 👀">`,
    `<meta property="og:description" content="¡Mis ojos te siguen! Crea tus propios Ojitos.">`,
    `<meta property="og:image" content="${escapeHtml(photo.previewUrl || photo.imageUrl)}">`,
    `<meta property="og:url" content="${escapeHtml(photo.publicUrl)}">`,
    `<meta property="og:type" content="website">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="¡Mira mis Ojitos! 👀">`,
    `<meta name="twitter:description" content="¡Mis ojos te siguen! Crea tus propios Ojitos.">`,
    `<meta name="twitter:image" content="${escapeHtml(photo.previewUrl || photo.imageUrl)}">`,
  ].join('\n    ')

  return html.replace('</head>', `    ${tags}\n  </head>`)
}

export function buildDevPhotoShell(photo) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ojitos</title>
    <meta property="og:title" content="¡Mira mis Ojitos! 👀">
    <meta property="og:description" content="¡Mis ojos te siguen! Crea tus propios Ojitos.">
    <meta property="og:image" content="${escapeHtml(photo.previewUrl || photo.imageUrl)}">
    <meta property="og:url" content="${escapeHtml(photo.publicUrl)}">
    <meta property="og:type" content="website">
    <script>window.location.replace(${JSON.stringify(photo.publicUrl)})</script>
  </head>
  <body>
    <p>Redirecting to <a href="${escapeHtml(photo.publicUrl)}">${escapeHtml(photo.publicUrl)}</a>...</p>
  </body>
</html>`
}
