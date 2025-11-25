# Frontend Documentation - Ticket Management System

## Overview
This document outlines the frontend architecture for a daily ticket management system consisting of three separate applications: an Admin Panel (web), a User Mobile App, and a Scanner Mobile App.

---

## 1. Admin Panel (Next.js + React)

### Purpose
Web-based control center for managing the entire ticket system, creating users, generating daily tickets, and monitoring system activity.

### Key Features

#### Dashboard Overview
- Display total tickets generated for today
- Show how many tickets are available, purchased, and used
- Real-time statistics and activity feed
- Quick access to main functions

#### User Management Section
- Create new user accounts with unique IDs and passwords
- View list of all registered users
- Search and filter users
- Edit user information
- Deactivate/activate user accounts
- Export user credentials for distribution

#### Ticket Generation Section
- Input field to specify number of tickets to generate (e.g., 1000)
- Generate button that creates tickets for the current day
- Display confirmation of successful generation
- Show list of generated tickets with their QR codes
- Each ticket should display: unique ID, generation date/time, status (available/purchased/used)

#### Ticket Management
- View all tickets for current day
- Filter tickets by status (available, purchased, used)
- Search tickets by user ID or ticket ID
- View which user purchased which ticket
- Manual ticket status updates if needed

#### Historical Data
- View past day's ticket data
- Statistics on daily ticket usage
- User purchase history

### Pages/Routes Needed

1. **Login Page**
   - Admin authentication
   - Secure access only

2. **Dashboard (Home)**
   - Overview of today's activity
   - Quick stats and charts

3. **Generate Tickets**
   - Form to create daily ticket batch
   - Confirmation and success messages

4. **Manage Tickets**
   - Table view of all tickets
   - Filtering and search capabilities

5. **Manage Users**
   - User creation form
   - User list with actions (edit, deactivate)

6. **Reports/History**
   - Past data visualization
   - Export capabilities

### UI/UX Considerations

- Clean, professional dashboard design
- Responsive layout for different screen sizes
- Clear navigation menu (sidebar or top nav)
- Use tables for data display with sorting capabilities
- Modal dialogs for creating users and generating tickets
- Toast notifications for success/error messages
- Loading states for all async operations
- Color coding for ticket statuses (green=available, blue=purchased, gray=used)

### State Management
- Consider using Context API or Redux for global state
- Manage admin authentication state
- Cache frequently accessed data
- Real-time updates if possible (or manual refresh)

### API Integration
- Connect to Node.js backend endpoints
- Handle authentication tokens
- Error handling for failed requests
- Loading states during data fetching

---

## 2. User Mobile App (React Native)

### Purpose
Mobile application for users to log in, view available tickets, and purchase their daily ticket.

### Key Features

#### Login Screen
- Input fields for User ID and Password (provided by admin)
- Login button
- Error messages for invalid credentials
- "Remember me" option (optional)

#### Home/Tickets Screen
- Display available ticket for today
- Show if user has already purchased today's ticket
- If not purchased: "Buy Ticket" button
- If purchased: Display QR code prominently
- Show ticket details: date, time, ticket ID

#### QR Code Display
- Large, clear QR code display
- Ticket information below QR code
- User ID displayed
- Date and time of purchase
- Ticket unique identifier
- "This ticket is valid for today only" message

#### Profile/Account Screen
- User information
- Purchase history (list of past tickets)
- Logout button

### Navigation Structure
- Bottom tab navigation or drawer navigation
- Tabs: Home, My Ticket, Profile

### UI/UX Considerations

- Simple, intuitive interface
- Large buttons for easy tapping
- Clear visibility of QR code (full screen option)
- Confirmation dialog before purchase
- Success message after purchase
- Prevent accidental logout
- Offline mode consideration (show cached QR if already purchased)

### Key Rules to Implement

1. **One Ticket Per Day Rule**
   - After purchasing, hide "Buy" button
   - Show purchased ticket with QR code
   - Prevent multiple purchase attempts

