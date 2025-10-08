// Test script to diagnose inventory edit issues
import mongoose from 'mongoose';
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const testInventoryEdit = async () => {
  try {
    // Test basic connectivity to inventory endpoint
    const testToken = 'Bearer test-token'; // We'll test this when we have a real token
    
    console.log('Testing inventory edit functionality...');
    console.log('Backend should be running on: http://localhost:5000');
    console.log('Edit endpoint should be: PUT /api/admin/inventory/:id');
    
    // Test the fetch to the health endpoint first
    try {
      const healthResponse = await fetch('http://localhost:5000/', {
        method: 'GET'
      });
      console.log('Health check response:', healthResponse.status);
    } catch (error) {
      console.log('Server not running or not accessible:', error.message);
    }
    
    console.log('\nTo test inventory editing:');
    console.log('1. Start backend server: npm run dev');
    console.log('2. Start frontend: npm run dev');
    console.log('3. Login as admin');
    console.log('4. Go to inventory management');
    console.log('5. Click Edit on any item');
    console.log('6. Check browser console for errors');
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

testInventoryEdit();