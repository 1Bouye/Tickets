# Backend API - Ticket Management System

Node.js/Express backend API for the ticket management system.

## Features

- User authentication (Admin, User, Staff)
- Ticket generation and management
- QR code validation
- Purchase history tracking
- Scan logs and statistics
- Role-based access control

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing
- Express Validator
- Helmet for security
- Rate limiting

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB installed and running (or MongoDB Atlas connection string)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ticketSystem
JWT_SECRET=your_super_secret_key_here_change_in_production
JWT_EXPIRE=24h
NODE_ENV=development
BCRYPT_ROUNDS=10
```

3. Seed initial admin user:
```bash
npm run seed
```

4. Start the server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/admin-login` - Admin login
- `POST /api/auth/user-login` - User login
- `POST /api/auth/staff-login` - Staff login

### Admin Endpoints (Require Admin Token)
- `POST /api/admin/users/create` - Create user
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId` - Update user
- `POST /api/admin/tickets/generate` - Generate tickets
- `GET /api/admin/tickets` - Get tickets
- `GET /api/admin/tickets/:ticketId` - Get single ticket
- `GET /api/admin/dashboard/stats` - Dashboard statistics

### User Endpoints (Require User Token)
- `GET /api/user/tickets/available` - Get available ticket
- `POST /api/user/tickets/purchase` - Purchase ticket
- `GET /api/user/tickets/my-ticket` - Get my ticket
- `GET /api/user/tickets/history` - Get purchase history

### Scanner Endpoints (Require Staff Token)
- `POST /api/scanner/validate` - Validate QR code
- `GET /api/scanner/logs` - Get scan logs
- `GET /api/scanner/stats` - Get scanner statistics

## Project Structure

```
backend/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── scripts/         # Utility scripts
├── utils/           # Helper functions
└── server.js        # Main server file
```

## Database Models

- **User**: Admin, User, Staff accounts
- **Ticket**: Generated tickets with QR codes
- **ScanLog**: Scan validation logs
- **PurchaseHistory**: User purchase records

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Rate limiting
- Helmet security headers
- Input validation

## Notes

- Default admin credentials: `admin` / `admin123` (change after first login!)
- Make sure MongoDB is running before starting the server
- Update JWT_SECRET in production
- All timestamps are in UTC

