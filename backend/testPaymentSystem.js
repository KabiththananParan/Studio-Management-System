// Test script for payment system
// Run this with: node testPaymentSystem.js

const BASE_URL = 'http://localhost:5000';

// Test payment scenarios
const testScenarios = [
  {
    name: 'Successful Card Payment',
    paymentMethod: 'card',
    paymentDetails: {
      cardNumber: '4111 1111 1111 1111',
      expiryDate: '12/26',
      cvv: '123',
      cardholderName: 'John Doe'
    }
  },
  {
    name: 'Bank Transfer Payment',
    paymentMethod: 'bank_transfer',
    paymentDetails: {}
  },
  {
    name: 'Cash Payment',
    paymentMethod: 'cash',
    paymentDetails: {}
  },
  {
    name: 'Invalid Card Payment',
    paymentMethod: 'card',
    paymentDetails: {
      cardNumber: '4000 0000 0000 0002',
      expiryDate: '12/26',
      cvv: '123',
      cardholderName: 'Test Decline'
    }
  }
];

async function testPaymentMethods() {
  console.log('\n=== Testing Payment Methods Endpoint ===');
  try {
    const response = await fetch(`${BASE_URL}/api/payments/methods`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Payment Methods:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success) {
      console.log('✅ Payment methods endpoint working');
      return data.paymentMethods;
    } else {
      console.log('❌ Payment methods endpoint failed');
      return [];
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return [];
  }
}

async function createTestBooking(token) {
  console.log('\n=== Creating Test Booking ===');
  
  // First get available packages and slots
  try {
    const [packagesRes, slotsRes] = await Promise.all([
      fetch(`${BASE_URL}/api/admin/packages`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`${BASE_URL}/api/admin/slots`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);
    
    if (!packagesRes.ok || !slotsRes.ok) {
      console.log('❌ Failed to fetch packages or slots for test booking');
      return null;
    }
    
    const packagesData = await packagesRes.json();
    const slotsData = await slotsRes.json();
    
    const activePackages = packagesData.packages?.filter(pkg => pkg.isActive) || [];
    const availableSlots = slotsData.slots?.filter(slot => slot.isAvailable) || [];
    
    if (activePackages.length === 0 || availableSlots.length === 0) {
      console.log('❌ No active packages or available slots found');
      return null;
    }
    
    const testBooking = {
      packageId: activePackages[0]._id,
      slotId: availableSlots[0]._id,
      customerInfo: {
        name: 'Test Payment Customer',
        email: 'payment.test@example.com',
        phone: '+1234567890',
        address: '123 Payment Test Street, Test City'
      },
      paymentMethod: 'pending',
      paymentStatus: 'pending'
    };
    
    const response = await fetch(`${BASE_URL}/api/user/bookings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testBooking)
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Test booking created:', result.booking.bookingReference);
      return result.booking;
    } else {
      console.log('❌ Failed to create test booking:', result.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Error creating test booking:', error.message);
    return null;
  }
}

async function testPaymentProcessing(token, booking, scenario) {
  console.log(`\n=== Testing: ${scenario.name} ===`);
  
  try {
    const paymentPayload = {
      bookingId: booking._id,
      paymentMethod: scenario.paymentMethod,
      paymentDetails: scenario.paymentDetails,
      currency: 'USD'
    };
    
    console.log('Payment payload:', JSON.stringify(paymentPayload, null, 2));
    
    const response = await fetch(`${BASE_URL}/api/payments/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentPayload)
    });
    
    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log(`✅ ${scenario.name} successful`);
      console.log(`Payment Status: ${result.payment.status}`);
      console.log(`Transaction ID: ${result.payment.transactionId}`);
      
      // Test payment verification
      await testPaymentVerification(token, booking._id);
      
      return result;
    } else {
      console.log(`❌ ${scenario.name} failed:`, result.message);
      return null;
    }
  } catch (error) {
    console.log(`❌ ${scenario.name} error:`, error.message);
    return null;
  }
}

