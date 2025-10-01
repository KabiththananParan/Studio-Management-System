# Studio Management System - AI Agent Guide

## Architecture Overview
This is a full-stack photography studio booking system with:
- **Backend**: Express.js + MongoDB (ESM modules, not CommonJS)
- **Frontend**: React + Vite + TailwindCSS
- **Authentication**: JWT with role-based access (User/Admin)

## Backend Patterns

### Project Structure
```
backend/
├── models/           # Mongoose schemas with pre-save hooks
├── controllers/      # Business logic (async/await pattern)
├── routes/          # Express routes (grouped by feature)
├── middleware/      # Auth middleware with role checking
└── config/          # Database connection
```

### Key Backend Conventions
- **ESM imports**: Always use `import/export`, not `require()`
- **Model hooks**: User model has `pre('save')` for password hashing and `matchPassword()` method
- **Auth middleware**: `protect` middleware extracts JWT from `Authorization: Bearer <token>`, `admin` middleware checks roles
- **Route naming**: `/api/auth/*`, `/api/user/*`, `/api/admin/*`
- **Error handling**: Controllers use try/catch with proper HTTP status codes

### Database Models
- **User**: Has OTP verification flow (`otp`, `otpExpiry`, `isVerified`) and password reset (`resetPasswordOtp`)
- **Package**: Studio packages with `features` array, `isActive` boolean
- **Booking**: Complex model with embedded `customerInfo`, references to `Package`, booking slots, payment tracking, and business logic methods (`canBeCancelled()`, static `getStats()`)

## Frontend Patterns

### Component Organization
```
src/Components/
├── Auth/            # Login, SignUp, EmailVerification
├── Admin/           # AdminDashboard, PackagesTable, UsersTable
├── Booking/
│   ├── components/  # Reusable components (Header, PackageCard)
│   ├── pages/       # Page components exported via index.js
│   └── data/        # constants.js with studioPackages data
└── User/           # ProfileView component
```

### API Integration Patterns
- **No Axios config**: Uses native `fetch()` with hardcoded `http://localhost:5000`
- **Auth headers**: `Authorization: Bearer ${token}` from localStorage
- **Error handling**: Check `response.ok` before parsing JSON
- **State management**: useState hooks, no global state library

### Routing & Navigation
- React Router v6 patterns with `useNavigate()` and `location.state`
- Booking flow: Home → Package Selection → Slot Selection → Customer Details → Payment → Success
- Authentication flow: Login → OTP Verification → Dashboard

## Development Workflows

### Backend Development
```bash
cd backend
npm run dev          # Uses nodemon for auto-reload
```

### Frontend Development  
```bash
cd frontend
npm run dev          # Vite dev server with HMR
```

### Environment Setup
- Backend expects `MONGO_URI`, `JWT_SECRET`, email config in `.env`
- Frontend hardcodes API base URL (no env vars currently used)

## Testing & Data Seeding
- Test files in backend root: `createTestUsers.js`, `createTestBookings.js`, `createTestPackages.js`
- Run with: `node createTestUsers.js` (requires MongoDB connection)

## Authentication Flow
1. **Registration**: Email → OTP verification → Account activation
2. **Login**: Credentials → JWT token → Role-based routing
3. **Password Reset**: Email → OTP → New password
4. **Admin Access**: Separate admin login at `/admin-login`

## Key Integration Points
- **Package Selection**: `studioPackages` constant defines available packages
- **Slot Booking**: Time slots generated dynamically in frontend
- **Payment Flow**: In-memory state management (no external payment gateway yet)
- **Admin Features**: User management, package CRUD, dashboard analytics

## Common Pitfalls
- Always use ESM syntax in backend files
- Auth middleware expects "Bearer " prefix in Authorization header  
- MongoDB models use `timestamps: true` for automatic createdAt/updatedAt
- Frontend components often mix business logic - consider extracting to hooks
- No TypeScript - be careful with prop types and API contracts

## When Adding Features
- **New API routes**: Add to appropriate route file, update middleware chain
- **New models**: Include proper indexes and business logic methods
- **New components**: Follow the barrel export pattern in `index.js` files
- **Authentication**: Use existing `protect` and `admin` middleware