import axios from 'axios';

// Minimal test for mark-all-read
const testSimple = async () => {
  try {
    // Login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'admin@gmail.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Logged in');
    
    // Test with empty array first
    console.log('Testing with empty array...');
    const emptyResponse = await axios.put('http://localhost:5000/api/admin/notifications/mark-all-read', {
      notificationIds: []
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Empty array test passed:', emptyResponse.data);
    
    // Test with one notification ID
    console.log('Testing with one notification ID...');
    const singleResponse = await axios.put('http://localhost:5000/api/admin/notifications/mark-all-read', {
      notificationIds: ['user_test123']
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Single ID test passed:', singleResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Request config:', error.config?.data);
  }
};

testSimple();