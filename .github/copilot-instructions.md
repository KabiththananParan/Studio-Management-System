# Studio Management System - AI Coding Instructions

## Architecture Overview

This is a full-stack Studio Management System with **clear separation** between frontend (React + Vite) and backend (Node.js + Express + MongoDB). The system handles two main business domains:

1. **Studio Bookings** - Traditional photo studio time slot reservations
2. **Inventory Rentals** - Equipment rental with complex booking lifecycles

### Key Technology Stack
- **Backend**: Node.js + Express + MongoDB (Mongoose) + JWT auth + Nodemailer
- **Frontend**: React 19.1 + Vite + React Router + Tailwind CSS + Axios
- **Database**: MongoDB with sophisticated schema relationships and indexing

## Critical Backend Patterns

### 1. Dual Authentication System
The system supports **both users and admins** with separate models but unified middleware:
```javascript
// middleware/authMiddleware.js handles both User and Admin tokens
// Check decoded.role === "admin" vs regular user
req.user = { id, email, role: "admin|user", isAdmin: boolean }
```

### 2. Model Schema Conventions
- **Auto-generated IDs**: Most models use custom ID generation (e.g., `IB-${timestamp}-${random}` for inventory bookings)
- **Index Strategy**: Fields with `unique: true` already create indexes - **avoid duplicate `.index()` calls**
- **Virtuals**: Extensive use of virtual fields for calculated properties (booking age, totals, etc.)
- **Pre-save Hooks**: Complex business logic in pre-save middleware for auto-calculations

### 3. Booking Status Workflows
Both booking types use sophisticated state machines:
- **Studio Bookings**: `Pending → Confirmed → Paid → Completed`  
- **Inventory Bookings**: `Pending → Confirmed → Paid → Equipment Ready → Checked Out → In Use → Returned → Completed`

### 4. Unified Payment System
Single endpoint `/api/payments/process` handles both booking types:
- Use `bookingType: "studio"|"inventory"` parameter
- Authorization checks ownership + admin privileges
- Integrated with email notifications via `services/emailService.js`

## Development Workflows

### Essential Scripts
```bash
# Backend (from /backend)
npm run dev          # Uses nodemon for auto-restart
npm start           # Production mode

# Frontend (from /frontend)  
npm run dev         # Vite dev server with HMR
npm run build       # Production build
```

### Test & Debug Infrastructure
The `/backend` contains extensive testing utilities:
- **Data Creation**: `createTest*.js` files for generating sample data
- **API Testing**: `test*.js` files for endpoint validation
- **Debug Scripts**: `debug*.js` for troubleshooting specific issues
- **Connection Testing**: `testSimpleConnection.js` for DB connectivity

### Key Test Commands
```bash
# Create sample data (run from /backend)
node createTestInventory.js     # Creates equipment inventory
node createTestUsers.js         # Creates test user accounts  
node createAdmin.js            # Creates admin accounts
node createTestSlots.js        # Creates studio time slots

# Debug specific issues
node debugSpecificBooking.js   # Debug booking problems
node debugRefundEligibility.js # Debug refund calculations
```

## Frontend Architecture

### Component Organization
```
src/Components/
├── Auth/           # Login, signup, verification flows
├── Admin/          # Admin dashboard and management  
├── Booking/        # Studio booking workflow
├── Rental/         # Equipment rental workflow
├── Inventory/      # Equipment management
├── User/           # User dashboard components
└── [Feature]/      # Domain-specific features
```

### Routing Patterns
- **Dual Dashboards**: `/userDashboard` and `/adminDashboard` 
- **Booking Flow**: `/booking → /customer-details → /payment → /success`
- **Rental Flow**: `/rental-payment → /rental-payment-success`
- **Admin Routes**: Prefixed with `/admin` for management interfaces

## Database Relationships & Indexes

### Key Models & References
- **User/Admin**: Separate models, unified auth middleware
- **Booking**: References User, Package, includes complex status tracking  
- **InventoryBooking**: References User, Inventory items with quantities/dates
- **Inventory**: Equipment catalog with rental rates, availability tracking
- **Refund**: References Booking, includes sophisticated refund calculation logic

### Critical Index Issues
**Never duplicate indexes!** Fields with `unique: true` automatically create indexes:
```javascript
// ❌ WRONG - Creates duplicate index warning
bookingId: { type: String, unique: true },
schema.index({ bookingId: 1 }); // Remove this!

// ✅ CORRECT - Let unique handle the index  
bookingId: { type: String, unique: true },
// Comment: bookingId already indexed via unique constraint
```

## Email & Notification System

Located in `services/emailService.js`:
- **Payment Confirmations**: Separate handlers for studio vs inventory bookings
- **Refund Notifications**: Multi-step refund process emails
- **Status Updates**: Booking lifecycle notifications

### Common Property Issues
When working with email templates, verify model property names:
- InventoryBooking items use `item.subtotal` (not `item.totalPrice`)
- Always populate referenced fields before accessing nested properties

## Configuration & Environment

### Required Environment Variables (.env)
```bash
MONGO_URI=mongodb://localhost:27017/studio_management
JWT_SECRET=your_jwt_secret
EMAIL_USER=smtp_username  
EMAIL_PASS=smtp_password
PORT=5000
```

### API Base Patterns
All routes follow consistent prefixing:
- User APIs: `/api/user/*`
- Admin APIs: `/api/admin/*`  
- Auth: `/api/auth/*`
- Payments: `/api/payments/*`
- Public: `/api/reviews`, `/api/refunds` (eligibility checks)

## Common Debugging Commands

```bash
# Check DB connection
node testSimpleConnection.js

# Verify user data
node listUsers.js

# Test specific booking flow
node testFullBookingFlow.js

# Email system testing  
node standaloneEmailTest.js

# Payment system testing
node testUnifiedPayments.js
```

This system emphasizes **complex business logic**, **dual-user workflows**, and **sophisticated state management**. Always verify model schemas and relationships before making changes, and use the extensive test suite to validate functionality.