2. **Daily Reset Logic**
   - Check if displayed ticket is from today
   - If showing old ticket, indicate it's expired
   - Automatically refresh available tickets each day

3. **QR Code Generation**
   - Generate QR code from ticket data received from backend
   - Ensure QR code contains: ticket ID, user ID, date, time

### State Management
- User authentication state
- Current ticket status (purchased/not purchased)
- Ticket data (QR code info, date, time)
- User profile information

### API Integration
- Login endpoint
- Fetch available tickets
- Purchase ticket endpoint
- Get user's current ticket
- Check ticket validity

---

## 3. Scanner Mobile App (React Native)

### Purpose
Mobile application used by restaurant staff to scan and validate customer tickets at entry point.

### Key Features

#### Login Screen
- Staff authentication
- Secure access

#### Scanner Screen (Main Screen)
- Camera view with QR code scanning overlay
- Scan guide/frame to help users position QR code
- Instructions: "Point camera at QR code"

#### Validation Result Display
- **Success State:**
  - Green checkmark icon
  - "Valid Ticket" message
  - Display ticket details: User ID, Ticket ID, Time
  - Sound/haptic feedback
  - Auto-dismiss after 2-3 seconds or manual "Next" button

- **Failure States:**
  - Red X icon with specific error message:
    - "Ticket Already Used"
    - "Invalid Ticket - Not in System"
    - "Expired Ticket - From Previous Day"
  - Sound/haptic feedback (different from success)
  - "Deny Entry" clear indication
  - Manual dismiss button

#### History/Log Screen
- List of scanned tickets today
- Show timestamp, result (allowed/denied), user ID
- Filter by success/failure
- Statistics: total scans, successful entries, denied entries

### Navigation Structure
- Bottom tabs: Scanner, History, Logout

### Validation Logic Flow

When QR code is scanned:

1. **Parse QR Code Data**
   - Extract ticket ID, user ID, date, time

2. **Send to Backend for Validation**
   - Backend checks if ticket exists in database
   - Backend checks if ticket date matches today
   - Backend checks if ticket status is "purchased" (not already "used")

3. **Receive Validation Result**
   - If all checks pass: Show success, backend marks ticket as "used"
   - If any check fails: Show specific error message

4. **Display Result**
   - Visual and audio feedback
   - Log the scan event

### UI/UX Considerations

- Fast scanning response (optimize for speed)
- Large, clear success/failure indicators
- Color coding: Green for success, Red for failure
- Continuous scanning mode (ready for next scan immediately)
- Manual flashlight toggle for low light
- Vibration feedback
- Sound toggle option
- Easy to use in busy restaurant environment

### Offline Considerations
- Cache today's valid ticket list for offline validation
- Queue failed validations for sync when online
- Clear offline indicator

### State Management
- Staff authentication state
- Scan history data
- Current scan result
- Camera permissions

### API Integration
- Login endpoint
- Validate ticket endpoint (primary function)
- Submit scan log
- Fetch scan history

---

## Technology Stack Summary

### Admin Panel
- **Framework:** Next.js 14+ (App Router)
- **UI Library:** React 18+
- **Styling:** Tailwind CSS or Material-UI
- **State Management:** Context API or Redux Toolkit
- **HTTP Client:** Axios or Fetch API
- **QR Code Display:** react-qr-code library

### Mobile Apps (User & Scanner)
- **Framework:** React Native (latest stable)
- **Navigation:** React Navigation
- **State Management:** Context API or Redux Toolkit
- **HTTP Client:** Axios
- **QR Code Generation (User App):** react-native-qrcode-svg
- **QR Code Scanning (Scanner App):** react-native-camera or expo-camera
- **Storage:** AsyncStorage for local data
- **UI Components:** React Native Paper or Native Base

---

## Development Setup Steps

### Admin Panel Setup

1. **Initialize Next.js Project**
   - Create new Next.js app with TypeScript (optional)
   - Set up project structure: pages/app directory, components, utils, styles

