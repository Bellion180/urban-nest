import express from 'express';
import cors from 'cors';
import multer from 'multer';

const app = express();
const PORT = 3001;

// Configurar multer para manejar archivos
const upload = multer({ dest: 'uploads/' });

// Middlewares básicos
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de todas las peticiones
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

// Health check simple
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint hit');
  res.json({ 
    status: 'ok',
    message: 'Debug server funcionando', 
    timestamp: new Date().toISOString()
  });
});

// Test endpoint con soporte para FormData
app.post('/api/buildings', upload.single('image'), (req, res) => {
  console.log('=== POST /api/buildings ===');
  console.log('Body recibido:', req.body);
  console.log('File recibido:', req.file);
  console.log('Content-Type:', req.headers['content-type']);
  
  res.json({
    message: 'Test endpoint funcionando',
    body: req.body,
    file: req.file ? { 
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size 
    } : null
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Debug server corriendo en http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
