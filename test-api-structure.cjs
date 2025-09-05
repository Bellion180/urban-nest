const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/residents',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const residents = JSON.parse(data);
      console.log('API Response Structure:');
      if (residents.length > 0) {
        console.log('First resident structure:');
        console.log(JSON.stringify(residents[0], null, 2));
      } else {
        console.log('No residents found');
      }
    } catch (error) {
      console.error('Error parsing response:', error);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();
