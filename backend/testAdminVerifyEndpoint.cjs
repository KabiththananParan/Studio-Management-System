const axios = require('axios');

async function testAdminVerifyEndpoint() {
  try {
    console.log('🔍 Testing Admin Verify Endpoint...\n');
    
    // Step 1: Login as admin to get token
    console.log('1️⃣ Admin Login...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'admin@gmail.com',
      password: 'admin123'
    }, {
      withCredentials: true
    });
    
    console.log('✅ Login successful');
    const token = loginRes.data.token;
    const cookies = loginRes.headers['set-cookie'];
    console.log('Token received:', token ? 'Yes' : 'No');
    console.log('Cookie received:', cookies ? 'Yes' : 'No');
    
    // Step 2: Test /api/auth/admin/verify endpoint
    console.log('\n2️⃣ Testing Admin Verify Endpoint...');
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    if (cookies) {
      headers.Cookie = cookies[0];
    }
    
    console.log('Request headers:', Object.keys(headers));
    
    const verifyRes = await axios.get('http://localhost:5000/api/auth/admin/verify', {
      headers,
      withCredentials: true,
      validateStatus: function (status) {
        return status < 500;
      }
    });
    
    console.log('Verify response status:', verifyRes.status);
    console.log('Verify response data:', verifyRes.data);
    
    if (verifyRes.status === 200) {
      console.log('✅ Admin verify endpoint works!');
    } else {
      console.log('❌ Admin verify endpoint failed');
    }
    
    // Step 3: Test dashboard stats endpoint  
    console.log('\n3️⃣ Testing Dashboard Stats Endpoint...');
    
    const statsRes = await axios.get('http://localhost:5000/api/admin/dashboard/stats', {
      headers,
      withCredentials: true,
      validateStatus: function (status) {
        return status < 500;
      }
    });
    
    console.log('Dashboard stats status:', statsRes.status);
    
    if (statsRes.status === 200) {
      console.log('✅ Dashboard stats endpoint works!');
      console.log('Sample data:', {
        users: statsRes.data.users?.total,
        packages: statsRes.data.packages?.total
      });
    } else {
      console.log('❌ Dashboard stats failed');
      console.log('Error:', statsRes.data);
    }
    
  } catch (error) {
    console.error('\n💥 Test Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAdminVerifyEndpoint();