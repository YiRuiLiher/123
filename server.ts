import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';

// Use a data directory for persistence
const DATA_DIR = path.join(process.cwd(), 'data');
const VIDEOS_JSON_PATH = path.join(DATA_DIR, 'videos.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const TEMP_DIR = path.join(process.cwd(), 'tmp_uploads');

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.mkdir(TEMP_DIR, { recursive: true });
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

const chunkUpload = multer({ dest: TEMP_DIR });

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

  // API to upload video chunks
  app.post('/api/upload-chunk', chunkUpload.single('chunk'), async (req, res) => {
    try {
      const { fileIdentifier, chunkIndex } = req.body;
      const chunkFile = req.file;

      if (!chunkFile) {
        return res.status(400).json({ error: 'No chunk file uploaded' });
      }

      const chunkDir = path.join(TEMP_DIR, fileIdentifier);
      await fs.mkdir(chunkDir, { recursive: true });
      
      const targetPath = path.join(chunkDir, chunkIndex.toString());
      await fs.rename(chunkFile.path, targetPath);

      res.json({ success: true });
    } catch (err) {
      console.error('Chunk upload error:', err);
      res.status(500).json({ error: 'Chunk upload failed' });
    }
  });

  // API to complete chunked upload and save video info
  app.post('/api/upload-complete', async (req, res) => {
    try {
      const { fileIdentifier, totalChunks, originalName, title, description, categoryId } = req.body;
      const chunkDir = path.join(TEMP_DIR, fileIdentifier);
      
      const ext = path.extname(originalName);
      const basename = path.basename(originalName, ext);
      const safeName = basename.replace(/[^a-zA-Z0-9_-]/g, '_');
      const finalFilename = `${safeName}-${Date.now()}${ext}`;
      const finalPath = path.join(UPLOADS_DIR, finalFilename);

      // Merge chunks
      for (let i = 0; i < totalChunks; i++) {
        const chunkPath = path.join(chunkDir, i.toString());
        const chunkData = await fs.readFile(chunkPath);
        await fs.appendFile(finalPath, chunkData);
        await fs.unlink(chunkPath);
      }
      await fs.rm(chunkDir, { recursive: true, force: true });

      // Update JSON
      const newVideo = {
        title: title || safeName,
        url: `/uploads/${finalFilename}`,
        categoryId: categoryId || 'lifestyle',
        author: 'Admin',
        description: description || '',
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
      console.error('Merge error:', err);
      res.status(500).json({ error: 'Upload merge failed' });
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
