// Test admin inventory deletion
const testAdminDeleteInventory = async () => {
  const baseURL = 'http://localhost:5000';
  
  console.log('🔍 Testing Admin Inventory Deletion...\n');
  
  try {
    // Step 1: Admin Login
    console.log('1️⃣ Testing admin login...');
    const adminLoginResponse = await fetch(`${baseURL}/api/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: 'admin123'
      })
    });
    
    if (!adminLoginResponse.ok) {
      console.log('❌ Admin login failed');
      console.log('Status:', adminLoginResponse.status);
      const errorText = await adminLoginResponse.text();
      console.log('Error:', errorText);
      return;
    }
    
    const adminLoginData = await adminLoginResponse.json();
    console.log('✅ Admin login successful!');
    console.log('User role:', adminLoginData.role);
    var adminToken = adminLoginData.token;
    
    // Step 2: Get inventory list
    console.log('\n2️⃣ Getting admin inventory list...');
    const inventoryResponse = await fetch(`${baseURL}/api/admin/inventory`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (!inventoryResponse.ok) {
      console.log('❌ Failed to get inventory list');
      console.log('Status:', inventoryResponse.status);
      console.log('Response:', await inventoryResponse.text());
      return;
    }
    
    const inventoryData = await inventoryResponse.json();
    console.log('✅ Inventory retrieved:', inventoryData.data?.items?.length || 0, 'items');
    
    if (!inventoryData.data?.items?.length) {
      console.log('⚠️ No inventory items to test deletion with');
      return;
    }
    
    // Step 3: Try to delete first item
    const firstItem = inventoryData.data.items[0];
    console.log('\n3️⃣ Attempting to delete item:', firstItem.name, '(ID:', firstItem._id, ')');
    
    const deleteResponse = await fetch(`${baseURL}/api/admin/inventory/${firstItem._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log('Delete response status:', deleteResponse.status);
    
    if (deleteResponse.ok) {
      const deleteData = await deleteResponse.json();
      console.log('✅ Delete successful:', deleteData);
      
      // Step 4: Verify item is gone from list
      console.log('\n4️⃣ Verifying item is removed from list...');
      const verifyResponse = await fetch(`${baseURL}/api/admin/inventory`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        const stillExists = verifyData.data.items.find(item => item._id === firstItem._id);
        if (stillExists) {
          console.log('❌ Item still appears in list (soft delete issue?)');
        } else {
          console.log('✅ Item successfully removed from list');
        }
      }
      
    } else {
      const errorData = await deleteResponse.json().catch(() => ({ error: 'No JSON response' }));
      console.log('❌ Delete failed:');
      console.log('Status:', deleteResponse.status);
      console.log('Response:', errorData);
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
};

testAdminDeleteInventory();