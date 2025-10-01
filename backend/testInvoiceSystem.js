// Test Invoice System
import fetch from 'node-fetch';

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

const testGetBookings = async () => {
  console.log('\n📅 Testing Get Bookings...');
  
  try {
    const response = await authenticatedRequest(`${BASE_URL}/api/user/bookings`);
    const data = await response.json();
    
    if (response.ok) {
      const bookings = data.bookings || data;
      console.log(`✅ Found ${bookings.length} bookings`);
      
      if (bookings.length > 0) {
        testBookingId = bookings[0]._id;
        console.log(`📝 Using booking ID: ${testBookingId}`);
        
        // Show booking details
        const booking = bookings[0];
        console.log(`   - Package: ${booking.package?.name || 'N/A'}`);
        console.log(`   - Amount: $${booking.totalAmount}`);
        console.log(`   - Status: ${booking.bookingStatus}`);
        console.log(`   - Customer: ${booking.customerInfo?.name}`);
      }
      
      return bookings;
    } else {
      console.log('❌ Failed to get bookings:', data.message);
      return [];
    }
  } catch (error) {
    console.error('❌ Get bookings error:', error.message);
    return [];
  }
};

const testCreateInvoiceFromBooking = async () => {
  console.log('\n📄 Testing Create Invoice from Booking...');
  
  if (!testBookingId) {
    console.log('❌ No booking ID available for invoice creation');
    return null;
  }
  
  try {
    const response = await authenticatedRequest(`${BASE_URL}/api/user/invoices/create-from-booking`, {
      method: 'POST',
      body: JSON.stringify({ bookingId: testBookingId })
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Invoice created successfully');
      console.log(`📄 Invoice Number: ${data.data.invoiceNumber}`);
      console.log(`💰 Amount: ${data.data.currency} ${data.data.totalAmount}`);
      console.log(`📅 Issue Date: ${new Date(data.data.issueDate).toLocaleDateString()}`);
      console.log(`📅 Due Date: ${new Date(data.data.dueDate).toLocaleDateString()}`);
      return data.data;
    } else {
      console.log('ℹ️ Invoice creation result:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Create invoice error:', error.message);
    return null;
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

const testGetInvoiceById = async (invoices) => {
  if (!invoices || invoices.length === 0) {
    console.log('\n⏭️ Skipping invoice details test (no invoices available)');
    return;
  }
  
  console.log('\n🔍 Testing Get Invoice Details...');
  
  const invoiceId = invoices[0]._id;
  
  try {
    const response = await authenticatedRequest(`${BASE_URL}/api/user/invoices/${invoiceId}`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      const invoice = data.data;
      console.log('✅ Invoice details retrieved successfully');
      console.log(`📄 Invoice: ${invoice.invoiceNumber}`);
      console.log(`👤 Customer: ${invoice.customer.name} (${invoice.customer.email})`);
      console.log(`💰 Total Amount: ${invoice.currency} ${invoice.totalAmount}`);
      console.log(`💳 Payment Status: ${invoice.paymentStatus}`);
      console.log(`📋 Status: ${invoice.status}`);
      
      if (invoice.items && invoice.items.length > 0) {
        console.log(`🛍️ Items:`);
        invoice.items.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.description}`);
          console.log(`      - Quantity: ${item.quantity}`);
          console.log(`      - Unit Price: ${invoice.currency} ${item.unitPrice}`);
          console.log(`      - Total: ${invoice.currency} ${item.total}`);
        });
      }
      
      if (invoice.booking) {
        console.log(`📅 Related Booking: ${new Date(invoice.booking.date).toLocaleDateString()}`);
      }
      
      return invoice;
    } else {
      console.log('❌ Failed to get invoice details:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Get invoice details error:', error.message);
    return null;
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
      
      if (data.data.recentInvoices.length > 0) {
        console.log(`📄 Recent Invoices (${data.data.recentInvoices.length}):`);
        data.data.recentInvoices.forEach(invoice => {
          console.log(`   - ${invoice.invoiceNumber}: LKR ${invoice.totalAmount} (${invoice.paymentStatus})`);
        });
      }
      
      if (data.data.overdueInvoices.length > 0) {
        console.log(`⚠️ Overdue Invoices (${data.data.overdueInvoices.length}):`);
        data.data.overdueInvoices.forEach(invoice => {
          console.log(`   - ${invoice.invoiceNumber}: LKR ${invoice.balanceAmount} balance`);
        });
      }
      
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
  
  // Test getting bookings (needed for invoice creation)
  const bookings = await testGetBookings();
  
  // Test creating invoice from booking
  const newInvoice = await testCreateInvoiceFromBooking();
  
  // Test getting user invoices
  const invoices = await testGetUserInvoices();
  
  // Test getting invoice by ID
  await testGetInvoiceById(invoices);
  
  // Test invoice statistics
  await testInvoiceStats();
  
  console.log('\n🎉 Invoice System Tests Completed!');
  console.log('=====================================');
};

// Run the tests
runInvoiceTests().catch(console.error);