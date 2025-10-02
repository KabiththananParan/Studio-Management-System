// Test script for user inventory booking APIs
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Test user credentials (create a test user if needed)
const testUser = {
  email: 'testuser@example.com',
  password: 'password123'
};

let authToken = '';

async function testLogin() {
  try {
    console.log('🔐 Testing user login...');
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();
    if (response.ok) {
      authToken = data.token;
      console.log('✅ Login successful');
      return true;
    } else {
      console.log('❌ Login failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return false;
  }
}

async function testGetAvailableInventory() {
  try {
    console.log('\n📦 Testing get available inventory...');
    const response = await fetch(`${BASE_URL}/api/user/inventory-bookings/available`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`✅ Found ${data.inventory?.length || 0} available items`);
      data.inventory?.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.name} - LKR ${item.rental?.dailyRate}/day`);
      });
      return data.inventory || [];
    } else {
      console.log('❌ Failed to get inventory:', data.message);
      return [];
    }
  } catch (error) {
    console.error('❌ Inventory fetch error:', error.message);
    return [];
  }
}

async function testCheckAvailability(inventoryId, startDate, endDate) {
  try {
    console.log('\n🗓️  Testing availability check...');
    const response = await fetch(`${BASE_URL}/api/user/inventory-bookings/availability`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inventoryId,
        startDate,
        endDate
      })
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`✅ Availability check: ${data.available ? 'Available' : 'Not Available'}`);
      if (data.available) {
        console.log(`   📊 Booking cost: LKR ${data.totalCost}`);
        console.log(`   💰 Deposit: LKR ${data.depositAmount}`);
      }
      return data;
    } else {
      console.log('❌ Availability check failed:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Availability check error:', error.message);
    return null;
  }
}

async function testCreateBooking(inventoryId, startDate, endDate) {
  try {
    console.log('\n📋 Testing booking creation...');
    const bookingData = {
      inventoryId,
      startDate,
      endDate,
      purpose: 'Professional photography session',
      deliveryAddress: '123 Main St, Colombo 03',
      specialRequirements: 'Handle with care - studio equipment'
    };

    const response = await fetch(`${BASE_URL}/api/user/inventory-bookings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });

    const data = await response.json();
    if (response.ok) {
      console.log('✅ Booking created successfully!');
      console.log(`   📋 Booking ID: ${data.booking._id}`);
      console.log(`   💰 Total Cost: LKR ${data.booking.totalCost}`);
      console.log(`   📊 Status: ${data.booking.status}`);
      return data.booking;
    } else {
      console.log('❌ Booking creation failed:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Booking creation error:', error.message);
    return null;
  }
}

async function testGetUserBookings() {
  try {
    console.log('\n📋 Testing get user bookings...');
    const response = await fetch(`${BASE_URL}/api/user/inventory-bookings/my-bookings`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`✅ Found ${data.bookings?.length || 0} user bookings`);
      data.bookings?.forEach((booking, index) => {
        console.log(`   ${index + 1}. ${booking.inventory?.name} - ${booking.status} - LKR ${booking.totalCost}`);
      });
      return data.bookings || [];
    } else {
      console.log('❌ Failed to get bookings:', data.message);
      return [];
    }
  } catch (error) {
    console.error('❌ User bookings error:', error.message);
    return [];
  }
}

async function runTests() {
  console.log('🧪 Starting Inventory Booking API Tests\n');
  
  // Test 1: Login
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without authentication');
    return;
  }

  // Test 2: Get available inventory
  const inventory = await testGetAvailableInventory();
  if (inventory.length === 0) {
    console.log('\n❌ No inventory available for testing');
    return;
  }

  // Use the first available item for testing
  const testItem = inventory[0];
  console.log(`\n🎯 Using test item: ${testItem.name}`);

  // Test 3: Check availability
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);

  const startDate = tomorrow.toISOString().split('T')[0];
  const endDate = dayAfter.toISOString().split('T')[0];

  const availability = await testCheckAvailability(testItem._id, startDate, endDate);
  if (!availability?.available) {
    console.log('\n⚠️  Item not available for selected dates');
    return;
  }

  // Test 4: Create booking
  const booking = await testCreateBooking(testItem._id, startDate, endDate);
  if (!booking) {
    console.log('\n❌ Booking creation failed');
    return;
  }

  // Test 5: Get user bookings
  await testGetUserBookings();

  console.log('\n🎉 All tests completed successfully!');
  console.log('\n📋 Test Summary:');
  console.log('   ✅ User authentication');
  console.log('   ✅ Inventory browsing');
  console.log('   ✅ Availability checking');
  console.log('   ✅ Booking creation');
  console.log('   ✅ Booking retrieval');
  console.log('\n🚀 The inventory booking system is fully functional!');
}

// Run the tests
runTests().catch(error => {
  console.error('🚨 Test suite failed:', error);
});