// Simple test to verify our debug server is responding
console.log('Testing server response...');

const testServer = async () => {
  try {
    const response = await fetch('http://localhost:5000/', {
      method: 'GET'
    });
    
    if (response.ok) {
      const data = await response.text();
      console.log('✅ Server is responding:', data);
    } else {
      console.log('❌ Server error:', response.status);
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }
};

testServer();