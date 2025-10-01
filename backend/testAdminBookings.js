// Test script for admin booking management endpoints
// Run this with: node testAdminBookings.js

import fetch from 'node-fetch'; // You might need to install: npm install node-fetch

const BASE_URL = 'http://localhost:5000';

// You'll need to replace this with a real admin token
// You can get one by logging in as admin through the API or frontend
const ADMIN_TOKEN = 'your-admin-token-here';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${ADMIN_TOKEN}`
};

async function testGetAllBookings() {
  console.log('\n=== Testing GET All Bookings ===');
  try {
    const response = await fetch(`${BASE_URL}/api/admin/bookings`, {
      headers
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ GET bookings successful');
      console.log(`Found ${data.bookings?.length} bookings`);
    } else {
      console.log('❌ GET bookings failed');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function testGetBookingStats() {
  console.log('\n=== Testing GET Booking Stats ===');
  try {
    const response = await fetch(`${BASE_URL}/api/admin/bookings/stats`, {
      headers
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ GET booking stats successful');
    } else {
      console.log('❌ GET booking stats failed');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function testCreateBooking() {
  console.log('\n=== Testing CREATE Booking ===');
  
  // First, let's get available packages and slots
  try {
    const [packagesRes, slotsRes] = await Promise.all([
      fetch(`${BASE_URL}/api/admin/packages`, { headers }),
      fetch(`${BASE_URL}/api/admin/slots`, { headers })
    ]);
    
    const packagesData = await packagesRes.json();
    const slotsData = await slotsRes.json();
    
    if (!packagesRes.ok || !slotsRes.ok) {
      console.log('❌ Failed to fetch packages or slots for test');
      return;
    }
    
    const availablePackages = packagesData.packages?.filter(pkg => pkg.isActive) || [];
    const availableSlots = slotsData.slots?.filter(slot => slot.isAvailable) || [];
    
    if (availablePackages.length === 0) {
      console.log('❌ No active packages found for test');
      return;
    }
    
    if (availableSlots.length === 0) {
      console.log('❌ No available slots found for test');
      return;
    }
    
    const testBooking = {
      packageId: availablePackages[0]._id,
      slotId: availableSlots[0]._id,
      customerInfo: {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+1234567890',
        address: '123 Test Street, Test City'
      },
      paymentMethod: 'card',
      paymentStatus: 'pending',
      specialRequests: 'This is a test booking created by admin'
    };
    
    console.log('Creating booking with data:', JSON.stringify(testBooking, null, 2));
    
    const response = await fetch(`${BASE_URL}/api/admin/bookings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testBooking)
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ CREATE booking successful');
      console.log(`Created booking: ${data.booking?.bookingReference}`);
      return data.booking;
    } else {
      console.log('❌ CREATE booking failed');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  return null;
}

async function testUpdateBooking(bookingId) {
  if (!bookingId) {
    console.log('❌ No booking ID provided for update test');
    return;
  }
  
  console.log('\n=== Testing UPDATE Booking ===');
  try {
    const updateData = {
      specialRequests: 'Updated by admin - test completed',
      paymentStatus: 'completed'
    };
    
    const response = await fetch(`${BASE_URL}/api/admin/bookings/${bookingId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updateData)
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ UPDATE booking successful');
    } else {
      console.log('❌ UPDATE booking failed');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function testDeleteBooking(bookingId) {
  if (!bookingId) {
    console.log('❌ No booking ID provided for delete test');
    return;
  }
  
  console.log('\n=== Testing DELETE Booking ===');
  try {
    const response = await fetch(`${BASE_URL}/api/admin/bookings/${bookingId}`, {
      method: 'DELETE',
      headers
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ DELETE booking successful');
    } else {
      console.log('❌ DELETE booking failed');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Admin Booking API Tests');
  console.log('Make sure you have:');
  console.log('1. Backend server running on port 5000');
  console.log('2. Valid admin token in the ADMIN_TOKEN variable');
  console.log('3. Some active packages and available slots in the database');
  
  if (ADMIN_TOKEN === 'your-admin-token-here') {
    console.log('\n❌ Please update ADMIN_TOKEN with a real admin token');
    console.log('You can get one by:');
    console.log('1. Logging in as admin through the frontend');
    console.log('2. Or using the admin login API endpoint');
    return;
  }
  
  await testGetBookingStats();
  await testGetAllBookings();
  
  const createdBooking = await testCreateBooking();
  
  if (createdBooking) {
    await testUpdateBooking(createdBooking._id);
    await testDeleteBooking(createdBooking._id);
  }
  
  console.log('\n✅ Admin Booking API Tests Completed');
}

// Run the tests
runAllTests().catch(console.error);