# Scanner Mobile App - Ticket Management System

A React Native mobile application built with Expo for restaurant staff to scan and validate customer tickets.

## Features

- **Login**: Staff authentication
- **QR Scanner**: Real-time QR code scanning with camera
- **Validation**: Instant ticket validation with visual/audio feedback
- **Scan History**: View today's scan logs with statistics
- **Result Display**: Clear success/failure indicators

## Tech Stack

- Expo SDK ~54
- React Native
- TypeScript
- React Navigation
- Expo Camera for QR scanning
- Axios for API calls
- AsyncStorage for local data storage

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Expo Go app installed on your mobile device
- Backend API running (see backend documentation)
- Camera permission on device

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
4. Grant camera permission when prompted
5. The app will load on your device

## Project Structure

```
scanner-app/
├── src/
│   ├── screens/          # App screens (Login, Scanner, History)
│   ├── navigation/       # Navigation configuration
│   ├── services/         # API service functions
│   ├── context/          # React context providers
│   └── config/           # API configuration
├── App.tsx              # Main app entry point
└── app.json             # Expo configuration
```

## Features Details

### QR Code Scanning
- Real-time QR code detection
- Visual scanning guide/frame
- Instant validation feedback
- Vibration feedback for success/failure

### Validation Results
- **Success**: Green checkmark, "Valid Ticket", ticket details
- **Failure**: Red X, specific error message (Already Used, Invalid, Expired)
- Auto-dismiss after 2-3 seconds or manual "Next" button

### Scan History
- View all scans for today
- Filter by success/failure
- Statistics: total scans, successful, failed
- Detailed log with timestamps

## Notes

- Make sure the backend API is running before starting the app
- For local development, use your computer's IP address instead of localhost in API_URL
- Example: `API_URL=http://192.168.1.100:5000/api` (replace with your IP)
- Camera permission is required and will be requested on first launch
- The scanner works best in well-lit conditions

