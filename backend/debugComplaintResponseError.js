import axios from 'axios';

// Test to identify the specific 400 error
const debugComplaintResponseError = async () => {
  try {
    console.log('🔍 Debugging Complaint Response 400 Error...');
    
    // Login as admin
    const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'admin@gmail.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    
    // Get complaints
    const complaintsResponse = await axios.get('http://localhost:5000/api/admin/complaints', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const complaints = complaintsResponse.data.data.complaints;
    console.log(`📊 Found ${complaints.length} complaints`);
    
    if (complaints.length === 0) {
      console.log('ℹ️  No complaints found');
      return;
    }
    
    const testComplaint = complaints[0];
    console.log(`📝 Testing with complaint: ${testComplaint._id}`);
    
    // Test different response lengths to identify the validation issue
    const testMessages = [
      "", // Empty
      "Hi", // Too short
      "This is a test response message that should be long enough", // Valid length
    ];
    
    for (const message of testMessages) {
      console.log(`\n🧪 Testing message: "${message}" (${message.length} chars)`);
      
      try {
        const response = await axios.post(
          `http://localhost:5000/api/admin/complaints/${testComplaint._id}/response`,
          { message: message },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('✅ Success:', response.data.message);
      } catch (error) {
        console.error('❌ Error:', error.response?.data?.message || error.message);
        console.error('Status:', error.response?.status);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.response?.data || error.message);
  }
};

debugComplaintResponseError();