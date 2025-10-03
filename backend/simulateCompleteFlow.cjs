const axios = require('axios');

async function simulateCompleteFlow() {
  try {
    console.log('🌐 Simulating Complete Frontend Flow...\n');
    
    // Clear any existing tokens (simulate fresh browser)
    console.log('🧹 Starting with clean slate (no tokens)...\n');
    
    // Step 1: Simulate AdminLogin.jsx behavior
    console.log('1️⃣ AdminLogin.jsx - Login Process...');
    
    const loginRes = await axios.post("http://localhost:5000/api/auth/admin/login", {
      email: 'admin@gmail.com', 
      password: 'admin123'
    }, {
      withCredentials: true
    });
    
    console.log('Login Status:', loginRes.status);
    const adminToken = loginRes.data.token;
    console.log('Token received:', adminToken ? 'Yes' : 'No');
    
    // Simulate setAuthToken(res.data.token, true) in AdminLogin.jsx
    console.log('Simulating localStorage.setItem("adminToken", token)...');
    
    // Step 2: Simulate AuthContext verification (what causes the 403)
    console.log('\n2️⃣ AuthContext - Admin Verification...');
    console.log('Simulating checkAuthStatus(true) call...');
    
    // This is what the auth.js checkAuthStatus function does
    const verifyHeaders = {
      'Content-Type': 'application/json'
    };
    
    // Add token from localStorage (this is what getAuthToken() returns)
    if (adminToken) {
      verifyHeaders.Authorization = `Bearer ${adminToken}`;
    }
    
    const verifyRes = await axios.get('http://localhost:5000/api/auth/admin/verify', {
      headers: verifyHeaders,
      withCredentials: true,
      validateStatus: function (status) {
        return status < 500;
      }
    });
    
    console.log('Auth verify status:', verifyRes.status);
    if (verifyRes.status !== 200) {
      console.log('❌ This is causing the 403 in AuthContext!');
      console.log('Error:', verifyRes.data);
    } else {
      console.log('✅ Auth verification successful');
    }
    
    // Step 3: Simulate AdminDashboard.jsx stats request
    console.log('\n3️⃣ AdminDashboard.jsx - Dashboard Stats...');
    
    const statsRes = await axios.get("http://localhost:5000/api/admin/dashboard/stats", {
      headers: { 
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json"
      },
      withCredentials: true,
      validateStatus: function (status) {
        return status < 500;
      }
    });
    
    console.log('Dashboard stats status:', statsRes.status);
    if (statsRes.status !== 200) {
      console.log('❌ This is causing the 403 in AdminDashboard!');
      console.log('Error:', statsRes.data);
    } else {
      console.log('✅ Dashboard stats successful');
    }
    
    // Summary
    console.log('\n📋 SUMMARY:');
    console.log('Login:', loginRes.status === 200 ? '✅' : '❌');
    console.log('Auth Verify:', verifyRes.status === 200 ? '✅' : '❌');
    console.log('Dashboard Stats:', statsRes.status === 200 ? '✅' : '❌');
    
    if (verifyRes.status === 200 && statsRes.status === 200) {
      console.log('\n🎉 All endpoints work! Issue must be in frontend state management.');
    } else {
      console.log('\n🚨 Found the problematic endpoint(s)!');
    }
    
  } catch (error) {
    console.error('\n💥 Flow Simulation Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

simulateCompleteFlow();