// Simple test to trigger login endpoint and see debug logs
(async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      }),
    });

    const result = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
})();