# Backend Documentation - Ticket Management System

## Overview
This document outlines the backend architecture for the daily ticket management system. The backend is built with Node.js and uses MongoDB as the database to handle all business logic, data storage, and API endpoints for the Admin Panel, User Mobile App, and Scanner Mobile App.

---

## System Architecture

### Technology Stack
- **Runtime:** Node.js (LTS version)
- **Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Express-validator or Joi
- **Security:** bcrypt for password hashing, helmet for security headers
- **Environment:** dotenv for configuration
- **Date/Time:** moment.js or date-fns for date handling

### Core Responsibilities
1. User authentication and authorization
2. Ticket generation and management
3. QR code data handling
4. Ticket validation logic
5. Data persistence and retrieval
6. Business rule enforcement (one ticket per day, daily expiration)

---

## Database Design

### Collections/Models

#### 1. Users Collection
Stores all user accounts (created by admin).

**Fields:**
- userId (unique identifier, string, indexed)
- password (hashed string)
- role (enum: 'admin', 'user', 'staff')
- createdAt (timestamp)
- createdBy (admin ID reference)
- isActive (boolean, default: true)
- lastLogin (timestamp)

**Indexes:**
- userId (unique)
- role

#### 2. Tickets Collection
Stores all generated tickets.

**Fields:**
- ticketId (unique identifier, string, indexed)
- qrCodeData (string containing all QR code information)
- generatedDate (date, indexed)
- generatedTime (timestamp)
- status (enum: 'available', 'purchased', 'used')
- purchasedBy (userId reference, null if not purchased)
- purchasedAt (timestamp, null if not purchased)
- usedAt (timestamp, null if not used)
- scannedBy (staff userId reference, null if not used)

**Indexes:**
- ticketId (unique)
- generatedDate (for daily queries)
- status (for filtering)
- purchasedBy (for user queries)

#### 3. ScanLogs Collection
Stores all scan attempts for auditing.

**Fields:**
- logId (unique identifier)
- ticketId (reference to ticket)
- scannedBy (staff userId)
- scanTime (timestamp)
- scanResult (enum: 'success', 'already_used', 'invalid', 'expired')
- userIdFromQR (extracted from QR code)
- additionalInfo (object for any extra data)

**Indexes:**
- scanTime (for querying by date)
- ticketId
- scannedBy

#### 4. PurchaseHistory Collection (Optional)
Track user purchase history.

**Fields:**
- purchaseId (unique identifier)
- userId (reference)
- ticketId (reference)
- purchaseDate (date)
- purchaseTime (timestamp)

**Indexes:**
- userId
- purchaseDate

---

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/admin-login
**Purpose:** Admin login to access admin panel

**Request Body:**
- username (string)
- password (string)

**Response:**
- Success: JWT token, admin user data
- Failure: Error message

**Logic:**
- Verify credentials against Users collection (role: admin)
- Hash password comparison
- Generate JWT token with admin role
- Return token and user info

#### POST /api/auth/user-login
**Purpose:** User login to mobile app

**Request Body:**
- userId (string)
- password (string)

**Response:**
- Success: JWT token, user data
- Failure: Error message

**Logic:**
- Verify credentials against Users collection (role: user)
- Check if user isActive
- Hash password comparison
- Generate JWT token with user role
- Update lastLogin timestamp
- Return token and user info

#### POST /api/auth/staff-login
**Purpose:** Staff login to scanner app

**Request Body:**
- userId (string)
- password (string)

**Response:**
- Success: JWT token, staff data
- Failure: Error message

**Logic:**
- Verify credentials against Users collection (role: staff)
- Generate JWT token with staff role
- Return token and user info

---

### Admin Endpoints (Protected - Require Admin Token)

#### POST /api/admin/users/create
**Purpose:** Create new user account

**Request Body:**
- userId (string, unique)
- password (string)
- role (string: 'user' or 'staff')

**Response:**
- Success: Created user data (without password)
- Failure: Error message

**Logic:**
- Validate admin token
- Check if userId already exists
- Hash password using bcrypt
- Create new user in Users collection
- Set createdBy to admin ID
- Return success with user data

#### GET /api/admin/users
**Purpose:** Get list of all users

**Query Parameters:**
- role (optional filter: 'user', 'staff')
- isActive (optional filter: true/false)
- page (pagination)
- limit (pagination)

