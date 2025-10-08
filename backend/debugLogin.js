import dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";

// Test login with one of the existing users
const testLogin = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email: "parankabiththanan01@gmail.com", 
        password: "123456" // Common test password
      }),
    });

    const data = await response.json();
    console.log("Response Status:", response.status);
    console.log("Response Data:", data);

    if (!response.ok) {
      console.log("❌ Login failed");
    } else {
      console.log("✅ Login successful");
    }
  } catch (error) {
    console.error("Request error:", error);
  }
};

testLogin();