import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Inventory from './models/Inventory.js';
import Admin from './models/Admin.js';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const createTestInventoryItems = async () => {
  try {
    await connectDB();

    // Find an admin user to assign as creator
    const admin = await Admin.findOne();
    if (!admin) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    console.log(`Using admin: ${admin.name} (${admin._id})`);

    // Clear existing inventory items
    await Inventory.deleteMany({});
    console.log('Cleared existing inventory items');

    // Sample inventory items
    const inventoryItems = [
      {
        name: 'Canon EOS R5 Camera Body',
        category: 'Camera',
        brand: 'Canon',
        model: 'EOS R5',
        serialNumber: 'CN-R5-001',
        quantity: 2,
        availableQuantity: 2,
        condition: 'Excellent',
        status: 'Available',
        location: 'Studio A - Equipment Shelf',
        purchaseDate: new Date('2023-01-15'),
        purchasePrice: 450000,
        currentValue: 400000,
        warrantyExpiry: new Date('2025-01-15'),
        description: 'Professional mirrorless camera with 45MP sensor and 8K video recording',
        rental: {
          isAvailableForRent: true,
          dailyRate: 15000,
          weeklyRate: 90000,
          monthlyRate: 300000,
          minimumRentalDays: 1,
          maximumRentalDays: 30,
          depositRequired: true,
          depositAmount: 50000
        },
        supplier: {
          name: 'Photo Equipment Lanka',
          contact: '0112345678',
          email: 'info@photoequipment.lk'
        },
        tags: ['professional', 'mirrorless', '8K'],
        qrCode: 'INV-CNR5001-001',
        createdBy: admin._id
      },
      {
        name: 'Sony FE 24-70mm f/2.8 GM Lens',
        category: 'Lens',
        brand: 'Sony',
        model: 'FE 24-70mm f/2.8 GM',
        serialNumber: 'SY-2470GM-001',
        quantity: 1,
        availableQuantity: 1,
        condition: 'Good',
        status: 'Available',
        location: 'Studio A - Lens Cabinet',
        purchaseDate: new Date('2023-03-20'),
        purchasePrice: 280000,
        currentValue: 250000,
        warrantyExpiry: new Date('2025-03-20'),
        description: 'Professional zoom lens with constant f/2.8 aperture',
        rental: {
          isAvailableForRent: true,
          dailyRate: 8000,
          weeklyRate: 45000,
          monthlyRate: 150000,
          minimumRentalDays: 1,
          maximumRentalDays: 30,
          depositRequired: true,
          depositAmount: 30000
        },
        supplier: {
          name: 'Sony Store Colombo',
          contact: '0115678901',
          email: 'store@sony.lk'
        },
        tags: ['zoom', 'professional', 'GM'],
        qrCode: 'INV-SY2470GM001-002',
        createdBy: admin._id
      },
      {
        name: 'Godox AD600Pro Flash',
        category: 'Lighting',
        brand: 'Godox',
        model: 'AD600Pro',
        serialNumber: 'GX-AD600-001',
        quantity: 3,
        availableQuantity: 2,
        condition: 'Good',
        status: 'Available',
        location: 'Lighting Storage Room',
        purchaseDate: new Date('2023-02-10'),
        purchasePrice: 85000,
        currentValue: 75000,
        description: 'Portable studio flash with HSS and TTL support',
        rental: {
          isAvailableForRent: true,
          dailyRate: 3500,
          weeklyRate: 20000,
          monthlyRate: 65000,
          minimumRentalDays: 1,
          maximumRentalDays: 30,
          depositRequired: true,
          depositAmount: 15000
        },
        supplier: {
          name: 'Light Pro Lanka',
          contact: '0117890123',
          email: 'sales@lightpro.lk'
        },
        tags: ['flash', 'portable', 'HSS'],
        qrCode: 'INV-GXAD600001-003',
        createdBy: admin._id,
        maintenanceHistory: [{
          date: new Date('2023-11-15'),
          type: 'Routine',
          description: 'Cleaned flash head and checked capacitors',
          cost: 2500,
          performedBy: 'Technical Team',
          nextMaintenanceDate: new Date('2024-05-15')
        }]
      },
      {
        name: 'Manfrotto Carbon Fiber Tripod',
        category: 'Tripod',
        brand: 'Manfrotto',
        model: '055CXPRO3',
        serialNumber: 'MF-055CX-001',
        quantity: 4,
        availableQuantity: 3,
        condition: 'Excellent',
        status: 'Available',
        location: 'Tripod Rack - Studio B',
        purchaseDate: new Date('2023-04-05'),
        purchasePrice: 45000,
        currentValue: 40000,
        description: 'Professional carbon fiber tripod with 3-section legs',
        rental: {
          isAvailableForRent: true,
          dailyRate: 1500,
          weeklyRate: 8000,
          monthlyRate: 25000,
          minimumRentalDays: 1,
          maximumRentalDays: 30,
          depositRequired: true,
          depositAmount: 8000
        },
        supplier: {
          name: 'Camera Accessories LK',
          contact: '0119876543',
          email: 'info@cameraaccessories.lk'
        },
        tags: ['carbon', 'professional', 'lightweight'],
        qrCode: 'INV-MF055CX001-004',
        createdBy: admin._id
      },
      {
        name: 'Rode VideoMic Pro Plus',
        category: 'Audio',
        brand: 'Rode',
        model: 'VideoMic Pro Plus',
        serialNumber: 'RD-VMPP-001',
        quantity: 2,
        availableQuantity: 2,
        condition: 'Excellent',
        status: 'Available',
        location: 'Audio Equipment Cabinet',
        purchaseDate: new Date('2023-05-12'),
        purchasePrice: 35000,
        currentValue: 32000,
        warrantyExpiry: new Date('2025-05-12'),
        description: 'Professional shotgun microphone with rechargeable battery',
        rental: {
          isAvailableForRent: true,
          dailyRate: 2500,
          weeklyRate: 15000,
          monthlyRate: 50000,
          minimumRentalDays: 1,
          maximumRentalDays: 30,
          depositRequired: true,
          depositAmount: 10000
        },
        supplier: {
          name: 'Audio Visual Systems',
          contact: '0112468135',
          email: 'sales@avsystems.lk'
        },
        tags: ['shotgun', 'battery', 'professional'],
        qrCode: 'INV-RDVMPP001-005',
        createdBy: admin._id
      },
      {
        name: 'Colorama Paper Backdrop - White',
        category: 'Backdrop',
        brand: 'Colorama',
        model: '2.72m x 11m White',
        serialNumber: 'CL-WHT-001',
        quantity: 5,
        availableQuantity: 4,
        condition: 'Good',
        status: 'Available',
        location: 'Backdrop Storage',
        purchaseDate: new Date('2023-01-30'),
        purchasePrice: 8000,
        currentValue: 6000,
        description: 'Professional seamless paper backdrop roll',
        rental: {
          isAvailableForRent: true,
          dailyRate: 1200,
          weeklyRate: 7000,
          monthlyRate: 22000,
          minimumRentalDays: 1,
          maximumRentalDays: 30,
          depositRequired: true,
          depositAmount: 6000
        },
        tags: ['paper', 'seamless', 'portrait'],
        qrCode: 'INV-CLWHT001-006',
        createdBy: admin._id
      },
      {
        name: 'Apple MacBook Pro 16" M2',
        category: 'Computer',
        brand: 'Apple',
        model: 'MacBook Pro 16" M2',
        serialNumber: 'AP-MBP16-001',
        quantity: 1,
        availableQuantity: 1,
        condition: 'Excellent',
        status: 'Available',
        location: 'Editing Suite',
        purchaseDate: new Date('2023-06-01'),
        purchasePrice: 520000,
        currentValue: 480000,
        warrantyExpiry: new Date('2024-06-01'),
        description: 'High-performance laptop for photo and video editing',
        rental: {
          isAvailableForRent: true,
          dailyRate: 12000,
          weeklyRate: 70000,
          monthlyRate: 250000,
          minimumRentalDays: 1,
          maximumRentalDays: 30,
          depositRequired: true,
          depositAmount: 100000
        },
        supplier: {
          name: 'Apple Store Colombo City Centre',
          contact: '0115555555',
          email: 'store@apple.com'
        },
        tags: ['editing', 'M2', 'portable'],
        qrCode: 'INV-APMBP16001-007',
        createdBy: admin._id
      },
      {
        name: 'Vintage Film Camera Props Set',
        category: 'Props',
        brand: 'Various',
        model: 'Mixed Vintage Cameras',
        serialNumber: 'PR-VINTAGE-001',
        quantity: 8,
        availableQuantity: 8,
        condition: 'Fair',
        status: 'Available',
        location: 'Props Storage Room',
        purchaseDate: new Date('2023-07-20'),
        purchasePrice: 15000,
        currentValue: 12000,
        description: 'Collection of vintage cameras for photo shoots and styling',
        rental: {
          isAvailableForRent: true,
          dailyRate: 3000,
          weeklyRate: 18000,
          monthlyRate: 60000,
          minimumRentalDays: 1,
          maximumRentalDays: 30,
          depositRequired: true,
          depositAmount: 15000
        },
        tags: ['vintage', 'props', 'styling'],
        qrCode: 'INV-PRVINTAGE001-008',
        createdBy: admin._id
      },
      {
        name: 'Canon EF 85mm f/1.2L USM',
        category: 'Lens',
        brand: 'Canon',
        model: 'EF 85mm f/1.2L USM',
        serialNumber: 'CN-85L-001',
        quantity: 1,
        availableQuantity: 0,
        condition: 'Needs Repair',
        status: 'Maintenance',
        location: 'Repair Workshop',
        purchaseDate: new Date('2022-08-15'),
        purchasePrice: 195000,
        currentValue: 160000,
        description: 'Professional portrait lens with ultra-wide aperture - Currently under repair',
        rental: {
          isAvailableForRent: false, // Disabled until repair is complete
          dailyRate: 10000,
          weeklyRate: 60000,
          monthlyRate: 200000,
          minimumRentalDays: 1,
          maximumRentalDays: 30,
          depositRequired: true,
          depositAmount: 40000
        },
        supplier: {
          name: 'Canon Authorized Dealer',
          contact: '0113333333',
          email: 'service@canon.lk'
        },
        tags: ['portrait', 'L-series', 'repair-needed'],
        qrCode: 'INV-CN85L001-009',
        createdBy: admin._id,
        maintenanceHistory: [{
          date: new Date('2024-01-10'),
          type: 'Repair',
          description: 'Aperture mechanism repair and calibration needed',
          cost: 25000,
          performedBy: 'Canon Service Center'
        }]
      },
      {
        name: 'Profoto B10 Plus Flash',
        category: 'Lighting',
        brand: 'Profoto',
        model: 'B10 Plus',
        serialNumber: 'PF-B10P-001',
        quantity: 2,
        availableQuantity: 1,
        condition: 'Excellent',
        status: 'Available',
        location: 'Studio A - Lighting Cabinet',
        purchaseDate: new Date('2023-09-05'),
        purchasePrice: 165000,
        currentValue: 155000,
        warrantyExpiry: new Date('2025-09-05'),
        description: 'Compact and powerful off-camera flash with smartphone connectivity',
        rental: {
          isAvailableForRent: true,
          dailyRate: 8000,
          weeklyRate: 45000,
          monthlyRate: 150000,
          minimumRentalDays: 1,
          maximumRentalDays: 30,
          depositRequired: true,
          depositAmount: 35000
        },
        supplier: {
          name: 'Professional Photography Equipment',
          contact: '0117777777',
          email: 'info@ppe.lk'
        },
        tags: ['compact', 'smartphone-control', 'powerful'],
        qrCode: 'INV-PFB10P001-010',
        createdBy: admin._id
      }
    ];

    // Insert inventory items
    const createdItems = await Inventory.insertMany(inventoryItems);
    console.log(`Created ${createdItems.length} inventory items:`);

    createdItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} (${item.brand} ${item.model}) - ${item.status}`);
    });

    // Get some statistics
    const stats = await Inventory.getInventoryStats();
    console.log('\nInventory Statistics:');
    console.log(`Total Items: ${stats.totalItems}`);
    console.log(`Available Items: ${stats.availableItems}`);
    console.log(`Items in Maintenance: ${stats.maintenanceItems}`);
    console.log(`Total Value: LKR ${stats.totalValue.toLocaleString()}`);

    console.log('\nTest inventory items created successfully!');
  } catch (error) {
    console.error('Error creating inventory items:', error);
  } finally {
    mongoose.connection.close();
  }
};

createTestInventoryItems();