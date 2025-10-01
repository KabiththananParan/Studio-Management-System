// Simple Invoice System Test using built-in fetch (Node 18+)
const BASE_URL = 'http://localhost:5000';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123'
};

let authToken = '';
let testBookingId = '';

// Helper function to make authenticated requests
const authenticatedRequest = async (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
};

// Test functions
const testLogin = async () => {
  console.log('\n🔐 Testing User Login...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      authToken = data.token;
      console.log('✅ Login successful');
      console.log(`Token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      console.log('❌ Login failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return false;
  }
};

const testGetUserInvoices = async () => {
  console.log('\n📋 Testing Get User Invoices...');
  
  try {
    const response = await authenticatedRequest(`${BASE_URL}/api/user/invoices`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      const invoices = data.data.invoices;
      const stats = data.data.stats;
      
      console.log('✅ Invoices retrieved successfully');
      console.log(`📊 Stats:`);
      console.log(`   - Total Invoices: ${stats.totalInvoices}`);
      console.log(`   - Total Amount: LKR ${stats.totalAmount}`);
      console.log(`   - Paid Amount: LKR ${stats.paidAmount}`);
      console.log(`   - Pending Amount: LKR ${stats.pendingAmount}`);
      
      if (invoices.length > 0) {
        console.log(`📄 Found ${invoices.length} invoices:`);
        invoices.forEach((invoice, index) => {
          console.log(`   ${index + 1}. ${invoice.invoiceNumber}`);
          console.log(`      - Amount: ${invoice.currency} ${invoice.totalAmount}`);
          console.log(`      - Status: ${invoice.paymentStatus}`);
          console.log(`      - Customer: ${invoice.customer.name}`);
        });
      } else {
        console.log('ℹ️ No invoices found for this user');
      }
      
      return invoices;
    } else {
      console.log('❌ Failed to get invoices:', data.message);
      return [];
    }
  } catch (error) {
    console.error('❌ Get invoices error:', error.message);
    return [];
  }
};

const testInvoiceStats = async () => {
  console.log('\n📊 Testing Invoice Statistics...');
  
  try {
    const response = await authenticatedRequest(`${BASE_URL}/api/user/invoices/stats`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Invoice statistics retrieved successfully');
      console.log(`📈 Overall Stats:`);
      console.log(`   - Total Invoices: ${data.data.stats.totalInvoices}`);
      console.log(`   - Total Amount: LKR ${data.data.stats.totalAmount}`);
      console.log(`   - Paid Invoices: ${data.data.stats.paidInvoices}`);
      console.log(`   - Overdue Invoices: ${data.data.stats.overdueInvoices}`);
      
      return data.data;
    } else {
      console.log('❌ Failed to get invoice stats:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Get invoice stats error:', error.message);
    return null;
  }
};

// Main test function
const runInvoiceTests = async () => {
  console.log('🧪 Starting Invoice System Tests');
  console.log('=====================================');
  
  // Test login first
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without authentication');
    return;
  }
  
  // Test getting user invoices
  const invoices = await testGetUserInvoices();
  
  // Test invoice statistics
  await testInvoiceStats();
  
  console.log('\n🎉 Invoice System Tests Completed!');
  console.log('=====================================');
  
  if (invoices.length === 0) {
    console.log('\n💡 To see invoice functionality:');
    console.log('   1. Create a booking through the frontend');
    console.log('   2. Complete the payment process');
    console.log('   3. An invoice will be automatically generated');
    console.log('   4. Visit /invoices to view your invoices');
  }
};

// Run the tests
runInvoiceTests().catch(console.error);