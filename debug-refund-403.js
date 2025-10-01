// Quick test to debug the 403 error
// Run this after logging in and getting a token

const testRefundEligibility = async () => {
  // Replace with a real booking ID from your database
  const bookingId = "68dd1b96566a54ce02676eb0";
  
  // Replace with a real token from localStorage after login
  const token = "YOUR_TOKEN_HERE";
  
  try {
    console.log('Testing refund eligibility endpoint...');
    console.log('Booking ID:', bookingId);
    console.log('Token:', token ? 'Present' : 'Missing');
    
    const response = await fetch(`http://localhost:5000/api/refunds/eligibility/${bookingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success response:', data);
    } else {
      const errorData = await response.json().catch(() => ({ message: 'Could not parse error response' }));
      console.log('Error response:', errorData);
    }
    
  } catch (error) {
    console.error('Request failed:', error);
  }
};

// Instructions to use this test:
// 1. Open browser console
// 2. Login to get a token (check localStorage)
// 3. Replace bookingId and token above
// 4. Copy and paste this entire function into console
// 5. Run: testRefundEligibility()

console.log('Test function ready. Update bookingId and token, then call testRefundEligibility()');