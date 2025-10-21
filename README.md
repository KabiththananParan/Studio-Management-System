# Studio Management System

A full-stack web application for managing a photography studio, including studio bookings, equipment inventory rentals, and dual dashboards for users and admins.

## Features

- **Studio Bookings**: Reserve time slots for photo sessions, manage booking status, and process payments.
- **Inventory Rentals**: Rent equipment with lifecycle tracking, availability management, and payment integration.
- **Dual Authentication**: Separate user and admin models with unified JWT-based authentication.
- **Admin Dashboard**: Manage bookings, slots, packages, inventory, users, and generate reports.
- **User Dashboard**: Book sessions, rent equipment, view and search bookings, and manage payments.
- **Email Notifications**: Automated emails for booking confirmations, payments, and status updates.
- **Refund System**: Sophisticated refund eligibility and processing for both booking types.

## Tech Stack

- **Frontend**: React 19.1, Vite, Tailwind CSS, React Router, Axios
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Nodemailer
- **Database**: MongoDB with custom ID generation, virtuals, and pre-save hooks

## Project Structure

```
backend/
  controllers/      # Express controllers for business logic
  models/           # Mongoose schemas and models
  routes/           # API route definitions
  services/         # Email, payment, and utility services
  config/           # Database and environment config
  ...               # Test and debug scripts
frontend/
  src/Components/   # React components (Auth, Admin, Booking, Rental, Inventory, User, etc.)
  ...               # Vite, Tailwind, and public assets
```

## Development

### Backend
```bash
cd backend
npm install
npm run dev         # Start backend with nodemon
```

### Frontend
```bash
cd frontend
npm install
npm run dev         # Start frontend (Vite dev server)
```

## Environment Variables
Create a `.env` file in `backend/` with:
```
MONGO_URI=mongodb://localhost:27017/studio_management
JWT_SECRET=your_jwt_secret
EMAIL_USER=smtp_username
EMAIL_PASS=smtp_password
PORT=5000
```

## Testing & Debugging
- Use scripts in `backend/` (e.g., `createTestUsers.js`, `testFullBookingFlow.js`) to generate data and validate flows.
- Run `node <script>` in the `backend/` directory.

## Key Endpoints
- User APIs: `/api/user/*`
- Admin APIs: `/api/admin/*`
- Auth: `/api/auth/*`
- Payments: `/api/payments/process`
- Public: `/api/reviews`, `/api/refunds`

## License
MIT License

---

For detailed architecture and contribution guidelines, see `.github/copilot-instructions.md`.
