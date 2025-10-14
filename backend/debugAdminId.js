import axios from 'axios';

// Debug admin ID consistency
const debugAdminId = async () => {
  try {
    // Login and get token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'admin@gmail.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Logged in successfully');
    
    // Decode token to see admin ID
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('🔍 Token payload admin ID:', payload.id);
    console.log('🔍 Token payload role:', payload.role);
    
    // Get notifications and see what admin ID is being used
    const notificationsResponse = await axios.get('http://localhost:5000/api/admin/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📊 Notification counts:', notificationsResponse.data.counts);
    console.log('📋 Total notifications returned:', notificationsResponse.data.notifications.length);
    
    // Check a few notification read statuses
    const sampleNotifications = notificationsResponse.data.notifications.slice(0, 3);
    sampleNotifications.forEach((notification, index) => {
      console.log(`${index + 1}. ${notification.id} - Read: ${notification.isRead}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

debugAdminId();