2. **Install Dependencies**
   - UI component library
   - HTTP client (axios)
   - QR code library
   - State management library
   - Form handling library (react-hook-form)

3. **Configure Environment**
   - Create .env.local file for API endpoint URLs
   - Set up environment variables

4. **Create Folder Structure**
   - /components (reusable UI components)
   - /pages or /app (route pages)
   - /utils (helper functions)
   - /services (API calls)
   - /context or /store (state management)
   - /styles (global styles)

5. **Build Core Components**
   - Layout component with navigation
   - Login form component
   - User creation form
   - Ticket generation form
   - Data tables for tickets and users
   - Dashboard statistics cards

6. **Implement Pages**
   - Login page
   - Dashboard
   - Generate tickets page
   - Manage tickets page
   - Manage users page
   - Reports page

7. **Connect to Backend**
   - Create API service functions
   - Implement authentication flow
   - Handle API responses and errors

### User Mobile App Setup

1. **Initialize React Native Project**
   - Create new React Native app (or Expo project)
   - Set up development environment

2. **Install Dependencies**
   - Navigation library
   - HTTP client
   - QR code generation library
   - AsyncStorage
   - UI component library

3. **Configure Environment**
   - Set up .env for API URLs
   - Configure app permissions in manifest files

4. **Create Folder Structure**
   - /screens (app screens)
   - /components (reusable components)
   - /navigation (navigation configuration)
   - /services (API calls)
   - /context or /store (state management)
   - /utils (helper functions)

5. **Build Screens**
   - Login screen
   - Home/Tickets screen
   - QR code display screen
   - Profile screen

6. **Implement Navigation**
   - Set up stack or tab navigation
   - Configure navigation flow

7. **Connect to Backend**
   - Create API service layer
   - Implement authentication
   - Handle purchase flow
   - Generate and display QR codes

### Scanner Mobile App Setup

1. **Initialize React Native Project**
   - Similar to User App setup

2. **Install Dependencies**
   - Navigation library
   - Camera/QR scanner library
   - HTTP client
   - AsyncStorage
   - UI components

3. **Configure Permissions**
   - Camera permission in AndroidManifest.xml
   - Camera permission in Info.plist (iOS)

4. **Create Folder Structure**
   - Same as User App structure

5. **Build Screens**
   - Login screen
   - Scanner screen with camera view
   - Result display screen
   - History/log screen

6. **Implement Scanner Logic**
   - Set up camera component
   - Configure QR code detection
   - Parse scanned QR data
   - Send to backend for validation
   - Display results

7. **Connect to Backend**
   - Validation API calls
   - Logging scan events
   - Fetch scan history

---

## Security Considerations

### Admin Panel
- Implement secure authentication
- Use HTTPS for all API calls
- Store authentication tokens securely
- Implement session timeout
- Add CSRF protection
- Validate all inputs

### User Mobile App
- Secure credential storage (use secure storage libraries)
- Token-based authentication
- Handle token refresh
- Secure QR code data
- Prevent screenshot of QR code (optional)

### Scanner Mobile App
- Staff authentication required
- Secure communication with backend
- Validate all scanned data
- Log all scan attempts
- Prevent tampering with scan results

---

## Testing Considerations

- Test one-ticket-per-day rule thoroughly
- Test ticket expiration (old tickets)
- Test duplicate scan prevention
- Test fake QR code detection
- Test offline scenarios
- Test with various devices and screen sizes
- Test camera scanning in different lighting conditions
- Test API error handling

---

## Future Enhancements (Optional)

- Push notifications for users when new tickets available
- Analytics dashboard for admin
- Export reports to PDF/Excel
- Multi-language support
- Dark mode
- Ticket transferability (if needed)
- Payment integration (if needed later)
- Email/SMS notifications with ticket QR code

---

## Notes

- Keep user interface simple and intuitive
- Focus on performance - QR scanning should be fast
- Ensure clear error messages for users
- Make admin panel powerful but easy to use
- Test thoroughly with real-world scenarios
- Consider network failures and handle gracefully
