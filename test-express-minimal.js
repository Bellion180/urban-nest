import express from 'express';

// Test a minimal express app with the same route registration pattern
const app = express();
const PORT = 3002; // Use different port

app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Create simple test routes - mimic companeros.js structure
const testRouter = express.Router();

testRouter.get('/', (req, res) => {
  console.log('✅ Test router root hit');
  res.json({ message: 'Test router works' });
});

testRouter.get('/test', (req, res) => {
  console.log('✅ Test router /test hit');
  res.json({ message: 'Test router /test works' });
});

// Register the route the same way as companeros
app.use('/api/test-companeros', testRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🔍 Test server running on port ${PORT}`);
  console.log('Test routes:');
  console.log(`- http://localhost:${PORT}/api/test-companeros`);
  console.log(`- http://localhost:${PORT}/api/test-companeros/test`);
});

export { testRouter };