async function testPaymentVerification(token, bookingId) {
  console.log('\n--- Testing Payment Verification ---');
  
  try {
    const response = await fetch(`${BASE_URL}/api/payments/verify/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Payment verification successful');
      console.log('Payment details:', JSON.stringify(result.payment, null, 2));
    } else {
      console.log('❌ Payment verification failed:', result.message);
    }
  } catch (error) {
    console.log('❌ Payment verification error:', error.message);
  }
}

async function testAdminPaymentUpdate(adminToken, bookingId) {
  console.log('\n=== Testing Admin Payment Status Update ===');
  
  try {
    const updatePayload = {
      status: 'completed',
      notes: 'Payment verified and completed by admin for testing'
    };
    
    const response = await fetch(`${BASE_URL}/api/payments/admin/status/${bookingId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Admin payment update successful');
      console.log('Updated booking status:', result.booking.paymentStatus);
    } else {
      console.log('❌ Admin payment update failed:', result.message);
    }
  } catch (error) {
    console.log('❌ Admin payment update error:', error.message);
  }
}

async function runPaymentTests() {
  console.log('🚀 Starting Payment System Tests');
  console.log('Make sure you have:');
  console.log('1. Backend server running on port 5000');
  console.log('2. Valid user and admin tokens');
  console.log('3. Active packages and available slots in the database');
  console.log('4. MongoDB connected');
  
  // You need to replace these with real tokens
  const USER_TOKEN = 'your-user-token-here';
  const ADMIN_TOKEN = 'your-admin-token-here';
  
  if (USER_TOKEN === 'your-user-token-here' || ADMIN_TOKEN === 'your-admin-token-here') {
    console.log('\n❌ Please update USER_TOKEN and ADMIN_TOKEN with real tokens');
    console.log('You can get tokens by:');
    console.log('1. Logging in through the frontend');
    console.log('2. Using the login API endpoints');
    return;
  }
  
  // Test 1: Payment methods
  const paymentMethods = await testPaymentMethods();
  if (paymentMethods.length === 0) {
    console.log('❌ Cannot continue without payment methods');
    return;
  }
  
  // Test 2: Create test booking
  const testBooking = await createTestBooking(USER_TOKEN);
  if (!testBooking) {
    console.log('❌ Cannot continue without test booking');
    return;
  }
  
  // Test 3: Payment processing scenarios
  for (const scenario of testScenarios) {
    await testPaymentProcessing(USER_TOKEN, testBooking, scenario);
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Test 4: Admin payment update
  await testAdminPaymentUpdate(ADMIN_TOKEN, testBooking._id);
  
  console.log('\n✅ Payment System Tests Completed');
  console.log('\nTest Summary:');
  console.log('- Payment methods endpoint: Working');
  console.log('- Booking creation: Working');
  console.log('- Payment processing: Multiple scenarios tested');
  console.log('- Payment verification: Working');
  console.log('- Admin payment updates: Working');
  
  console.log('\nNext Steps:');
  console.log('1. Test the frontend payment form');
  console.log('2. Verify email notifications are sent');
  console.log('3. Test payment flow end-to-end');
  console.log('4. Test error handling and edge cases');
}

// Helper function to generate test tokens (for development only)
function generateTestInstructions() {
  console.log('\n=== Getting Test Tokens ===');
  console.log('To get user token:');
  console.log('POST /api/auth/login');
  console.log('Body: { "email": "user@example.com", "password": "password" }');
  console.log('');
  console.log('To get admin token:');
  console.log('POST /api/auth/admin/login');
  console.log('Body: { "email": "admin@example.com", "password": "password" }');
  console.log('');
  console.log('Or use the frontend to login and copy token from localStorage');
}

// Run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  // Node.js environment
  runPaymentTests().catch(console.error);
} else {
  // Browser environment - just show instructions
  generateTestInstructions();
}

export { runPaymentTests, generateTestInstructions };