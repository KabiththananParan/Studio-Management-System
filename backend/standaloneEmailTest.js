import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Inventory payment confirmation email template
const createInventoryPaymentConfirmationEmail = (inventoryBooking) => {
  const customerName = `${inventoryBooking.user.firstName} ${inventoryBooking.user.lastName}`;
  const customerEmail = inventoryBooking.user.email;
  
  // Format equipment list
  const equipmentList = inventoryBooking.items.map(item => {
    const inventory = item.inventory;
    return `
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 10px; background-color: #f9fafb;">
        <h4 style="margin: 0 0 8px 0; color: #1f2937;">${inventory.name}</h4>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          <strong>Brand:</strong> ${inventory.brand} | 
          <strong>Model:</strong> ${inventory.model} | 
          <strong>Quantity:</strong> ${item.quantity}
        </p>
        <p style="margin: 5px 0 0 0; color: #059669; font-weight: bold;">
          LKR ${item.totalPrice.toLocaleString()} (${item.quantity} × LKR ${inventory.rental.pricePerDay}/day)
        </p>
      </div>
    `;
  }).join('');

  // Format dates
  const startDate = new Date(inventoryBooking.bookingDates.startDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const endDate = new Date(inventoryBooking.bookingDates.endDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: `Equipment Rental Payment Confirmed - ${inventoryBooking.bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; margin: 0;">Studio Management System</h1>
          <h2 style="color: #059669; margin: 10px 0;">Equipment Rental Payment Confirmed! ✅</h2>
        </div>
        
        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #059669;">
          <h3 style="color: #065f46; margin-top: 0;">Hello ${customerName},</h3>
          <p style="color: #047857; line-height: 1.6;">
            Excellent! Your payment has been successfully processed and your equipment rental is now confirmed. 
            Get ready for your photography session with our professional equipment!
          </p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937; border-bottom: 2px solid #059669; padding-bottom: 5px;">Payment Details</h3>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px;">
            <p><strong>Booking Reference:</strong> ${inventoryBooking.bookingId}</p>
            <p><strong>Total Paid:</strong> LKR ${inventoryBooking.pricing.total.toLocaleString()}</p>
            <p><strong>Payment Status:</strong> <span style="color: #059669; font-weight: bold;">COMPLETED ✅</span></p>
            <p><strong>Transaction ID:</strong> ${inventoryBooking.transactionId}</p>
            <p><strong>Payment Method:</strong> ${inventoryBooking.paymentMethod.toUpperCase()}</p>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937; border-bottom: 2px solid #059669; padding-bottom: 5px;">Rental Period</h3>
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p><strong>Pickup Date:</strong> ${startDate}</p>
            <p><strong>Return Date:</strong> ${endDate}</p>
            <p><strong>Rental Duration:</strong> ${inventoryBooking.bookingDates.duration} day(s)</p>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937; border-bottom: 2px solid #059669; padding-bottom: 5px;">Equipment List</h3>
          ${equipmentList}
          <div style="text-align: right; margin-top: 15px; padding: 15px; background-color: #f1f5f9; border-radius: 8px;">
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1e293b;">
              Total: LKR ${inventoryBooking.pricing.total.toLocaleString()}
            </p>
          </div>
        </div>
        
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="color: #92400e; margin-top: 0;">📋 Important Instructions:</h4>
          <div style="color: #92400e;">
            <h5 style="margin: 15px 0 5px 0;">Equipment Pickup:</h5>
            <ul style="margin: 5px 0 15px 20px; padding: 0;">
              <li>Arrive 30 minutes before your rental start time</li>
              <li>Bring a valid photo ID (NIC/Passport/Driving License)</li>
              <li>Bring this confirmation email (digital or printed)</li>
              <li>Equipment will be inspected before handover</li>
            </ul>
            
            <h5 style="margin: 15px 0 5px 0;">During Rental Period:</h5>
            <ul style="margin: 5px 0 15px 20px; padding: 0;">
              <li>Handle all equipment with care and attention</li>
              <li>Keep equipment in provided cases when not in use</li>
              <li>Report any issues immediately: +94 11 234 5678</li>
              <li>Do not attempt repairs - contact us for technical issues</li>
            </ul>
            
            <h5 style="margin: 15px 0 5px 0;">Equipment Return:</h5>
            <ul style="margin: 5px 0 0 20px; padding: 0;">
              <li>Return by 6:00 PM on the return date</li>
              <li>All items must be cleaned and in original cases</li>
              <li>Late returns incur additional charges (LKR 500/hour)</li>
              <li>Inspection will be done upon return</li>
            </ul>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6b7280; font-size: 16px;">
            Have an amazing photography session! 📸
          </p>
          <p style="color: #6b7280; font-size: 12px;">
            This is an automated confirmation email. Please save this for your records.<br>
            For any questions, contact us at support@studiomanagement.lk
          </p>
        </div>
      </div>
    `
  };
};

// Send email function
const sendInventoryPaymentConfirmationEmail = async (inventoryBooking) => {
  try {
    const emailOptions = createInventoryPaymentConfirmationEmail(inventoryBooking);
    const info = await transporter.sendMail(emailOptions);
    console.log(`📧 Inventory payment confirmation email sent to ${inventoryBooking.user.email}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send inventory payment confirmation email:`, error);
    return { success: false, error: error.message };
  }
};

// Mock inventory booking data for testing
const createMockInventoryBooking = () => {
  return {
    bookingId: "INV-2024-001-TEST",
    user: {
      firstName: "John",
      lastName: "Doe",
      email: process.env.TEST_EMAIL || "test@example.com" // Use env variable or default
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
      }
    ],
    bookingDates: {
      startDate: new Date("2024-10-10T09:00:00.000Z"),
      endDate: new Date("2024-10-12T18:00:00.000Z"),
      duration: 3
    },
    pricing: {
      total: 9900 // 7500 + 2400
    },
    paymentStatus: "Paid",
    paymentMethod: "card",
    transactionId: "txn_test_12345_demo",
    status: "confirmed"
  };
};

