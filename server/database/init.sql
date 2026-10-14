CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    public_id TEXT NOT NULL UNIQUE,
    cloudinary_public_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    preview_url TEXT,
    eye_data TEXT NOT NULL,
    eye_settings TEXT NOT NULL,
    background_preset TEXT,
    image_width INTEGER,
    image_height INTEGER,
    views INTEGER DEFAULT 0,
    is_public INTEGER DEFAULT 0,
    deletion_token_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_photos_public_id ON photos(public_id);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_is_public_created_at ON photos(is_public, created_at DESC);
