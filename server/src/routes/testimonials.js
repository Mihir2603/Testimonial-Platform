import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { db, uploadsDir } from '../db.js';
import { analyzeSentiment } from '../services/sentiment.js';

const router = Router();

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    cb(null, allowed.includes(file.mimetype));
  },
});

const JUNK_PATTERNS = [
  /^test+$/i,
  /^asdf+$/i,
  /^lorem ipsum/i,
  /^(.)\1{10,}$/,
  /https?:\/\//i,
];

function isJunk(text) {
  const trimmed = text.trim();
  if (trimmed.length < 10) return true;
  return JUNK_PATTERNS.some((p) => p.test(trimmed));
}

function findDuplicate(email, text) {
  const normalized = text.trim().toLowerCase();
  return db
    .prepare(
      `SELECT id FROM testimonials
       WHERE email = ? AND lower(trim(text)) = ?
       AND datetime(created_at) > datetime('now', '-24 hours')`
    )
    .get(email.toLowerCase(), normalized);
}

function serialize(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    company: row.company,
    text: row.text,
    rating: row.rating,
    photoUrl: row.photo_url,
    status: row.status,
    sentiment: row.sentiment,
    sentimentSummary: row.sentiment_summary,
    createdAt: row.created_at,
  };
}

router.post('/', upload.single('photo'), async (req, res) => {
  const { name, email, company, text, rating } = req.body;

  if (!name?.trim() || !email?.trim() || !text?.trim() || !rating) {
    return res.status(400).json({ error: 'Name, email, text, and rating are required.' });
  }

  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
  }

  if (isJunk(text)) {
    return res.status(422).json({
      error: 'Your testimonial looks incomplete or spam-like. Please write a genuine review.',
    });
  }

  if (findDuplicate(email, text)) {
    return res.status(409).json({
      error: 'You already submitted this testimonial recently. Please wait before submitting again.',
    });
  }

  const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const trimmedText = text.trim();
  const { sentiment, summary } = await analyzeSentiment(trimmedText, ratingNum);

  const result = db
    .prepare(
      `INSERT INTO testimonials (name, email, company, text, rating, photo_url, sentiment, sentiment_summary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      name.trim(),
      email.trim().toLowerCase(),
      company?.trim() || null,
      trimmedText,
      ratingNum,
      photoUrl,
      sentiment,
      summary
    );

  const row = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(serialize(row));
});

router.get('/', (req, res) => {
  const { status, page = '1', limit = '20' } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  let where = '';
  const params = [];

  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    where = 'WHERE status = ?';
    params.push(status);
  }

  const total = db.prepare(`SELECT COUNT(*) as count FROM testimonials ${where}`).get(...params).count;
  const rows = db
    .prepare(`SELECT * FROM testimonials ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, limitNum, offset);

  res.json({
    data: rows.map(serialize),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

router.get('/approved', (_req, res) => {
  const rows = db
    .prepare(`SELECT * FROM testimonials WHERE status = 'approved' ORDER BY created_at DESC`)
    .all();
  res.json(rows.map(serialize));
});

router.patch('/:id', (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be approved or rejected.' });
  }

  const existing = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Testimonial not found.' });
  }

  db.prepare('UPDATE testimonials SET status = ? WHERE id = ?').run(status, req.params.id);
  const row = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(req.params.id);
  res.json(serialize(row));
});

export default router;