**Response:**
- Array of users (without passwords)
- Total count
- Pagination info

**Logic:**
- Validate admin token
- Query Users collection with filters
- Exclude password field
- Implement pagination
- Return user list

#### PUT /api/admin/users/:userId
**Purpose:** Update user information

**Request Body:**
- isActive (boolean, to activate/deactivate)
- password (string, optional, to reset password)

**Response:**
- Success: Updated user data
- Failure: Error message

**Logic:**
- Validate admin token
- Find user by userId
- Update fields
- If password provided, hash it
- Return updated user data

#### POST /api/admin/tickets/generate
**Purpose:** Generate daily batch of tickets

**Request Body:**
- quantity (number, e.g., 1000)

**Response:**
- Success: Confirmation message, number of tickets created
- Failure: Error message

**Logic:**
- Validate admin token
- Get current date
- Generate unique ticketId for each ticket (use UUID or custom format)
- Create QR code data string for each ticket (format: ticketId|date|time)
- Set status to 'available'
- Set generatedDate to today
- Bulk insert into Tickets collection
- Return success with count

#### GET /api/admin/tickets
**Purpose:** Get all tickets with filters

**Query Parameters:**
- date (filter by specific date, default: today)
- status (filter: 'available', 'purchased', 'used')
- page (pagination)
- limit (pagination)

**Response:**
- Array of tickets
- Total count
- Statistics (available, purchased, used counts)

**Logic:**
- Validate admin token
- Query Tickets collection with filters
- Calculate statistics
- Implement pagination
- Return ticket list with stats

#### GET /api/admin/tickets/:ticketId
**Purpose:** Get specific ticket details

**Response:**
- Ticket data with full details
- User info if purchased

**Logic:**
- Validate admin token
- Find ticket by ticketId
- Populate purchasedBy user data
- Return ticket details

#### GET /api/admin/dashboard/stats
**Purpose:** Get dashboard statistics

**Response:**
- Total tickets today
- Available tickets count
- Purchased tickets count
- Used tickets count
- Total users
- Today's scan logs summary

**Logic:**
- Validate admin token
- Aggregate data from Tickets collection for today
- Count users by role
- Count scan logs for today
- Return statistics object

---

### User Endpoints (Protected - Require User Token)

#### GET /api/user/tickets/available
**Purpose:** Get available ticket for today

**Response:**
- Success: Ticket info if available for purchase
- Message if no tickets available
- Message if user already purchased today

**Logic:**
- Validate user token
- Get current date
- Check if user already purchased ticket today (query Tickets where purchasedBy = userId AND generatedDate = today)
- If already purchased, return message "Already purchased today's ticket"
- If not, return available ticket info
- Return response

#### POST /api/user/tickets/purchase
**Purpose:** Purchase today's ticket

**Request Body:**
- ticketId (string, optional - can auto-assign)

**Response:**
- Success: Purchased ticket with QR code data
- Failure: Error message

**Logic:**
- Validate user token
- Get current date
- Check if user already purchased ticket today
- If already purchased, return error "You can only purchase one ticket per day"
- Find available ticket for today (status = 'available', generatedDate = today)
- Update ticket:
  - Set status to 'purchased'
  - Set purchasedBy to user's userId
  - Set purchasedAt to current timestamp
- Create entry in PurchaseHistory (optional)
- Return ticket data with QR code information

#### GET /api/user/tickets/my-ticket
**Purpose:** Get user's current ticket (if purchased today)

**Response:**
- Success: User's ticket with QR code
- Message: "No ticket purchased for today"

**Logic:**
- Validate user token
- Get current date
- Query Tickets where purchasedBy = userId AND generatedDate = today
- If found, return ticket with QR code data
- If not found, return message
- Return response

#### GET /api/user/tickets/history
**Purpose:** Get user's purchase history

**Query Parameters:**
- limit (number of past tickets to retrieve)

**Response:**
- Array of past purchased tickets

**Logic:**
- Validate user token
- Query Tickets where purchasedBy = userId, sorted by generatedDate descending
- Exclude today's ticket (show only past)
- Limit results
- Return ticket history

---

### Scanner Endpoints (Protected - Require Staff Token)

#### POST /api/scanner/validate
**Purpose:** Validate scanned QR code

**Request Body:**
- qrCodeData (string, raw data from QR code)

