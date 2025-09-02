const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3003;

console.log('🔧 Starting simple CommonJS server...');

app.use(cors());

// Logging middleware - DEBE ejecutarse
app.use((req, res, next) => {
  console.log(`\n🔍 LOG: ${req.method} ${req.url}`);
  console.log(`Time:`, new Date().toISOString());
  next();
});

app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  console.log('📍 Inside /test GET handler');
  res.json({ message: 'CommonJS server works', timestamp: new Date().toISOString() });
});

app.put('/test/:id', (req, res) => {
  console.log('📍 Inside /test/:id PUT handler');
  console.log('ID:', req.params.id);
  console.log('Body:', req.body);
  res.json({ 
    message: 'CommonJS PUT works', 
    id: req.params.id, 
    body: req.body 
  });
});

app.listen(PORT, () => {
  console.log(`✅ CommonJS server running on http://localhost:${PORT}`);
});
