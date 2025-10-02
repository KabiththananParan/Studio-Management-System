// Using native fetch (Node.js 18+)

const BASE_URL = 'http://localhost:5000';

// Test user credentials
const testUser = {
  email: 'john.doe@example.com',
  password: 'password123'
};

async function testInventoryBookingFlow() {
  try {
    console.log('🚀 Testing Inventory Booking Flow...\n');

    // 1. Login to get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    const loginData = await loginResponse.json();
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginData.message}`);
    }

    const token = loginData.token;
    console.log('✅ Login successful');

    // 2. Get user profile
    console.log('\n2️⃣ Getting user profile...');
    const profileResponse = await fetch(`${BASE_URL}/api/user/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!profileResponse.ok) {
      const errorData = await profileResponse.json();
      throw new Error(`Profile fetch failed: ${errorData.message}`);
    }

    const user = await profileResponse.json();
    console.log('✅ User profile:', {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email
    });

    // 3. Get available inventory
    console.log('\n3️⃣ Getting available inventory...');
    const inventoryResponse = await fetch(`${BASE_URL}/api/user/inventory-bookings/available`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!inventoryResponse.ok) {
      const errorData = await inventoryResponse.json();
      throw new Error(`Inventory fetch failed: ${errorData.message}`);
    }

    const inventoryData = await inventoryResponse.json();
    console.log('✅ Available inventory count:', inventoryData.data?.items?.length || 0);

    if (!inventoryData.data?.items?.length) {
      console.log('⚠️ No inventory items found');
      return;
    }

    const firstItem = inventoryData.data.items[0];
    console.log('📦 First item:', firstItem.name);

    // 4. Check availability for tomorrow to next week
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 8);

    console.log('\n4️⃣ Checking availability...');
    console.log('Dates:', startDate.toISOString().split('T')[0], 'to', endDate.toISOString().split('T')[0]);

    const availabilityResponse = await fetch(`${BASE_URL}/api/user/inventory-bookings/check-availability`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [{ inventoryId: firstItem._id, quantity: 1 }],
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })
    });

    if (!availabilityResponse.ok) {
      const errorData = await availabilityResponse.json();
      throw new Error(`Availability check failed: ${errorData.message}`);
    }

    const availabilityData = await availabilityResponse.json();
    console.log('✅ Availability check result:', availabilityData.success);

    if (!availabilityData.success || !availabilityData.data?.availability?.[0]?.available) {
      console.log('❌ Item not available:', availabilityData.data?.availability?.[0]?.reason || 'Unknown reason');
      return;
    }

    const pricing = availabilityData.data.availability[0].pricing;
    console.log('💰 Pricing:', {
      dailyRate: pricing.dailyRate,
      totalCost: pricing.totalCost,
      days: pricing.days
    });

    // 5. Create booking
    console.log('\n5️⃣ Creating booking...');
    const bookingData = {
      items: [{ inventoryId: firstItem._id, quantity: 1 }],
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      customerInfo: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: 'Not provided'
      },
      notes: 'Test booking from debug script'
    };

    console.log('📋 Booking data:', JSON.stringify(bookingData, null, 2));

    const bookingResponse = await fetch(`${BASE_URL}/api/user/inventory-bookings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });

    console.log('📡 Response status:', bookingResponse.status);

    if (!bookingResponse.ok) {
      const errorData = await bookingResponse.json();
      console.log('❌ Booking creation failed:');
      console.log('Status:', bookingResponse.status);
      console.log('Error:', errorData);
      return;
    }

    const bookingResult = await bookingResponse.json();
    console.log('✅ Booking created successfully!');
    console.log('Booking ID:', bookingResult.data?._id || bookingResult.booking?._id);

  } catch (error) {
    console.error('🔥 Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testInventoryBookingFlow();