**Response:**
- Success: Validation result with ticket details
- Failure: Specific error message

**Logic:**
- Validate staff token
- Parse QR code data to extract ticketId, date, etc.
- Find ticket in database by ticketId
- **Validation Checks:**
  1. **Check if ticket exists:** If not found, return error "Invalid ticket - not in system"
  2. **Check date:** Compare ticket's generatedDate with today's date
     - If not today, return error "Expired ticket - from previous day"
  3. **Check status:** If status is 'used', return error "Ticket already used"
  4. **Check if purchased:** If status is 'available' (not purchased), return error "Ticket not purchased"
- **If all checks pass:**
  - Update ticket status to 'used'
  - Set usedAt to current timestamp
  - Set scannedBy to staff userId
  - Create log entry in ScanLogs (result: 'success')
  - Return success response with user info
- **If any check fails:**
  - Create log entry in ScanLogs with appropriate failure reason
  - Return specific error message
  - Do NOT update ticket status

#### GET /api/scanner/logs
**Purpose:** Get scan history

**Query Parameters:**
- date (filter by date, default: today)
- result (filter by result type)
- limit (pagination)

**Response:**
- Array of scan logs
- Statistics (total scans, successful, failed)

**Logic:**
- Validate staff token
- Query ScanLogs collection with filters
- Populate ticket and user information
- Calculate statistics
- Return logs with stats

#### GET /api/scanner/stats
**Purpose:** Get scanning statistics for today

**Response:**
- Total scans today
- Successful validations
- Failed validations (breakdown by reason)

**Logic:**
- Validate staff token
- Aggregate ScanLogs for today
- Group by scanResult
- Return statistics

---

## Business Logic Rules

### Rule 1: One Ticket Per User Per Day
**Implementation:**
- When user attempts to purchase, check Tickets collection for existing purchase
- Query: `{ purchasedBy: userId, generatedDate: today, status: { $in: ['purchased', 'used'] } }`
- If found, reject purchase with error message
- Enforce at API level (user/tickets/purchase endpoint)

### Rule 2: Daily Ticket Expiration
**Implementation:**
- All validation checks must compare ticket's generatedDate with current date
- In scanner/validate endpoint, if dates don't match, immediately reject
- Old tickets remain in database for records but are unusable

### Rule 3: One-Time Use Tickets
**Implementation:**
- After successful scan, update ticket status to 'used'
- Set usedAt timestamp
- In subsequent scans, check status first
- If status is 'used', reject with "already used" message

### Rule 4: Valid Tickets Only
**Implementation:**
- Every ticket must exist in database with valid ticketId
- Tickets must be generated by admin (have valid generatedDate)
- QR code data must match database records
- Reject any QR code that doesn't match database

### Rule 5: Admin-Only User Creation
**Implementation:**
- No public user registration endpoint
- Only admin/users/create endpoint exists
- Requires admin JWT token
- Users receive credentials from admin

---

## Security Implementation

### Password Security
- Use bcrypt to hash all passwords before storing
- Use salt rounds of 10-12
- Never return password in API responses
- Implement password strength validation

### JWT Token Security
- Sign tokens with strong secret key (store in environment variable)
- Set appropriate expiration time (e.g., 24 hours)
- Include user role in token payload
- Validate token on all protected routes

### API Protection
- Implement rate limiting to prevent abuse
- Use helmet.js for security headers
- Enable CORS with proper configuration
- Validate all inputs with express-validator or Joi
- Sanitize user inputs to prevent injection attacks

### Role-Based Access Control
- Middleware to check JWT token
- Middleware to check user role (admin, user, staff)
- Protect admin endpoints with admin role check
- Protect user endpoints with user role check
- Protect scanner endpoints with staff role check

---

## Middleware

### Authentication Middleware
**Purpose:** Verify JWT token on protected routes

**Logic:**
- Extract token from Authorization header (Bearer token)
- Verify token using JWT secret
- Decode token to get user info
- Attach user data to request object
- If invalid, return 401 Unauthorized

### Role Authorization Middleware
**Purpose:** Check if user has required role

**Logic:**
- Check user role from decoded token
- Compare with required role for endpoint
- If doesn't match, return 403 Forbidden

### Validation Middleware
**Purpose:** Validate request data

**Logic:**
- Use validation library to check request body/params
- Validate data types, required fields, formats
- Return 400 Bad Request if validation fails

