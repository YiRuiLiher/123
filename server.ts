import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';

// Use a data directory for persistence
const DATA_DIR = path.join(process.cwd(), 'data');
const VIDEOS_JSON_PATH = path.join(DATA_DIR, 'videos.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  try {
    await fs.access(VIDEOS_JSON_PATH);
  } catch {
    await fs.writeFile(VIDEOS_JSON_PATH, JSON.stringify([]));
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    // Sanitize filename to avoid weird characters
    const safeName = basename.replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${safeName}-${Date.now()}${ext}`)
  }
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 } // 2GB
});

async function startServer() {
  await ensureDirs();

  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2gb' }));
  app.use(express.urlencoded({ limit: '2gb', extended: true }));

  // API to get videos
  app.get('/api/videos', async (req, res) => {
    try {
      const data = await fs.readFile(VIDEOS_JSON_PATH, 'utf-8');
      if (!data || data.trim() === '') {
        return res.json([]);
      }
      res.json(JSON.parse(data));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to read videos' });
    }
  });

  // API to upload video and update JSON
  app.post('/api/upload-video', upload.single('videoFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No video file uploaded' });
      }

      // Get parameters from form-data
      const title = req.file.originalname.replace(path.extname(req.file.originalname), '');
      const description = req.body.description || '';
      const categoryId = req.body.categoryId || 'lifestyle';
      
      const newVideo = {
        title,
        url: `/uploads/${req.file.filename}`,
        categoryId,
        author: 'Admin',
        description,
        descriptionImages: []
      };

      const data = await fs.readFile(VIDEOS_JSON_PATH, 'utf-8');
      let videos = [];
      if (data && data.trim() !== '') {
        try {
          videos = JSON.parse(data);
        } catch (e) {
          videos = [];
        }
      }
      videos.push(newVideo);
      
      await fs.writeFile(VIDEOS_JSON_PATH, JSON.stringify(videos, null, 2));

      res.json({ success: true, video: newVideo });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Fallback for SPA routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
