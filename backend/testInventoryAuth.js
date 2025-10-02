// Test script to verify authentication and inventory API
const testAuth = async () => {
  const baseURL = 'http://localhost:5000';
  
  console.log('🔍 Testing Authentication and Inventory API...\n');
  
  try {
    // Test 1: Login with test user
    console.log('1️⃣ Testing login with john@gmail.com...');
    const loginResponse = await fetch(`${baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john@gmail.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginData);
      return;
    }
    
    console.log('✅ Login successful!');
    console.log('Token:', loginData.token.substring(0, 30) + '...');
    
    // Test 2: Test non-auth endpoint
    console.log('\n2️⃣ Testing non-auth inventory endpoint...');
    const testResponse = await fetch(`${baseURL}/api/user/inventory-bookings/test-available`);
    const testData = await testResponse.json();
    
    if (testResponse.ok) {
      console.log('✅ Test endpoint working:', testData.items?.length || 0, 'items');
      console.log('Test response structure:', Object.keys(testData));
    } else {
      console.log('❌ Test endpoint failed:', testData);
    }
    
    // Test 3: Test auth inventory endpoint
    console.log('\n3️⃣ Testing authenticated inventory endpoint...');
    const authResponse = await fetch(`${baseURL}/api/user/inventory-bookings/available`, {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    const authData = await authResponse.json();
    
    if (authResponse.ok) {
      console.log('✅ Auth endpoint working:', authData.data?.items?.length || 0, 'items');
      console.log('Response structure:', Object.keys(authData));
      if (authData.data) {
        console.log('Data structure:', Object.keys(authData.data));
      }
    } else {
      console.log('❌ Auth endpoint failed:');
      console.log('Status:', authResponse.status);
      console.log('Response:', authData);
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
};

testAuth();