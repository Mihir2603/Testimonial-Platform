import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const uploadsDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, 'testimonials.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    text TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    sentiment TEXT,
    sentiment_summary TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);
  CREATE INDEX IF NOT EXISTS idx_testimonials_email ON testimonials(email);
`);

const columns = db.prepare('PRAGMA table_info(testimonials)').all().map((c) => c.name);
if (!columns.includes('sentiment')) {
  db.exec('ALTER TABLE testimonials ADD COLUMN sentiment TEXT');
}
if (!columns.includes('sentiment_summary')) {
  db.exec('ALTER TABLE testimonials ADD COLUMN sentiment_summary TEXT');
}

export { db, uploadsDir };
