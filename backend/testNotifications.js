import axios from 'axios';

// Test admin notifications API
const testNotifications = async () => {
  try {
    console.log('Testing Admin Notifications API...');
    
    // First, try to login as admin to get a token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'admin@gmail.com', // Update with actual admin credentials
      password: 'admin123'
    });
    
    console.log('✅ Admin login successful');
    const token = loginResponse.data.token;
    
    // Test notifications endpoint
    const notificationsResponse = await axios.get('http://localhost:5000/api/admin/notifications', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Notifications API working');
    console.log('📊 Notification Stats:', notificationsResponse.data.counts);
    console.log('📢 Total Notifications:', notificationsResponse.data.notifications.length);
    
    // Show first few notifications
    if (notificationsResponse.data.notifications.length > 0) {
      console.log('\n📋 Sample Notifications:');
      notificationsResponse.data.notifications.slice(0, 3).forEach((notification, index) => {
        console.log(`${index + 1}. ${notification.title} - ${notification.message}`);
      });
    } else {
      console.log('ℹ️  No notifications found (this is normal for a fresh system)');
    }
    
  } catch (error) {
    console.error('❌ Error testing notifications:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 400 && error.response?.data?.message === 'Invalid credentials') {
      console.log('ℹ️  Please update the admin credentials in this test file');
      console.log('ℹ️  Or create an admin using the createAdmin.js script');
    }
  }
};

testNotifications();