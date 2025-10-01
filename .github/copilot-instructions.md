
# Studio Management System — AI Agent Guide

## System Architecture
Full-stack booking platform for photography studios:
- **Backend**: Express.js (ESM) + MongoDB (Mongoose)
- **Frontend**: React (Vite, TailwindCSS)
- **Auth**: JWT, role-based (User/Admin), OTP flows

## Backend Patterns & Conventions
- **ESM only**: Use `import`/`export`, never `require()`
- **Project structure**: `models/`, `controllers/`, `routes/`, `middleware/`, `config/`
- **Model hooks**: User model uses `pre('save')` for password hashing, `matchPassword()`
- **Booking model**: Embedded `customerInfo`, payment tracking, business logic methods (`canBeCancelled()`, `getStats()`)
- **Admin tracking**: Bookings and invoices track `createdBy`, `updatedBy`
- **Auth middleware**: `protect` (JWT from `Authorization: Bearer ...`), `admin` (role check)
- **Route naming**: `/api/auth/*`, `/api/user/*`, `/api/admin/*`, `/api/payments/*`, `/api/user/invoices*`
- **Error handling**: Controllers use try/catch, return proper HTTP status
- **Timestamps**: All models use `timestamps: true`
- **Testing/Seeding**: Use scripts in `backend/` root (e.g. `node createTestUsers.js`)

## Key Backend Features
- **Payment System**: Multi-method (card, bank, cash), mock gateway, Luhn validation, admin/manual status, email notifications. See `PAYMENT_SYSTEM.md` for API and DB details.
- **Admin Booking**: Full CRUD, advanced filtering, slot management, audit trail. See `ADMIN_BOOKING_SYSTEM.md`.
- **Refunds**: Demo mode, eligibility logic, admin approval, audit trail. See `REFUND_DEMO_GUIDE.md`.
- **Invoices**: Auto-generated after payment, PDF-ready, LKR localization, stats, search. See `INVOICE_SYSTEM_COMPLETE.md`.
- **Sri Lanka Localization**: Phone/currency validation, local bank/cash details. See `SRI_LANKA_LOCALIZATION.md`.

## Frontend Patterns
- **Component structure**: `src/Components/Auth/`, `Admin/`, `Booking/`, `User/`, etc.
- **API calls**: Use `fetch()` (no Axios), hardcoded `http://localhost:5000`, always check `response.ok`
- **Auth**: JWT in `localStorage`, `Authorization: Bearer ...` header
- **Routing**: React Router v6, `useNavigate`, booking flow: Home → Package → Slot → Details → Payment → Success
- **State**: Local state with hooks, no global state lib
- **LKR formatting**: Use `.toLocaleString()` for currency

## Developer Workflows
- **Backend**: `cd backend && npm run dev` (nodemon)
- **Frontend**: `cd frontend && npm run dev` (Vite HMR)
- **Env**: Backend needs `.env` (`MONGO_URI`, `JWT_SECRET`, email config). Frontend API URL is hardcoded.
- **Testing**: Use backend scripts for test data, e.g. `node createTestBookings.js`

## Integration & Data Flows
- **Booking → Payment → Invoice**: Booking creation triggers payment, payment triggers invoice (auto-linked)
- **Admin actions**: Admin dashboard for bookings, payments, refunds, invoices
- **Email**: Confirmation/instructions sent for bookings, payments, refunds
- **Localization**: All user-facing currency/phone fields are LKR/Sri Lankan format

## Common Pitfalls
- Always use ESM in backend
- JWT must be prefixed with `Bearer `
- No TypeScript: check prop types and API contracts manually
- Frontend mixes logic/UI: consider extracting hooks for reuse

## Adding Features
- **API**: Add to correct route file, use proper middleware
- **Models**: Add business logic methods, indexes
- **Frontend**: Use barrel export in `index.js` for new components
- **Auth**: Use `protect`/`admin` middleware for new routes

---
**See project markdowns (`*_SYSTEM.md`, `*_GUIDE.md`, `SRI_LANKA_LOCALIZATION.md`) for detailed flows, API contracts, and business logic.**