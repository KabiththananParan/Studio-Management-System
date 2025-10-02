import mongoose from "mongoose";
import dotenv from "dotenv";
import InventoryBooking from "./models/InventoryBooking.js";
import { sendInventoryPaymentConfirmationEmail } from "./services/emailService.js";
import "./config/db.js";

dotenv.config();

const testInventoryPaymentEmail = async () => {
  try {
    console.log("=== Testing Inventory Payment Confirmation Email ===");
    
    // Find an inventory booking with payment completed status
    const inventoryBooking = await InventoryBooking.findOne({
      paymentStatus: 'Paid'
    })
    .populate('items.inventory', 'name brand model category rental')
    .populate('user', 'firstName lastName email');
    
    if (!inventoryBooking) {
      console.log("❌ No paid inventory booking found. Creating test scenario...");
      
      // Find any inventory booking and simulate payment completion
      const testBooking = await InventoryBooking.findOne()
        .populate('items.inventory', 'name brand model category rental')
        .populate('user', 'firstName lastName email');
        
      if (!testBooking) {
        console.log("❌ No inventory bookings found in the database");
        return;
      }
      
      // Simulate payment completion
      testBooking.paymentStatus = 'Paid';
      testBooking.paymentMethod = 'card';
      testBooking.transactionId = `test_${Date.now()}`;
      testBooking.status = 'confirmed';
      
      console.log("📋 Using test booking:", {
        bookingId: testBooking.bookingId,
        customer: `${testBooking.user?.firstName} ${testBooking.user?.lastName}`,
        email: testBooking.user?.email,
        totalAmount: testBooking.pricing?.total,
        items: testBooking.items?.length,
        paymentStatus: testBooking.paymentStatus
      });
      
      // Send test email
      console.log("📧 Sending inventory payment confirmation email...");
      const emailResult = await sendInventoryPaymentConfirmationEmail(testBooking);
      
      if (emailResult.success) {
        console.log("✅ Inventory payment confirmation email sent successfully!");
        console.log("📧 Message ID:", emailResult.messageId);
        console.log("📮 Sent to:", testBooking.user?.email);
        
        console.log("\n=== Email Content Preview ===");
        console.log(`Subject: Equipment Rental Payment Confirmed - ${testBooking.bookingId}`);
        console.log(`Recipient: ${testBooking.user?.firstName} ${testBooking.user?.lastName} (${testBooking.user?.email})`);
        console.log(`Booking Reference: ${testBooking.bookingId}`);
        console.log(`Total Amount: LKR ${testBooking.pricing?.total?.toLocaleString()}`);
        console.log(`Transaction ID: ${testBooking.transactionId}`);
        console.log(`Equipment Count: ${testBooking.items?.length} items`);
        
        if (testBooking.items && testBooking.items.length > 0) {
          console.log("\n📦 Equipment List:");
          testBooking.items.forEach((item, index) => {
            const inventory = item.inventory;
            console.log(`  ${index + 1}. ${inventory?.name} (${inventory?.brand} ${inventory?.model})`);
            console.log(`     Quantity: ${item.quantity}, Price: LKR ${item.totalPrice?.toLocaleString()}`);
          });
        }
        
        console.log("\n📅 Rental Period:");
        console.log(`  Pickup: ${new Date(testBooking.bookingDates?.startDate).toLocaleDateString()}`);
        console.log(`  Return: ${new Date(testBooking.bookingDates?.endDate).toLocaleDateString()}`);
        console.log(`  Duration: ${testBooking.bookingDates?.duration} day(s)`);
        
      } else {
        console.log("❌ Failed to send inventory payment confirmation email");
        console.log("Error:", emailResult.error);
      }
      
    } else {
      console.log("✅ Found paid inventory booking:", {
        bookingId: inventoryBooking.bookingId,
        customer: `${inventoryBooking.user?.firstName} ${inventoryBooking.user?.lastName}`,
        email: inventoryBooking.user?.email,
        paymentStatus: inventoryBooking.paymentStatus
      });
      
      // Send email for existing paid booking
      console.log("📧 Sending inventory payment confirmation email...");
      const emailResult = await sendInventoryPaymentConfirmationEmail(inventoryBooking);
      
      if (emailResult.success) {
        console.log("✅ Inventory payment confirmation email sent successfully!");
        console.log("📧 Message ID:", emailResult.messageId);
      } else {
        console.log("❌ Failed to send email:", emailResult.error);
      }
    }
    
  } catch (error) {
    console.error("❌ Error testing inventory payment email:", error);
  } finally {
    console.log("\n=== Test Complete ===");
  }
};

// Test different email scenarios
const testEmailScenarios = async () => {
  try {
    console.log("\n=== Testing Email Scenarios ===");
    
    // Check email configuration
    console.log("📧 Email Configuration:");
    console.log("  EMAIL_USER:", process.env.EMAIL_USER ? "✅ Set" : "❌ Not set");
    console.log("  EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ Set" : "❌ Not set");
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("⚠️ Email credentials not configured. Please check your .env file.");
      console.log("Required environment variables:");
      console.log("  EMAIL_USER=your-email@gmail.com");
      console.log("  EMAIL_PASS=your-app-password");
    }
    
    // Count inventory bookings by status
    const bookingStats = await InventoryBooking.aggregate([
      {
        $group: {
          _id: "$paymentStatus",
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log("\n📊 Inventory Booking Statistics:");
    bookingStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} bookings`);
    });
    
  } catch (error) {
    console.error("❌ Error in email scenario tests:", error);
  }
};

// Run the tests
const runTests = async () => {
  console.log("🚀 Starting Inventory Payment Email Tests...\n");
  
  await testEmailScenarios();
  await testInventoryPaymentEmail();
  
  // Close database connection
  setTimeout(() => {
    mongoose.connection.close();
    console.log("📝 Database connection closed");
    process.exit(0);
  }, 2000);
};

runTests();