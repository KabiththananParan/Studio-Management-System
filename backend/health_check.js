// Simple health check
(async () => {
  try {
    const response = await fetch('http://localhost:5000/');
    const result = await response.text();
    console.log('Health check - Status:', response.status);
    console.log('Response:', result);
  } catch (error) {
    console.error('Health check failed:', error.message);
  }
})();