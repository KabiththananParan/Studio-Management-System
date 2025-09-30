import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Package from "./models/Package.js";

dotenv.config();

const createTestPackages = async () => {
  try {
    await connectDB();

    // Check if test packages already exist
    const existingPackage = await Package.findOne({ name: "Premium Studio Package" });
    if (existingPackage) {
      console.log("✅ Test packages already exist");
      process.exit();
      return;
    }

    const testPackages = [
      {
        name: "Premium Studio Package",
        description: "Complete photography studio with advanced equipment and professional lighting setup",
        price: 280,
        duration: 6,
        features: [
          "Professional DSLR cameras",
          "Advanced lighting equipment", 
          "Multiple backdrop options",
          "Props and accessories included",
          "Dedicated photographer assistant",
          "High-resolution photo delivery"
        ],
        image: "https://example.com/premium-studio.jpg",
        isActive: true
      },
      {
        name: "Basic Photography Package", 
        description: "Essential photography package for simple shoots and portraits",
        price: 120,
        duration: 3,
        features: [
          "Basic DSLR camera",
          "Standard lighting setup",
          "2 backdrop options",
          "Basic props available",
          "Digital photo delivery"
        ],
        image: "https://example.com/basic-studio.jpg",
        isActive: true
      },
      {
        name: "Event Photography Package",
        description: "Professional event coverage with multiple photographers and equipment",
        price: 450,
        duration: 8, 
        features: [
          "2 professional photographers",
          "Multiple camera angles",
          "Live photo streaming",
          "Same-day photo highlights",
          "Complete event documentation",
          "HD video recording option"
        ],
        image: "https://example.com/event-package.jpg", 
        isActive: true
      },
      {
        name: "Portrait Session",
        description: "Individual or family portrait session in controlled studio environment",
        price: 85,
        duration: 2,
        features: [
          "Personal portrait session",
          "Professional retouching",
          "Multiple pose options", 
          "Wardrobe consultation",
          "Print-ready images"
        ],
        image: "https://example.com/portrait-session.jpg",
        isActive: false
      },
      {
        name: "Corporate Headshots",
        description: "Professional headshots for business profiles and corporate use",
        price: 150,
        duration: 4,
        features: [
          "Professional business attire consultation",
          "Multiple outfit changes",
          "LinkedIn-optimized photos",
          "High-resolution digital files",
          "Same-day delivery available",
          "Bulk pricing for teams"
        ],
        image: "https://example.com/corporate-headshots.jpg",
        isActive: true
      }
    ];

    for (const packageData of testPackages) {
      const newPackage = new Package(packageData);
      await newPackage.save();
      console.log(`✅ Test package created: ${newPackage.name} - $${newPackage.price}`);
    }

    console.log("✅ All test packages created successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error creating test packages:", err.message);
    process.exit(1);
  }
};

createTestPackages();