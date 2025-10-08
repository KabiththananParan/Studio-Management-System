// Simple server status check using built-in modules
import http from 'http';

const checkServer = () => {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log('✅ Server is accessible!');
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      console.log('\n🎯 Server is running properly. Now test the frontend:');
      console.log('1. Open http://localhost:5173 in your browser');
      console.log('2. Login with: admin@gmail.com / admin123');
      console.log('3. Go to Admin Dashboard > Inventory Management');
      console.log('4. Try editing any item and check browser console for debug logs');
    });
  });

  req.on('error', (err) => {
    console.log('❌ Cannot connect to server:', err.message);
    console.log('Make sure the backend server is running on port 5000');
  });

  req.end();
};

checkServer();