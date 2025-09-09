const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'Servidor HTTP básico funcionando',
    timestamp: new Date().toISOString(),
    url: req.url
  }));
});

server.listen(3003, 'localhost', () => {
  console.log('🚀 Servidor HTTP básico funcionando en http://localhost:3003');
});

server.on('error', (err) => {
  console.error('❌ Error del servidor:', err);
});
