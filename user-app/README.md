# User Mobile App - Ticket Management System

A React Native mobile application built with Expo for users to purchase and display daily tickets.

## Features

- **Login**: Secure authentication with User ID and Password
- **Ticket Purchase**: Purchase daily tickets (one per day)
- **QR Code Display**: Display purchased ticket QR code for scanning
- **Purchase History**: View past ticket purchases
- **Profile**: User information and logout

## Tech Stack

- Expo SDK ~54
- React Native
- TypeScript
- React Navigation
- Axios for API calls
- react-native-qrcode-svg for QR code generation
- AsyncStorage for local data storage

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Expo Go app installed on your mobile device
- Backend API running (see backend documentation)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Update `.env` file with your API URL:
```
API_URL=http://localhost:5000/api
```

3. Start the Expo development server:
```bash
npm start
```

4. Scan the QR code with Expo Go app (iOS/Android)

### Running on Device

1. Install Expo Go from App Store (iOS) or Google Play (Android)
2. Run `npm start` in the project directory
3. Scan the QR code displayed in terminal/browser with Expo Go
4. The app will load on your device

## Project Structure

```
user-app/
├── src/
│   ├── screens/          # App screens (Login, Home, Profile)
│   ├── navigation/       # Navigation configuration
│   ├── services/         # API service functions
│   ├── context/          # React context providers
│   └── config/           # API configuration
├── App.tsx              # Main app entry point
└── app.json             # Expo configuration
```

## Features Details

### One Ticket Per Day
- Users can only purchase one ticket per day
- After purchase, the QR code is displayed
- Old tickets are marked as expired

### QR Code
- QR codes contain ticket data (ticketId, userId, date, time)
- Large, clear display for easy scanning
- Valid for today only

## Notes

- Make sure the backend API is running before starting the app
- For local development, use your computer's IP address instead of localhost in API_URL
- Example: `API_URL=http://192.168.1.100:5000/api` (replace with your IP)

