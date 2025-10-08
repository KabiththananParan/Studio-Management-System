// Test script to debug inventory editing issues
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('🔍 Debugging Inventory Edit Issues...\n');

const testInventoryEdit = async () => {
  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connection...');
    const healthResponse = await fetch('http://localhost:5000/');
    if (healthResponse.ok) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server not responding');
      return;
    }

    // Test 2: Check if admin routes are accessible (should return 401 without token)
    console.log('\n2️⃣ Testing admin routes...');
    const adminResponse = await fetch('http://localhost:5000/api/admin/inventory');
    if (adminResponse.status === 401) {
      console.log('✅ Admin routes require authentication (expected)');
    } else {
      console.log('❌ Unexpected admin route response:', adminResponse.status);
    }

    // Test 3: Try to access with fake token (should return specific error)
    console.log('\n3️⃣ Testing with fake token...');
    const fakeTokenResponse = await fetch('http://localhost:5000/api/admin/inventory', {
      headers: {
        'Authorization': 'Bearer fake-token'
      }
    });
    console.log('Response status with fake token:', fakeTokenResponse.status);

    console.log('\n📋 Next Steps:');
    console.log('1. Start backend server: npm run dev (in backend folder)');
    console.log('2. Start frontend: npm run dev (in frontend folder)');
    console.log('3. Login as admin user');
    console.log('4. Go to Inventory Management');
    console.log('5. Click Edit on any item');
    console.log('6. Open browser console to see debug logs');
    console.log('7. Check backend terminal for server logs');

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Make sure backend server is running on port 5000');
    console.log('- Check if MongoDB is connected');
    console.log('- Verify all dependencies are installed');
  }
};

testInventoryEdit();