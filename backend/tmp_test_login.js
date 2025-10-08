// Use global fetch (Node 18+) so the script works without installing node-fetch
(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'john@gmail.com', password: 'password123' }),
    });

    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', text);
  } catch (err) {
    console.error('Request error:', err.message);
  }
})();
