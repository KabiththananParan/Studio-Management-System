import axios from 'axios';

// Test marking individual notifications as read
const testIndividualMarkRead = async () => {
  try {
    console.log('🧪 Testing Individual Mark as Read...');
    
    // Login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'admin@gmail.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    
    // Get notifications
    const notificationsResponse = await axios.get('http://localhost:5000/api/admin/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const unreadNotifications = notificationsResponse.data.notifications.filter(n => !n.isRead);
    console.log(`📊 Found ${unreadNotifications.length} unread notifications`);
    
    if (unreadNotifications.length === 0) {
      console.log('ℹ️  No unread notifications to test with');
      return;
    }
    
    // Try to mark the first unread notification as read
    const testNotification = unreadNotifications[0];
    console.log(`📝 Testing with notification: ${testNotification.id}`);
    console.log(`📋 Notification title: ${testNotification.title}`);
    
    const response = await axios.put(`http://localhost:5000/api/admin/notifications/${testNotification.id}/read`, {}, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Individual mark as read successful:', response.data.message);
    
    // Verify it was marked as read
    const verifyResponse = await axios.get('http://localhost:5000/api/admin/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const updatedNotification = verifyResponse.data.notifications.find(n => n.id === testNotification.id);
    console.log(`✅ Notification read status: ${updatedNotification?.isRead ? 'READ' : 'UNREAD'}`);
    console.log(`📊 Total unread count: ${verifyResponse.data.counts.total}`);
    
  } catch (error) {
    console.error('❌ Error testing individual mark as read:', error.response?.data || error.message);
    if (error.response?.status === 500) {
      console.error('🔍 Server Error Details:', error.response?.data);
    }
  }
};

testIndividualMarkRead();