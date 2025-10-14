import axios from 'axios';

// Test the fixed admin endpoints
const testAdminEndpoints = async () => {
  try {
    console.log('🧪 Testing Admin Endpoints...');
    
    // Login as admin
    const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'admin@gmail.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    
    // Test fetching all users
    console.log('\n📝 Testing /api/admin/users endpoint...');
    try {
      const usersResponse = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Users endpoint response structure:', Object.keys(usersResponse.data));
      console.log(`📊 Found ${usersResponse.data.users?.length || 0} users`);
    } catch (error) {
      console.error('❌ Users endpoint error:', error.response?.data || error.message);
    }
    
    // Test fetching admins
    console.log('\n📝 Testing /api/admin/users/admins endpoint...');
    try {
      const adminsResponse = await axios.get('http://localhost:5000/api/admin/users/admins', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Admins endpoint response structure:', Object.keys(adminsResponse.data));
      console.log(`📊 Found ${adminsResponse.data.data?.admins?.length || 0} admins`);
      
      if (adminsResponse.data.data?.admins?.length > 0) {
        console.log('👤 First admin:', adminsResponse.data.data.admins[0]);
      }
    } catch (error) {
      console.error('❌ Admins endpoint error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.response?.data || error.message);
  }
};

testAdminEndpoints();