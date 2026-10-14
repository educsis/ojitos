export function createPhotoRepository(db, config) {
  const insertPhotoStatement = db.prepare(`
    INSERT INTO photos (
      public_id,
      cloudinary_public_id,
      image_url,
      preview_url,
      eye_data,
      eye_settings,
      background_preset,
      image_width,
      image_height,
      views,
      is_public,
      deletion_token_hash
    ) VALUES (
      @public_id,
      @cloudinary_public_id,
      @image_url,
      @preview_url,
      @eye_data,
      @eye_settings,
      @background_preset,
      @image_width,
      @image_height,
      @views,
      @is_public,
      @deletion_token_hash
    )
  `)

  const selectByPublicIdStatement = db.prepare(`
    SELECT *
    FROM photos
    WHERE public_id = ?
    LIMIT 1
  `)

  const selectRecentPublicStatement = db.prepare(`
    SELECT *
    FROM photos
    WHERE is_public = 1
    ORDER BY created_at DESC
    LIMIT ?
  `)

  const incrementViewsStatement = db.prepare(`
    UPDATE photos
    SET views = views + 1
    WHERE public_id = ?
  `)

  const deleteByPublicIdStatement = db.prepare(`
    DELETE FROM photos
    WHERE public_id = ?
  `)

  function mapPhotoRow(row) {
    if (!row) {
      return null
    }

    return {
      publicId: row.public_id,
      cloudinaryPublicId: row.cloudinary_public_id,
      imageUrl: row.image_url,
      previewUrl: row.preview_url,
      eyeData: JSON.parse(row.eye_data),
      eyeSettings: JSON.parse(row.eye_settings),
      backgroundPreset: row.background_preset,
      imageWidth: row.image_width,
      imageHeight: row.image_height,
      views: row.views,
      isPublic: Boolean(row.is_public),
      createdAt: row.created_at,
      publicUrl: new URL(`/g/${row.public_id}`, config.publicBaseUrl).toString(),
      deletionTokenHash: row.deletion_token_hash,
    }
  }

  return {
    create(photo) {
      insertPhotoStatement.run({
        ...photo,
        views: photo.views ?? 0,
        is_public: photo.is_public ? 1 : 0,
      })
      return this.findByPublicId(photo.public_id)
    },

    findByPublicId(publicId) {
      return mapPhotoRow(selectByPublicIdStatement.get(publicId))
    },

    listRecentPublic(limit) {
      return selectRecentPublicStatement.all(limit).map(mapPhotoRow)
    },

    incrementViews(publicId) {
      incrementViewsStatement.run(publicId)
    },

    deleteByPublicId(publicId) {
      deleteByPublicIdStatement.run(publicId)
    },
  }
}
