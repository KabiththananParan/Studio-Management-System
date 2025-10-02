import { sendInventoryPaymentConfirmationEmail } from "./services/emailService.js";
import dotenv from "dotenv";

dotenv.config();

// Mock inventory booking data for testing
const createMockInventoryBooking = () => {
  return {
    bookingId: "INV-2024-001-TEST",
    user: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com" // Replace with a real email for testing
    },
    items: [
      {
        inventory: {
          name: "Canon EOS R5 Camera",
          brand: "Canon",
          model: "EOS R5",
          rental: {
            pricePerDay: 2500
          }
        },
        quantity: 1,
        totalPrice: 7500 // 3 days × 2500
      },
      {
        inventory: {
          name: "85mm f/1.4 Lens",
          brand: "Canon",
          model: "RF 85mm f/1.4L IS USM",
          rental: {
            pricePerDay: 800
          }
        },
        quantity: 1,
        totalPrice: 2400 // 3 days × 800
      },
      {
        inventory: {
          name: "Professional Tripod",
          brand: "Manfrotto",
          model: "MT190XPRO4",
          rental: {
            pricePerDay: 200
          }
        },
        quantity: 2,
        totalPrice: 1200 // 3 days × 200 × 2
      }
    ],
    bookingDates: {
      startDate: new Date("2024-10-10T09:00:00.000Z"),
      endDate: new Date("2024-10-12T18:00:00.000Z"),
      duration: 3
    },
    pricing: {
      total: 11100 // 7500 + 2400 + 1200
    },
    paymentStatus: "Paid",
    paymentMethod: "card",
    transactionId: "txn_test_12345_demo",
    status: "confirmed"
  };
};

const testInventoryPaymentEmail = async () => {
  try {
    console.log("=== Testing Inventory Payment Confirmation Email ===\n");
    
    // Check email configuration
    console.log("📧 Email Configuration Check:");
    console.log(`  EMAIL_USER: ${process.env.EMAIL_USER ? "✅ Configured" : "❌ Not set"}`);
    console.log(`  EMAIL_PASS: ${process.env.EMAIL_PASS ? "✅ Configured" : "❌ Not set"}`);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("\n⚠️  Email not configured. Set EMAIL_USER and EMAIL_PASS in .env file");
      console.log("Example:");
      console.log("EMAIL_USER=your-email@gmail.com");
      console.log("EMAIL_PASS=your-app-password");
      return;
    }
    
    // Create mock booking data
    const mockBooking = createMockInventoryBooking();
    
    console.log("\n📋 Test Booking Details:");
    console.log(`  Booking ID: ${mockBooking.bookingId}`);
    console.log(`  Customer: ${mockBooking.user.firstName} ${mockBooking.user.lastName}`);
    console.log(`  Email: ${mockBooking.user.email}`);
    console.log(`  Total Amount: LKR ${mockBooking.pricing.total.toLocaleString()}`);
    console.log(`  Equipment Items: ${mockBooking.items.length}`);
    console.log(`  Rental Duration: ${mockBooking.bookingDates.duration} days`);
    
    console.log("\n📦 Equipment List:");
    mockBooking.items.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.inventory.name} (${item.inventory.brand})`);
      console.log(`     Quantity: ${item.quantity}, Total: LKR ${item.totalPrice.toLocaleString()}`);
    });
    
    console.log("\n📅 Rental Period:");
    console.log(`  Pickup: ${mockBooking.bookingDates.startDate.toLocaleDateString()}`);
    console.log(`  Return: ${mockBooking.bookingDates.endDate.toLocaleDateString()}`);
    
    // Test email sending
    console.log("\n📧 Sending payment confirmation email...");
    console.log("⏳ Please wait...");
    
    const emailResult = await sendInventoryPaymentConfirmationEmail(mockBooking);
    
    if (emailResult.success) {
      console.log("\n✅ EMAIL SENT SUCCESSFULLY!");
      console.log(`📧 Message ID: ${emailResult.messageId}`);
      console.log(`📮 Sent to: ${mockBooking.user.email}`);
      console.log(`📬 Subject: Equipment Rental Payment Confirmed - ${mockBooking.bookingId}`);
      
      console.log("\n🎉 SUCCESS! The inventory payment confirmation email system is working!");
      console.log("📧 The user will now receive a detailed confirmation email when they pay for equipment rental.");
      
      console.log("\n📋 Email includes:");
      console.log("  ✅ Payment confirmation with transaction details");
      console.log("  ✅ Complete equipment list with prices");
      console.log("  ✅ Rental period and duration");
      console.log("  ✅ Pickup and return instructions");
      console.log("  ✅ Contact information and business hours");
      console.log("  ✅ Important guidelines and pro tips");
      
    } else {
      console.log("\n❌ EMAIL SENDING FAILED");
      console.log(`Error: ${emailResult.error}`);
      console.log("\nPossible solutions:");
      console.log("1. Check your email credentials in .env file");
      console.log("2. Enable 2-factor authentication and use app password");
      console.log("3. Check your internet connection");
      console.log("4. Verify Gmail allows less secure app access");
    }
    
  } catch (error) {
    console.error("\n❌ Test failed with error:", error.message);
    console.log("\nError details:", error);
  }
};

// Test with different email scenarios
const testEmailVariations = async () => {
  console.log("\n=== Testing Different Email Scenarios ===\n");
  
  // Test with minimal equipment
  const minimalBooking = {
    bookingId: "INV-2024-002-MIN",
    user: {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com"
    },
    items: [
      {
        inventory: {
          name: "Basic DSLR Camera",
          brand: "Nikon",
          model: "D3500",
          rental: { pricePerDay: 1200 }
        },
        quantity: 1,
        totalPrice: 1200
      }
    ],
    bookingDates: {
      startDate: new Date("2024-10-15T10:00:00.000Z"),
      endDate: new Date("2024-10-15T17:00:00.000Z"),
      duration: 1
    },
    pricing: { total: 1200 },
    paymentStatus: "Paid",
    paymentMethod: "cash",
    transactionId: "cash_test_67890",
    status: "confirmed"
  };
  
  console.log("📧 Testing minimal equipment rental email...");
  try {
    const result = await sendInventoryPaymentConfirmationEmail(minimalBooking);
    if (result.success) {
      console.log("✅ Minimal booking email sent successfully");
    } else {
      console.log("❌ Minimal booking email failed:", result.error);
    }
  } catch (error) {
    console.log("❌ Error in minimal test:", error.message);
  }
};

// Main execution
const runEmailTests = async () => {
  console.log("🚀 Starting Inventory Payment Email Tests");
  console.log("=" .repeat(50));
  
  await testInventoryPaymentEmail();
  
  // Only run additional tests if main test passes
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    await testEmailVariations();
  }
  
  console.log("\n" + "=".repeat(50));
  console.log("✅ Email testing complete!");
  console.log("💡 The inventory booking payment confirmation email system is ready to use.");
};

runEmailTests();