### Error Handling Middleware
**Purpose:** Centralized error handling

**Logic:**
- Catch all errors from routes
- Format error responses consistently
- Log errors for debugging
- Return appropriate status codes

---

## Database Setup Steps

### Initial Setup

1. **Install MongoDB:**
   - Install MongoDB locally or use MongoDB Atlas (cloud)
   - Create database named 'ticketSystem' or similar

2. **Install Mongoose:**
   - Add mongoose to project dependencies

3. **Configure Connection:**
   - Create database connection file
   - Use connection string from environment variable
   - Handle connection errors
   - Set up connection pooling

4. **Create Schema Files:**
   - Create separate schema file for each collection
   - Define schema with proper data types and validations
   - Add indexes for performance
   - Create and export models

5. **Seed Initial Data:**
   - Create script to add initial admin user
   - Hash admin password
   - Store in Users collection

---

## Project Structure

Recommended folder structure:

```
/backend
  /config
    - database.js (MongoDB connection)
    - auth.js (JWT configuration)
  /models
    - User.js
    - Ticket.js
    - ScanLog.js
    - PurchaseHistory.js
  /routes
    - auth.routes.js
    - admin.routes.js
    - user.routes.js
    - scanner.routes.js
  /controllers
    - auth.controller.js
    - admin.controller.js
    - user.controller.js
    - scanner.controller.js
  /middleware
    - auth.middleware.js
    - role.middleware.js
    - validation.middleware.js
    - error.middleware.js
  /utils
    - qrcode.util.js (QR code generation/parsing helpers)
    - date.util.js (date comparison helpers)
    - response.util.js (standard response formatting)
  /validators
    - user.validator.js
    - ticket.validator.js
  - server.js (main entry point)
  - .env (environment variables)
  - package.json
```

---

## Environment Variables

Create .env file with:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ticketSystem
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=24h
NODE_ENV=development
BCRYPT_ROUNDS=10
```

---

## Development Setup Steps

### 1. Initialize Project
- Create new directory for backend
- Run npm init to create package.json
- Set up Git repository

### 2. Install Dependencies
**Core:**
- express (web framework)
- mongoose (MongoDB ODM)
- dotenv (environment variables)

**Security:**
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- helmet (security headers)
- cors (cross-origin resource sharing)
- express-rate-limit (rate limiting)

**Validation:**
- express-validator or joi (input validation)

**Utilities:**
- moment or date-fns (date handling)
- uuid (unique ID generation)

**Development:**
- nodemon (auto-restart during development)

### 3. Create Project Structure
- Set up folder structure as outlined above
- Create all necessary files

### 4. Configure Database
- Create database configuration file
- Set up MongoDB connection
- Test connection

### 5. Define Models
- Create Mongoose schemas for all collections
- Add validation rules
- Create indexes
- Export models

### 6. Create Middleware
- Authentication middleware for JWT verification
- Role-based authorization middleware
- Input validation middleware
- Error handling middleware

### 7. Implement Controllers
- Write business logic for each endpoint
- Keep controllers focused on single responsibility
- Use async/await for database operations
- Implement proper error handling

### 8. Define Routes
- Create route files for each module
- Apply appropriate middleware to routes
- Group related endpoints

### 9. Create Main Server File
- Import all dependencies
- Connect to database
- Set up middleware (body parser, cors, helmet, etc.)
- Register routes
- Error handling
- Start server

### 10. Test Endpoints
- Use Postman or similar tool
- Test each endpoint individually
- Test authentication flow
- Test error scenarios
- Test business rules

---

## QR Code Data Format

### Structure
The QR code should contain a string with all necessary information, separated by a delimiter (e.g., pipe `|`).

**Format:**
```
ticketId|userId|date|time
```

**Example:**
```
TKT-20250315-001|USR-1234|2025-03-15|10:30:00
```

### Generation (Admin Side)
- When generating tickets, create ticketId in format: `TKT-YYYYMMDD-###`
- Generate timestamp
- Store complete string in qrCodeData field
- Frontend will generate actual QR image from this string

### Parsing (Scanner Side)
- Split QR code data by delimiter
- Extract ticketId, userId, date, time
- Use ticketId to query database
- Validate date against ticket's generatedDate
- Cross-check all information

---

## Error Handling

