// Comprehensive API test for inventory editing issue
import http from 'http';
import https from 'https';

const BASE_URL = 'http://localhost:5000';
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123';

let authToken = null;
let testInventoryId = null;

const apiTest = async () => {
  console.log('🔍 Starting comprehensive inventory editing API test...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connection...');
    try {
      const response = await fetch(`${BASE_URL}/`);
      if (response.ok) {
        console.log('✅ Server is running on', BASE_URL);
      } else {
        console.log('❌ Server responded with status:', response.status);
      }
    } catch (error) {
      console.log('❌ Cannot connect to server:', error.message);
      console.log('👉 Make sure to start the backend server first: npm run dev');
      return;
    }

    // Test 2: Admin login
    console.log('\n2️⃣ Testing admin login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok && loginData.token) {
      authToken = loginData.token;
      console.log('✅ Admin login successful');
      console.log('📝 Token received:', authToken.substring(0, 20) + '...');
    } else {
      console.log('❌ Admin login failed:', loginData.message || 'Unknown error');
      console.log('📄 Full response:', JSON.stringify(loginData, null, 2));
      return;
    }

    // Test 3: Get inventory items
    console.log('\n3️⃣ Testing inventory fetch...');
    const inventoryResponse = await fetch(`${BASE_URL}/api/admin/inventory`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const inventoryData = await inventoryResponse.json();
    
    if (inventoryResponse.ok && inventoryData.length > 0) {
      testInventoryId = inventoryData[0]._id;
      console.log('✅ Inventory fetch successful');
      console.log(`📦 Found ${inventoryData.length} items`);
      console.log(`🎯 Test item: ${inventoryData[0].name} (ID: ${testInventoryId})`);
    } else {
      console.log('❌ Inventory fetch failed:', inventoryData.message || 'Unknown error');
      console.log('📄 Full response:', JSON.stringify(inventoryData, null, 2));
      return;
    }

    // Test 4: Get specific inventory item
    console.log('\n4️⃣ Testing single item fetch...');
    const singleItemResponse = await fetch(`${BASE_URL}/api/admin/inventory/${testInventoryId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const singleItemData = await singleItemResponse.json();
    
    if (singleItemResponse.ok) {
      console.log('✅ Single item fetch successful');
      console.log(`📋 Item details: ${singleItemData.name} - ${singleItemData.brand} ${singleItemData.model}`);
    } else {
      console.log('❌ Single item fetch failed:', singleItemData.message || 'Unknown error');
    }

    // Test 5: Test inventory update
    console.log('\n5️⃣ Testing inventory update...');
    const updateData = {
      name: singleItemData.name + ' (Test Updated)',
      category: singleItemData.category,
      brand: singleItemData.brand,
      model: singleItemData.model,
      serialNumber: singleItemData.serialNumber,
      quantity: singleItemData.quantity,
      availableQuantity: singleItemData.availableQuantity,
      condition: singleItemData.condition,
      status: singleItemData.status,
      location: singleItemData.location || 'Studio A',
      purchaseDate: singleItemData.purchaseDate,
      purchasePrice: singleItemData.purchasePrice,
      currentValue: singleItemData.currentValue,
      rental: singleItemData.rental
    };

    console.log('📝 Sending update data:', JSON.stringify(updateData, null, 2));

    const updateResponse = await fetch(`${BASE_URL}/api/admin/inventory/${testInventoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(updateData)
    });

    const updateResult = await updateResponse.json();
    
    if (updateResponse.ok) {
      console.log('✅ Inventory update successful!');
      console.log('📋 Updated item:', updateResult.name);
    } else {
      console.log('❌ Inventory update failed:', updateResult.message || 'Unknown error');
      console.log('📄 Full error response:', JSON.stringify(updateResult, null, 2));
      console.log('🔍 Response status:', updateResponse.status);
      console.log('🔍 Response headers:', Object.fromEntries(updateResponse.headers));
    }

    // Test 6: Revert the test change
    console.log('\n6️⃣ Reverting test changes...');
    const revertData = { ...updateData, name: singleItemData.name };
    
    const revertResponse = await fetch(`${BASE_URL}/api/admin/inventory/${testInventoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(revertData)
    });

    if (revertResponse.ok) {
      console.log('✅ Test changes reverted successfully');
    } else {
      console.log('⚠️ Could not revert test changes (not critical)');
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
    console.error('Stack trace:', error.stack);
  }

  console.log('\n🏁 API test completed!');
};

// Check if server is running before starting
const checkServer = async () => {
  try {
    await fetch(BASE_URL);
    apiTest();
  } catch (error) {
    console.log('❌ Backend server is not running!');
    console.log('👉 Please run: npm run dev (in the backend folder)');
    console.log('👉 Then run this test again');
  }
};

checkServer();