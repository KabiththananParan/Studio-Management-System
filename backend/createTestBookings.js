import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Booking from "./models/Booking.js";
import Package from "./models/Package.js";

dotenv.config();

const createTestBookings = async () => {
  try {
    await connectDB();

    // Check if test bookings already exist
    const existingBooking = await Booking.findOne({ "customerInfo.email": "john.doe@example.com" });
    if (existingBooking) {
      console.log("✅ Test bookings already exist");
      process.exit();
      return;
    }

    // Get existing packages to use their IDs
    const packages = await Package.find().limit(5);
    if (packages.length === 0) {
      console.log("❌ No packages found. Please create packages first.");
      process.exit(1);
      return;
    }

    const testBookings = [
      {
        customerInfo: {
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "+94771234567",
          address: "123 Main Street, Colombo 03, Sri Lanka"
        },
        packageId: packages[0]._id,
        packageName: packages[0].name,
        packagePrice: packages[0].price,
        slotId: "slot-001",
        bookingDate: new Date('2025-01-15'),
        bookingTime: "10:00 AM",
        duration: packages[0].duration,
        slotPrice: 50,
        totalAmount: packages[0].price + 50,
        paymentMethod: "card",
        paymentStatus: "completed",
        paymentId: "pay_1234567890",
        bookingStatus: "confirmed",
        specialRequests: "Please ensure good lighting setup",
        bookedAt: new Date('2025-01-10T08:30:00Z')
      },
      {
        customerInfo: {
          name: "Jane Smith",
          email: "jane.smith@example.com", 
          phone: "+94777654321",
          address: "456 Oak Avenue, Kandy, Sri Lanka"
        },
        packageId: packages[1]._id,
        packageName: packages[1].name,
        packagePrice: packages[1].price,
        slotId: "slot-002",
        bookingDate: new Date('2025-01-18'),
        bookingTime: "02:00 PM",
        duration: packages[1].duration,
        slotPrice: 75,
        totalAmount: packages[1].price + 75,
        paymentMethod: "wallet",
        paymentStatus: "completed",
        paymentId: "pay_0987654321",
        bookingStatus: "completed",
        notes: "Customer was very satisfied with the service",
        bookedAt: new Date('2025-01-12T14:20:00Z')
      },
      {
        customerInfo: {
          name: "Mike Johnson",
          email: "mike.johnson@example.com",
          phone: "+94763456789",
          address: "789 Pine Road, Galle, Sri Lanka"
        },
        packageId: packages[2]._id,
        packageName: packages[2].name,
        packagePrice: packages[2].price,
        slotId: "slot-003",
        bookingDate: new Date('2025-01-22'),
        bookingTime: "11:00 AM",
        duration: packages[2].duration,
        slotPrice: 100,
        totalAmount: packages[2].price + 100,
        paymentMethod: "bank",
        paymentStatus: "pending",
        bookingStatus: "confirmed",
        specialRequests: "Need extra props for corporate shoot",
        bookedAt: new Date('2025-01-14T10:15:00Z')
      },
      {
        customerInfo: {
          name: "Sarah Wilson",
          email: "sarah.wilson@example.com",
          phone: "+94712345678",
          address: "321 Cedar Lane, Negombo, Sri Lanka"
        },
        packageId: packages[0]._id,
        packageName: packages[0].name,
        packagePrice: packages[0].price,
        slotId: "slot-004",
        bookingDate: new Date('2025-01-20'),
        bookingTime: "04:00 PM",
        duration: packages[0].duration,
        slotPrice: 60,
        totalAmount: packages[0].price + 60,
        paymentMethod: "card",
        paymentStatus: "failed",
        bookingStatus: "cancelled",
        notes: "Payment failed, booking automatically cancelled",
        bookedAt: new Date('2025-01-13T16:45:00Z')
      },
      {
        customerInfo: {
          name: "David Brown",
          email: "david.brown@example.com",
          phone: "+94798765432",
          address: "654 Maple Street, Matara, Sri Lanka"
        },
        packageId: packages[3]._id,
        packageName: packages[3].name,
        packagePrice: packages[3].price,
        slotId: "slot-005",
        bookingDate: new Date('2025-01-25'),
        bookingTime: "09:00 AM",
        duration: packages[3].duration,
        slotPrice: 40,
        totalAmount: packages[3].price + 40,
        paymentMethod: "card",
        paymentStatus: "completed",
        paymentId: "pay_1122334455",
        bookingStatus: "confirmed",
        specialRequests: "Family portrait session",
        bookedAt: new Date('2025-01-15T12:00:00Z')
      },
      {
        customerInfo: {
          name: "Emily Davis",
          email: "emily.davis@example.com",
          phone: "+94756789123",
          address: "987 Birch Drive, Jaffna, Sri Lanka"
        },
        packageId: packages[4]._id,
        packageName: packages[4].name,
        packagePrice: packages[4].price,
        slotId: "slot-006",
        bookingDate: new Date('2025-01-28'),
        bookingTime: "03:00 PM",
        duration: packages[4].duration,
        slotPrice: 80,
        totalAmount: packages[4].price + 80,
        paymentMethod: "wallet",
        paymentStatus: "completed",
        paymentId: "pay_9988776655",
        bookingStatus: "confirmed",
        notes: "Professional headshots for LinkedIn",
        bookedAt: new Date('2025-01-16T09:30:00Z')
      }
    ];

    for (const bookingData of testBookings) {
      const newBooking = new Booking(bookingData);
      await newBooking.save();
      console.log(`✅ Test booking created: ${newBooking.customerInfo.name} - ${newBooking.packageName} ($${newBooking.totalAmount})`);
    }

    console.log("✅ All test bookings created successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error creating test bookings:", err.message);
    process.exit(1);
  }
};

createTestBookings();