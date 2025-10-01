# Admin Booking Management System

## Overview
Comprehensive admin booking management system that allows administrators to perform full CRUD operations on bookings for any user through the admin dashboard.

## Backend Implementation

### API Endpoints (`/api/admin/bookings`)

#### 1. GET `/api/admin/bookings`
- **Purpose**: Fetch all bookings with pagination and filtering
- **Access**: Admin only
- **Query Parameters**:
  - `page` (default: 1) - Page number for pagination
  - `limit` (default: 10) - Number of bookings per page
  - `status` - Filter by booking status ('confirmed', 'cancelled', 'completed', 'all')
  - `packageId` - Filter by specific package ID ('all' for no filter)
  - `search` - Search by customer name, email, phone, or booking reference
- **Response**: Paginated list of bookings with customer info, package details, slot information, and payment status

#### 2. POST `/api/admin/bookings`
- **Purpose**: Create new booking as admin for any customer
- **Access**: Admin only
- **Required Fields**:
  - `packageId` - ID of the photography package
  - `slotId` - ID of the time slot to book
  - `customerInfo` - Complete customer information (name, email, phone, address)
- **Optional Fields**:
  - `paymentMethod` (default: 'card')
  - `paymentStatus` (default: 'pending')
  - `specialRequests`
  - `userId` - Link to registered user if applicable
- **Features**:
  - Automatically calculates total amount (package + slot price)
  - Marks slot as unavailable after booking
  - Sends booking confirmation email to customer
  - Tracks admin who created the booking

#### 3. PUT `/api/admin/bookings/:id`
- **Purpose**: Update existing booking details
- **Access**: Admin only
- **Features**:
  - Can change package, slot, customer info, payment status
  - Automatic slot management (frees old slot, books new slot)
  - Recalculates pricing when package/slot changes
  - Tracks admin who made updates

#### 4. DELETE `/api/admin/bookings/:id`
- **Purpose**: Delete booking and free up associated slot
- **Access**: Admin only
- **Features**:
  - Automatically frees up the booked slot
  - Confirmation required before deletion
  - Returns deleted booking reference

#### 5. GET `/api/admin/bookings/stats`
- **Purpose**: Get comprehensive booking statistics for dashboard
- **Access**: Admin only
- **Returns**:
  - Total, confirmed, cancelled bookings
  - Payment status breakdown
  - Total revenue and average booking value
  - Recent bookings list

### Database Integration
- **Booking Model**: Extended with admin tracking fields (`createdBy`, `updatedBy`)
- **Slot Management**: Automatic status updates (`available` ↔ `booked`)
- **Email Integration**: Uses existing email service for booking confirmations
- **Data Consistency**: Proper cleanup when bookings are deleted or modified

## Frontend Implementation

### AdminBookings Component (`/src/Components/Admin/AdminBookings.jsx`)

#### Features
1. **Booking Table Display**
   - Paginated table showing all bookings
   - Columns: Booking Details, Customer Info, Package & Slot, Payment, Status, Actions
   - Responsive design with dark/light theme support

2. **Advanced Filtering**
   - Search by customer name, email, phone, or booking reference
   - Filter by booking status (confirmed, cancelled, completed)
   - Filter by package type
   - Reset filters functionality

3. **CRUD Operations Modal**
   - **Create Mode**: Form to create new booking with all required fields
   - **Edit Mode**: Pre-populated form for updating existing bookings
   - **View Mode**: Read-only display of booking details
   - Real-time validation and error handling

4. **Smart Form Features**
   - Package selection with pricing display
   - Slot selection showing available time slots with pricing
   - Customer information collection
   - Optional user account linking
   - Payment method and status selection

5. **Data Management**
   - Real-time data fetching and updates
   - Pagination with page navigation
   - Loading states and error handling
   - Confirmation dialogs for destructive actions

### Integration with Admin Dashboard
- Added to sidebar navigation as "📅 Bookings"
- Integrated with existing theme system (dark/light mode)
- Consistent styling with other admin components
- Pass-through of `isDarkMode` prop for theme consistency

## Usage Workflow

### For Administrators:
1. **Access**: Navigate to Admin Dashboard → Bookings tab
2. **View All Bookings**: See paginated list with all booking information
3. **Search/Filter**: Use filters to find specific bookings
4. **Create New Booking**:
   - Click "Create New Booking" button
   - Select package and available time slot
   - Enter complete customer information
   - Set payment method and status
   - Optionally link to existing user account
   - Submit to create booking (sends confirmation email)
5. **Edit Existing Booking**:
   - Click "Edit" on any booking row
   - Modify any booking details
   - System handles slot changes and pricing updates
   - Submit to save changes
6. **View Details**: Click "View" for read-only booking details
7. **Delete Booking**: Click "Delete" with confirmation prompt

### Technical Benefits:
- **Complete Control**: Admins can manage bookings for any user
- **Data Integrity**: Automatic slot management prevents double-bookings
- **User Experience**: Customers receive email confirmations automatically
- **Audit Trail**: Tracks which admin created/modified bookings
- **Flexibility**: Supports both registered and guest customer bookings
- **Real-time Updates**: Changes reflect immediately in the system

## API Response Examples

### GET /api/admin/bookings
```json
{
  "success": true,
  "bookings": [
    {
      "_id": "booking_id",
      "bookingReference": "BK-2024-001",
      "customerInfo": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "address": "123 Main St"
      },
      "packageId": {
        "_id": "package_id",
        "name": "Portrait Session",
        "price": 150
      },
      "slotId": {
        "_id": "slot_id",
        "date": "2024-01-15",
        "startTime": "10:00",
        "endTime": "11:30"
      },
      "totalAmount": 200,
      "paymentStatus": "completed",
      "bookingStatus": "confirmed",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalBookings": 48,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### POST /api/admin/bookings (Create)
```json
{
  "success": true,
  "message": "Booking created successfully by admin",
  "booking": {
    "_id": "new_booking_id",
    "bookingReference": "BK-2024-049",
    "customerInfo": { ... },
    "packageId": { ... },
    "slotId": { ... },
    "totalAmount": 225,
    "createdBy": "admin_user_id"
  }
}
```

## Security Features
- JWT authentication required for all admin endpoints
- Role-based authorization (admin privileges required)
- Input validation and sanitization
- Proper error handling with appropriate HTTP status codes
- Audit logging for admin actions

This comprehensive system provides complete booking management capabilities while maintaining data integrity and providing an excellent user experience for both administrators and customers.