import axios from 'axios';

// Test adding complaint response
const testComplaintResponse = async () => {
  try {
    console.log('🧪 Testing Complaint Response Functionality...');
    
    // Step 1: Login as admin
    const loginResponse = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'admin@gmail.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    
    // Step 2: Get complaints list
    const complaintsResponse = await axios.get('http://localhost:5000/api/admin/complaints', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const complaints = complaintsResponse.data.data.complaints;
    console.log(`📊 Found ${complaints.length} complaints`);
    
    if (complaints.length === 0) {
      console.log('ℹ️  No complaints found to test with');
      return;
    }
    
    // Step 3: Pick the first complaint
    const testComplaint = complaints[0];
    console.log(`📝 Testing with complaint: ${testComplaint._id}`);
    console.log(`📋 Complaint title: ${testComplaint.title}`);
    console.log(`📋 Current status: ${testComplaint.status}`);
    
    // Step 4: Try to add a response
    const responseMessage = `Test response from admin - ${new Date().toISOString()}`;
    console.log(`💬 Adding response: "${responseMessage}"`);
    
    const addResponseResult = await axios.post(
      `http://localhost:5000/api/admin/complaints/${testComplaint._id}/response`,
      { message: responseMessage },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Response added successfully:', addResponseResult.data.message);
    console.log(`📊 Updated status: ${addResponseResult.data.data.status}`);
    console.log(`💬 Admin response: ${addResponseResult.data.data.adminResponse?.message}`);
    
  } catch (error) {
    console.error('❌ Error testing complaint response:', error.response?.data || error.message);
    if (error.response?.status === 500) {
      console.error('🔍 Server Error Details:', error.response?.data);
    }
    if (error.response?.status === 400) {
      console.error('🔍 Validation Error:', error.response?.data?.message);
    }
  }
};

testComplaintResponse();