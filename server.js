const express = require('express');
const app = express();

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Fitness API Test Server',
    version: '1.0.0'
  });
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}/health`);
  console.log(`🔗 http://127.0.0.1:${PORT}/health`);
});