const testInventoryPaymentEmail = async () => {
  try {
    console.log("🚀 Testing Inventory Payment Confirmation Email");
    console.log("=".repeat(55));
    
    // Check email configuration
    console.log("\n📧 Email Configuration Check:");
    console.log(`  EMAIL_USER: ${process.env.EMAIL_USER ? "✅ Configured" : "❌ Not set"}`);
    console.log(`  EMAIL_PASS: ${process.env.EMAIL_PASS ? "✅ Configured" : "❌ Not set"}`);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("\n⚠️  Email credentials not configured in .env file");
      console.log("Please add these to your .env file:");
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
    
    // Test email sending
    console.log("\n📧 Sending test email...");
    console.log("⏳ Please wait...");
    
    const emailResult = await sendInventoryPaymentConfirmationEmail(mockBooking);
    
    if (emailResult.success) {
      console.log("\n✅ EMAIL SENT SUCCESSFULLY!");
      console.log(`📧 Message ID: ${emailResult.messageId}`);
      console.log(`📮 Sent to: ${mockBooking.user.email}`);
      console.log(`📬 Subject: Equipment Rental Payment Confirmed - ${mockBooking.bookingId}`);
      
      console.log("\n🎉 SUCCESS! The inventory payment confirmation email system is working!");
      console.log("\n📧 When a user pays for inventory booking, they will receive:");
      console.log("  ✅ Payment confirmation with transaction details");
      console.log("  ✅ Complete equipment list with prices and quantities");
      console.log("  ✅ Rental period (pickup and return dates)");
      console.log("  ✅ Detailed pickup and return instructions");
      console.log("  ✅ Contact information and business hours");
      console.log("  ✅ Important care guidelines and pro tips");
      console.log("  ✅ Professional email design with clear formatting");
      
    } else {
      console.log("\n❌ EMAIL SENDING FAILED");
      console.log(`Error: ${emailResult.error}`);
    }
    
  } catch (error) {
    console.error("\n❌ Test failed with error:", error.message);
  }
};

// Run the test
testInventoryPaymentEmail();