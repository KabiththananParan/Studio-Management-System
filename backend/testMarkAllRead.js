import axios from 'axios';

// Test the mark-all-read endpoint specifically
const testMarkAllRead = async () => {
  try {
    console.log('🧪 Testing Mark All Read Endpoint...');
    
    // Step 1: Login as admin
    const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'admin@gmail.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    
    // Step 2: Get notifications
    const notificationsResponse = await axios.get('http://localhost:5000/api/admin/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const unreadNotifications = notificationsResponse.data.notifications.filter(n => !n.isRead);
    console.log(`📊 Found ${unreadNotifications.length} unread notifications`);
    
    if (unreadNotifications.length === 0) {
      console.log('ℹ️  No unread notifications to test with');
      return;
    }
    
    const notificationIds = unreadNotifications.map(n => n.id);
    console.log('📋 Notification IDs to mark as read:', notificationIds);
    
    // Step 3: Test mark all as read
    console.log('\n📝 Testing mark-all-read endpoint...');
    const response = await axios.put('http://localhost:5000/api/admin/notifications/mark-all-read', {
      notificationIds: notificationIds
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Mark all as read successful:', response.data.message);
    
    // Step 4: Verify they were marked
    const verifyResponse = await axios.get('http://localhost:5000/api/admin/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`📊 Unread count after marking: ${verifyResponse.data.counts.total}`);
    
  } catch (error) {
    console.error('❌ Error testing mark all read:', error.response?.data || error.message);
    if (error.response?.status === 500) {
      console.error('🔍 Server Error Details:', error.response?.data);
    }
  }
};

testMarkAllRead();