### Standard Error Response Format
All errors should return consistent format:
```
{
  success: false,
  error: {
    message: "Descriptive error message",
    code: "ERROR_CODE",
    details: {} // optional additional info
  }
}
```

### Success Response Format
```
{
  success: true,
  data: {}, // response data
  message: "Optional success message"
}
```

### Common Error Codes
- AUTH_FAILED: Authentication failed
- INVALID_TOKEN: JWT token invalid/expired
- FORBIDDEN: Insufficient permissions
- NOT_FOUND: Resource not found
- ALREADY_EXISTS: Duplicate resource
- VALIDATION_ERROR: Input validation failed
- TICKET_ALREADY_PURCHASED: User already bought ticket today
- TICKET_ALREADY_USED: Ticket already scanned
- TICKET_EXPIRED: Ticket from previous day
- INVALID_TICKET: Ticket not in system

---

## Performance Considerations

### Database Optimization
- Add indexes on frequently queried fields (userId, ticketId, generatedDate, status)
- Use compound indexes where beneficial
- Implement pagination for large result sets
- Use lean() for read-only queries (faster)
- Use select() to retrieve only needed fields

### Caching (Optional Enhancement)
- Cache today's valid tickets in memory
- Cache user authentication data
- Clear cache at midnight (daily reset)
- Use Redis for distributed caching if needed

### Query Optimization
- Avoid N+1 queries with proper population
- Use aggregation for complex statistics
- Limit result sets with pagination
- Use projection to return only necessary fields

---

## Testing Strategy

### Unit Tests
- Test individual functions
- Test business logic rules
- Test validation functions
- Test QR code parsing

### Integration Tests
- Test API endpoints
- Test database operations
- Test authentication flow
- Test ticket purchase flow
- Test validation flow

### Test Scenarios
1. Admin creates 1000 tickets - verify all created correctly
2. User purchases ticket - verify status changes and rules enforced
3. User tries to purchase second ticket - verify rejection
4. Scanner validates fresh ticket - verify success
5. Scanner tries same ticket again - verify rejection
6. Scanner tries yesterday's ticket - verify rejection
7. Scanner tries fake ticket - verify rejection
8. User logs in with correct credentials - verify success
9. User logs in with wrong password - verify failure
10. Unauthorized access to protected routes - verify 401

---

## Deployment Considerations

### Environment Setup
- Use production MongoDB instance (MongoDB Atlas recommended)
- Set strong JWT secret
- Enable all security features
- Set appropriate CORS origins
- Configure rate limiting

### Server Requirements
- Node.js LTS version installed
- Adequate memory for operations
- SSL certificate for HTTPS
- Reverse proxy (nginx) recommended

### Monitoring
- Log all critical operations
- Monitor database performance
- Track API response times
- Alert on errors
- Monitor daily ticket generation

---

## Daily Maintenance Tasks

### Automated Jobs
Consider implementing scheduled tasks (cron jobs) for:

1. **Midnight Reset:**
   - Clear previous day's available tickets
   - Prepare for new day's ticket generation
   - Archive old data if needed

2. **Daily Statistics:**
   - Generate daily report
   - Calculate usage metrics
   - Store in separate analytics collection

3. **Cleanup:**
   - Remove very old scan logs (after 90 days)
   - Archive old tickets (after 30 days)

---

## API Documentation

Once built, document all endpoints with:
- Endpoint URL and method
- Required authentication
- Request body/params format
- Response format
- Example requests
- Example responses
- Error codes

Consider using Swagger/OpenAPI for automatic documentation generation.

---

## Future Enhancements

### Scalability
- Implement microservices architecture if needed
- Add Redis for caching and session management
- Use message queues for ticket generation
- Implement websockets for real-time updates

### Features
- Add ticket analytics dashboard
- Implement email/SMS notifications
- Add payment gateway integration
- Support for multiple event types
- Ticket categories (VIP, regular, etc.)
- Waitlist functionality

### Security
- Implement 2FA for admin accounts
- Add API key authentication for mobile apps
- Implement IP whitelisting for admin panel
- Add audit logging for all admin actions

---

## Notes

- Always validate input data before processing
- Use transactions for critical operations
- Implement proper logging for debugging
- Keep error messages user-friendly but informative
- Test all business rules thoroughly
- Document code with comments
- Follow consistent naming conventions
- Use environment variables for all configuration
- Never commit sensitive data to version control
- Regularly backup database
