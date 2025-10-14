import axios from 'axios';

// Test notification persistence across admin sessions
const testNotificationPersistence = async () => {
  try {
    console.log('🧪 Testing Notification Persistence...');
    
    // Step 1: Login as admin
    console.log('\n📝 Step 1: Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'admin@gmail.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    
    // Step 2: Get initial notifications
    console.log('\n📝 Step 2: Fetching initial notifications...');
    const initialResponse = await axios.get('http://localhost:5000/api/admin/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`📊 Initial notification count: ${initialResponse.data.counts.total}`);
    console.log(`📋 Total notifications available: ${initialResponse.data.notifications.length}`);
    
    if (initialResponse.data.notifications.length === 0) {
      console.log('ℹ️  No notifications to test with. Please create some test data first.');
      return;
    }
    
    // Step 3: Mark some notifications as read
    const unreadNotifications = initialResponse.data.notifications.filter(n => !n.isRead);
    if (unreadNotifications.length === 0) {
      console.log('ℹ️  All notifications are already marked as read.');
      return;
    }
    
    console.log(`\n📝 Step 3: Marking ${Math.min(3, unreadNotifications.length)} notifications as read...`);
    const notificationsToMark = unreadNotifications.slice(0, 3);
    
    for (const notification of notificationsToMark) {
      await axios.put(`http://localhost:5000/api/admin/notifications/${notification.id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Marked notification "${notification.title}" as read`);
    }
    
    // Step 4: Verify the notifications are marked as read
    console.log('\n📝 Step 4: Verifying notifications are marked as read...');
    const afterReadResponse = await axios.get('http://localhost:5000/api/admin/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const newUnreadCount = afterReadResponse.data.counts.total;
    console.log(`📊 Unread notifications after marking: ${newUnreadCount}`);
    
    // Step 5: Simulate logout/login by getting a new token
    console.log('\n📝 Step 5: Simulating logout and login again...');
    const secondLoginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'admin@gmail.com',
      password: 'admin123'
    });
    
    const newToken = secondLoginResponse.data.token;
    console.log('✅ Admin re-login successful');
    
    // Step 6: Check if read status persists
    console.log('\n📝 Step 6: Checking if read status persists after re-login...');
    const persistenceResponse = await axios.get('http://localhost:5000/api/admin/notifications', {
      headers: { Authorization: `Bearer ${newToken}` }
    });
    
    const finalUnreadCount = persistenceResponse.data.counts.total;
    console.log(`📊 Unread notifications after re-login: ${finalUnreadCount}`);
    
    // Step 7: Verify persistence
    if (finalUnreadCount === newUnreadCount) {
      console.log('\n🎉 SUCCESS: Notification read status persists across sessions!');
      console.log(`✅ Read notifications remain marked as read after logout/login`);
    } else {
      console.log('\n❌ FAILURE: Notification read status did not persist');
      console.log(`Expected: ${newUnreadCount}, Got: ${finalUnreadCount}`);
    }
    
    // Step 8: Show some details
    console.log('\n📋 Final notification details:');
    persistenceResponse.data.notifications.slice(0, 5).forEach((notification, index) => {
      console.log(`${index + 1}. ${notification.title} - ${notification.isRead ? '✅ Read' : '🔔 Unread'}`);
    });
    
  } catch (error) {
    console.error('❌ Error testing notification persistence:', error.response?.data?.message || error.message);
  }
};

testNotificationPersistence();