import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Test unified payment system
async function testUnifiedPaymentSystem() {
  console.log('🧪 Testing Unified Payment System');
  console.log('====================================');
  
  try {
    // Test data
    const testInventoryBookingId = '6706b45e74b96f414ed147ad'; // Replace with actual ID
    const testStudioBookingId = '6706b45e74b96f414ed147ae'; // Replace with actual ID
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Replace with actual token
    
    console.log('\n1️⃣ Testing Inventory Booking Payment');
    console.log('====================================');
    
    const inventoryPayment = {
      bookingId: testInventoryBookingId,
      paymentMethod: 'card',
      currency: 'LKR',
      bookingType: 'inventory',
      paymentDetails: {
        customerName: 'Test User',
        equipmentList: 'Camera, Lens'
      }
    };
    
    const inventoryResponse = await fetch(`${BASE_URL}/api/payments/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(inventoryPayment)
    });
    
    const inventoryResult = await inventoryResponse.json();
    console.log('Inventory Payment Result:', JSON.stringify(inventoryResult, null, 2));
    
    console.log('\n2️⃣ Testing Studio Booking Payment');
    console.log('==================================');
    
    const studioPayment = {
      bookingId: testStudioBookingId,
      paymentMethod: 'card',
      currency: 'LKR',
      bookingType: 'studio',
      paymentDetails: {
        customerName: 'Test User'
      }
    };
    
    const studioResponse = await fetch(`${BASE_URL}/api/payments/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(studioPayment)
    });
    
    const studioResult = await studioResponse.json();
    console.log('Studio Payment Result:', JSON.stringify(studioResult, null, 2));
    
    console.log('\n✅ Unified Payment System Test Complete');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test
testUnifiedPaymentSystem();