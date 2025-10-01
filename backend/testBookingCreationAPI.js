import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Test data that mimics what the frontend would send
const testBookingCreation = async () => {
  try {
    // Generate a token for the test user (john@gmail.com)
    const userId = "671575a0f624285c62a076e8"; // You might need to adjust this
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
    
    const bookingData = {
      packageId: "671575b2f624285c62a076f0", // Adjust this packageId  
      slotId: "68dcf86e710b7b9161348a75",   // Adjust this slotId
      customerInfo: {
        name: "John Doe",
        email: "john@gmail.com", 
        phone: "077 123 4567",
        address: "123 Main Street, Colombo, Sri Lanka"
      },
      paymentMethod: "card"
    };

    console.log("Testing booking creation with data:");
    console.log(JSON.stringify(bookingData, null, 2));
    console.log("Token:", token.substring(0, 20) + "...");

    const response = await fetch('http://localhost:5000/api/user/bookings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });

    const responseData = await response.json();
    
    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log("✅ Booking created successfully!");
    } else {
      console.log("❌ Booking creation failed");
    }

  } catch (error) {
    console.error("Error testing booking creation:", error);
  }
};

testBookingCreation();