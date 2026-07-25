import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import testimonialsRouter from './routes/testimonials.js';
import { uploadsDir } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));
app.use('/api/testimonials', testimonialsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/embed', express.static(path.join(__dirname, '..', '..', 'embed')));

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
