import dotenv from "dotenv";
dotenv.config();

const testLogin = async () => {
  console.log("Testing login with fixed user...");
  
  try {
    console.log("Making request to: http://localhost:5000/api/auth/login");
    
    // Test with first user
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email: "parankabiththanan01@gmail.com", 
        password: "123456"
      }),
    });

    console.log("Response received with status:", response.status);
    
    const data = await response.json();
    console.log("Response Data:", JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("✅ Login successful!");
      console.log("Token received:", data.token ? "Yes" : "No");
    } else {
      console.log("❌ Login failed:", data.message);
    }
  } catch (error) {
    console.error("❌ Request error:", error.message);
    console.error("Full error:", error);
  }
};

testLogin();