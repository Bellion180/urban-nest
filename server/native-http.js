import http from 'http';

console.log('🔧 Iniciando servidor HTTP nativo...');
console.log('Node version:', process.version);

const PORT = 9999;

// Error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION:', reason);
  process.exit(1);
});

const server = http.createServer((req, res) => {
  console.log(`🔍 REQUEST: ${req.method} ${req.url} - ${new Date().toISOString()}`);
  console.log(`📄 Headers:`, req.headers);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.url === '/test' && req.method === 'GET') {
    console.log('📍 Handling GET /test');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      message: 'Native HTTP server works!', 
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url
    }));
    return;
  }
  
  if (req.url.startsWith('/test/') && req.method === 'PUT') {
    console.log('📍 Handling PUT /test/:id');
    const id = req.url.split('/')[2];
    
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      console.log('ID:', id);
      console.log('Body:', body);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        message: 'Native HTTP PUT works!', 
        id: id,
        body: body,
        timestamp: new Date().toISOString()
      }));
    });
    return;
  }
  
  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Puerto ${PORT} ya está en uso`);
  }
  process.exit(1);
});

server.on('listening', () => {
  console.log('🎉 Server listening event triggered');
  const address = server.address();
  console.log('Server address:', address);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Servidor HTTP nativo corriendo en http://127.0.0.1:${PORT}`);
  console.log(`📊 Test GET: http://127.0.0.1:${PORT}/test`);
  console.log(`📊 Test PUT: http://127.0.0.1:${PORT}/test/123`);
});

console.log('📝 Script completed, servidor HTTP nativo debería estar iniciando...');
